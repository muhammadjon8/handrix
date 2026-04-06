import { Injectable, NotFoundException } from '@nestjs/common';
import { db } from '../db';
import { pricingConfig } from '../db/schema';
import { eq } from 'drizzle-orm';
import { CalculatePriceDto, PriceQuoteResponseDto } from './pricing.dto';

const QUOTE_VALIDITY_MINUTES = 15;

@Injectable()
export class PricingService {
  async calculate(dto: CalculatePriceDto): Promise<PriceQuoteResponseDto> {
    // 1. Fetch config for this job type
    const config = await db.query.pricingConfig.findFirst({
      where: eq(pricingConfig.jobType, dto.job_type),
    });

    if (!config) {
      throw new NotFoundException(
        `No pricing config found for job type: "${dto.job_type}". ` +
          `Please seed the pricing_config table or use a valid job type.`,
      );
    }

    const { laborRatePerHour, transportFee, markupPct } = config;

    // 2. Calculate labor cost
    const labor_cost = parseFloat(
      (laborRatePerHour * dto.estimated_duration_hours).toFixed(2),
    );

    // 3. Calculate parts cost (with markup)
    const raw_parts_cost = dto.materials.reduce((sum, m) => {
      return sum + m.quantity * (m.unit_cost ?? 0);
    }, 0);
    const parts_cost = parseFloat((raw_parts_cost * (1 + markupPct)).toFixed(2));

    // 4. Total
    const total = parseFloat((labor_cost + parts_cost + transportFee).toFixed(2));

    // 5. Quote expiry (15 min from now)
    const quote_expires_at = new Date(
      Date.now() + QUOTE_VALIDITY_MINUTES * 60 * 1000,
    ).toISOString();

    return {
      labor_cost,
      parts_cost,
      transport_fee: transportFee,
      total,
      breakdown: {
        labor_rate_per_hour: laborRatePerHour,
        estimated_duration_hours: dto.estimated_duration_hours,
        markup_pct: markupPct,
        materials: dto.materials.map((m) => ({
          name: m.name,
          quantity: m.quantity,
          unit_cost: m.unit_cost ?? 0,
          subtotal: parseFloat((m.quantity * (m.unit_cost ?? 0)).toFixed(2)),
        })),
      },
      quote_expires_at,
    };
  }
}
