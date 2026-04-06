import { Injectable, Logger } from '@nestjs/common';
import { db } from '../db';
import { jobs, jobParts, handymen } from '../db/schema';
import { CreateJobDto } from './jobs.dto';
import { eq, desc } from 'drizzle-orm';
import { SocketGateway } from '../socket/socket.gateway';
import { DispatchService } from '../dispatch/dispatch.service';

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);

  constructor(
    private readonly socketGateway: SocketGateway,
    private readonly dispatchService: DispatchService
  ) {}

  async updateStatus(jobId: number, status: 'pending' | 'dispatching' | 'en_route' | 'on_site' | 'completed' | 'cancelled') {
    const [updatedJob] = await db
      .update(jobs)
      .set({ status })
      .where(eq(jobs.id, jobId))
      .returning();

    if (updatedJob) {
      // 1. Notify Client
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
    }

    return updatedJob;
  }

  async acceptJob(jobId: number, handymanUserId: number) {
    return await db.transaction(async (tx) => {
      // Find the handyman profile
      const handyman = await tx.query.handymen.findFirst({
        where: eq(handymen.userId, handymanUserId)
      });

      if (!handyman) {
        throw new Error('Handyman profile not found for this user');
      }

      // Check job status
      const job = await tx.query.jobs.findFirst({
        where: eq(jobs.id, jobId)
      });

      if (!job) {
        throw new Error('Job not found');
      }

      if (job.status !== 'dispatching' && job.status !== 'pending') {
        throw new Error(`Job cannot be accepted in its current status: ${job.status}`);
      }

      // Update the job: set handymanId and status to en_route
      const [updatedJob] = await tx
        .update(jobs)
        .set({ 
          handymanId: handyman.id,
          status: 'en_route',
        })
        .where(eq(jobs.id, jobId))
        .returning();

      // Notify the client that the handyman accepted and is on the way
      this.socketGateway.emitToUser(updatedJob.clientId, 'job_status_update', {
        id: updatedJob.id,
        status: updatedJob.status,
        message: 'A handyman has accepted your job and is on the way!',
      });

      return updatedJob;
    });
  }
  async create(clientId: number, dto: CreateJobDto) {
    const result = await db.transaction(async (tx) => {
      // 1. Calculate parts total from dto
      const parts_total = dto.parts.reduce((sum, p) => sum + p.quantity * p.unit_cost, 0);
      const total_price = dto.labor_cost + dto.transport_fee + parts_total;

      // 2. Insert main job record
      const [newJob] = await tx
        .insert(jobs)
        .values({
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
        })
        .returning();

      // 3. Insert job parts if any
      if (dto.parts.length > 0) {
        await tx.insert(jobParts).values(
          dto.parts.map((p) => ({
            jobId: newJob.id,
            name: p.name,
            quantity: p.quantity,
            unitCost: p.unit_cost,
            totalCost: p.quantity * p.unit_cost,
          })),
        );
      }

      return {
        id: newJob.id,
        status: newJob.status,
        total_price: total_price,
        created_at: newJob.createdAt,
      };
    });

    // Fire off the dispatch process in the background
    this.dispatchForJob(result.id, dto.latitude, dto.longitude, dto.job_type)
      .catch(err => this.logger.error(`Error dispatching job ${result.id}`, err));

    return result;
  }

  private async dispatchForJob(jobId: number, lat: number, lng: number, requiredSkill: string) {
    this.logger.log(`Initiating dispatch for job ${jobId}`);
    
    // Switch to dispatching status
    await this.updateStatus(jobId, 'dispatching');

    const nearestHandymen = await this.dispatchService.findNearestAvailableHandymen(lat, lng, requiredSkill);
    
    if (nearestHandymen.length === 0) {
      this.logger.warn(`No active Handymen near Job ${jobId} with skill ${requiredSkill}`);
      // Fallback: Notify admin or wait for someone to come online
      return;
    }

    // For MVP MVP, we just emit to all nearest to offer the job
    for (const handyman of nearestHandymen) {
      this.socketGateway.emitToUser(handyman.userId, 'new_job_available', {
        jobId,
        distanceKm: (handyman as any).distance
      });
    }
  }

  async findByClient(clientId: number) {
    return await db.query.jobs.findMany({
      where: eq(jobs.clientId, clientId),
      with: {
        jobParts: true,
      },
      orderBy: [desc(jobs.createdAt)],
    });
  }
}
