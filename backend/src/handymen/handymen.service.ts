import { Injectable, NotFoundException } from '@nestjs/common';
import { db } from '../db';
import { handymen } from '../db/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class HandymenService {
  async findByUserId(userId: number) {
    const handyman = await db.query.handymen.findFirst({
      where: eq(handymen.userId, userId),
    });
    if (!handyman) throw new NotFoundException('Handyman profile not found');
    return handyman;
  }

  async updateAvailability(userId: number, availability: 'available' | 'offline') {
    const handyman = await this.findByUserId(userId);
    const [updated] = await db
      .update(handymen)
      .set({ availability })
      .where(eq(handymen.id, handyman.id))
      .returning();
    return updated;
  }

  async updateLocation(userId: number, latitude: number, longitude: number) {
    const handyman = await this.findByUserId(userId);
    const [updated] = await db
      .update(handymen)
      .set({ latitude, longitude })
      .where(eq(handymen.id, handyman.id))
      .returning();
    return updated;
  }
}
