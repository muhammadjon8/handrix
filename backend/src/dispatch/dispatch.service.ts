import { Injectable, Logger } from '@nestjs/common';
import { db } from '../db';
import { handymen, jobs } from '../db/schema';
import { eq, and, sql } from 'drizzle-orm';

@Injectable()
export class DispatchService {
  private readonly logger = new Logger(DispatchService.name);

  /**
   * Finds the nearest available handymen for a given job coordinate.
   * Uses the Haversine formula to calculate distance in kilometers.
   */
  async findNearestAvailableHandymen(jobLat: number, jobLng: number, requiredSkill?: string) {
    // Haversine formula in SQL for Kilometers (Earth radius = 6371 km)
    const distanceQuery = sql`
      6371 * acos(
        cos(radians(${jobLat})) * cos(radians(${handymen.latitude})) *
        cos(radians(${handymen.longitude}) - radians(${jobLng})) +
        sin(radians(${jobLat})) * sin(radians(${handymen.latitude}))
      )
    `;

    // Base conditions: must be active and available
    const conditions = [
      eq(handymen.status, 'active'),
      eq(handymen.availability, 'available')
    ];

    // Note: Drizzle's JSONB array querying can be tricky, 
    // for MVP we can execute a raw where clause if skill filtering is complex,
    // or fetch all available and filter in memory if the dataset is small.
    // For now, we'll let PostGres do the distance sorting.

    const nearestHandymen = await db
      .select({
        id: handymen.id,
        userId: handymen.userId,
        skills: handymen.skills,
        serviceRadiusKm: handymen.serviceRadiusKm,
        distance: distanceQuery,
      })
      .from(handymen)
      .where(and(...conditions))
      .orderBy(distanceQuery)
      .limit(50); // Increased limit to reach more workers

    return nearestHandymen;
  }
}
