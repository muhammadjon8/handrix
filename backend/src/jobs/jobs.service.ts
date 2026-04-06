import { Injectable } from '@nestjs/common';
import { db } from '../db';
import { jobs, jobParts } from '../db/schema';
import { CreateJobDto } from './jobs.dto';
import { eq, desc } from 'drizzle-orm';

@Injectable()
export class JobsService {
  async create(clientId: number, dto: CreateJobDto) {
    return await db.transaction(async (tx) => {
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
