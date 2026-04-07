import { Injectable, Logger } from '@nestjs/common';
import { db } from '../db';
import { jobs, jobParts, handymen, warranties, users } from '../db/schema';
import { CreateJobDto } from './jobs.dto';
import { eq, desc, sql } from 'drizzle-orm';
import { SocketGateway } from '../socket/socket.gateway';
import { DispatchService } from '../dispatch/dispatch.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);

  constructor(
    private readonly socketGateway: SocketGateway,
    private readonly dispatchService: DispatchService,
    private readonly notifications: NotificationsService
  ) {}

  private async getClientEmail(clientId: number): Promise<string | null> {
    const user = await db.query.users.findFirst({
      where: eq(users.id, clientId)
    });
    return user?.email || null;
  }

  async updateStatus(jobId: number, status: 'pending' | 'dispatching' | 'en_route' | 'on_site' | 'completed' | 'cancelled') {
    const [updatedJob] = await db
      .update(jobs)
      .set({ status })
      .where(eq(jobs.id, jobId))
      .returning();

    if (updatedJob) {
      // 1. Notify Client via WebSockets
      this.socketGateway.emitToUser(updatedJob.clientId, 'job_status_update', {
        id: updatedJob.id,
        status: updatedJob.status,
      });

      // 2. Notify Handyman (if assigned)
      if (updatedJob.handymanId) {
        this.socketGateway.emitToUser(updatedJob.handymanId, 'job_status_update', {
          id: updatedJob.id,
          status: updatedJob.status,
        });
      }

      // 3. Task 2.12/2.15: If Job is Completed
      if (status === 'completed') {
        const expiresInDays = 90; // Default 90-day warranty
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + expiresInDays);

        try {
          await db.insert(warranties).values({
            jobId: updatedJob.id,
            clientId: updatedJob.clientId,
            expiresAt: expiresAt,
          });
          this.logger.log(`✅ 90-day Warranty issued for Job #${updatedJob.id}`);
          
          // Fire email notification
          const email = await this.getClientEmail(updatedJob.clientId);
          if (email) {
            await this.notifications.notifyJobCompleted(email, updatedJob.id);
          }
        } catch (err) {
          this.logger.error(`Error issuing warranty/notification for Job #${updatedJob.id}`, err);
        }
      }
    }

    return updatedJob;
  }

  async acceptJob(jobId: number, handymanUserId: number) {
    return await db.transaction(async (tx) => {
      const handyman = await tx.query.handymen.findFirst({
        where: eq(handymen.userId, handymanUserId)
      });
      if (!handyman) throw new Error('Handyman profile not found');

      const job = await tx.query.jobs.findFirst({ where: eq(jobs.id, jobId) });
      if (!job) throw new Error('Job not found');

      const [updatedJob] = await tx
        .update(jobs)
        .set({ handymanId: handyman.id, status: 'en_route' })
        .where(eq(jobs.id, jobId))
        .returning();

      // Notify the client via Socket
      this.socketGateway.emitToUser(updatedJob.clientId, 'job_status_update', {
        id: updatedJob.id,
        status: updatedJob.status,
        message: 'A handyman is on the way!',
      });

      // Task 2.12: Notify client via Email
      const email = await this.getClientEmail(updatedJob.clientId);
      if (email) {
        await this.notifications.notifyJobAccepted(email, updatedJob.id, `Handyman #${handyman.id}`);
      }

      return updatedJob;
    });
  }

  async create(clientId: number, dto: CreateJobDto) {
    const result = await db.transaction(async (tx) => {
      const parts_total = dto.parts.reduce((sum, p) => sum + p.quantity * p.unit_cost, 0);
      const total_price = dto.labor_cost + dto.transport_fee + parts_total;

      const [newJob] = await tx.insert(jobs).values({
        clientId,
        jobType: dto.job_type,
        description: dto.description,
        latitude: dto.latitude,
        longitude: dto.longitude,
        estimatedDurationHours: dto.estimated_duration_hours,
        laborCost: dto.labor_cost,
        transportFee: dto.transport_fee,
        totalPrice: total_price,
        status: 'pending',
      }).returning();

      if (dto.parts.length > 0) {
        await tx.insert(jobParts).values(dto.parts.map(p => ({
          jobId: newJob.id,
          name: p.name,
          quantity: p.quantity,
          unitCost: p.unit_cost,
          totalCost: p.quantity * p.unit_cost,
        })));
      }

      return { id: newJob.id, status: newJob.status, jobType: newJob.jobType };
    });

    // Task 2.12: Notify client about new booking
    const email = await this.getClientEmail(clientId);
    if (email) {
      await this.notifications.notifyNewJob(email, result.id, result.jobType);
    }

    this.dispatchForJob(result.id, dto.latitude, dto.longitude, dto.job_type)
      .catch(err => this.logger.error(`Error dispatching job ${result.id}`, err));

    return result;
  }

  private async dispatchForJob(jobId: number, lat: number, lng: number, requiredSkill: string) {
    await this.updateStatus(jobId, 'dispatching');
    const nearestHandymen = await this.dispatchService.findNearestAvailableHandymen(lat, lng, requiredSkill);
    if (nearestHandymen.length === 0) return;

    const job = await db.query.jobs.findFirst({ where: eq(jobs.id, jobId) });
    if (!job) return;

    for (const handyman of nearestHandymen) {
      this.socketGateway.emitToUser(handyman.userId, 'new_job_available', {
        ...job,
        job_type: job.jobType, // For frontend compatibility
        distance: (handyman as any).distance,
      });
    }
  }

  async findByClient(clientId: number) {
    return await db.query.jobs.findMany({
      where: eq(jobs.clientId, clientId),
      with: { jobParts: true, warranty: true },
      orderBy: [desc(jobs.createdAt)],
    });
  }

  async findDispatchingJobs(lat?: number, lng?: number) {
    if (lat && lng) {
      // Calculate distance using SQL if coordinates are provided
      const distanceQuery = sql<number>`(
        6371 * acos(
          cos(radians(${lat})) * cos(radians(${jobs.latitude})) *
          cos(radians(${jobs.longitude}) - radians(${lng})) +
          sin(radians(${lat})) * sin(radians(${jobs.latitude}))
        )
      )`;

      return await db
        .select({
          id: jobs.id,
          job_type: jobs.jobType,
          description: jobs.description,
          latitude: jobs.latitude,
          longitude: jobs.longitude,
          status: jobs.status,
          createdAt: jobs.createdAt,
          distance: distanceQuery,
        })
        .from(jobs)
        .where(eq(jobs.status, 'dispatching'))
        .orderBy(distanceQuery);
    }

    return await db.query.jobs.findMany({
      where: eq(jobs.status, 'dispatching'),
      orderBy: [desc(jobs.createdAt)],
    });
  }

  async findByHandyman(handymanUserId: number) {
    const handyman = await db.query.handymen.findFirst({ where: eq(handymen.userId, handymanUserId) });
    if (!handyman) return [];
    return await db.query.jobs.findMany({
      where: eq(jobs.handymanId, handyman.id),
      with: { jobParts: true, warranty: true },
      orderBy: [desc(jobs.createdAt)],
    });
  }
}
