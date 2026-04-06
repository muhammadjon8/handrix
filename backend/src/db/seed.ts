/**
 * Seed script — run with: npx ts-node src/db/seed.ts
 * Populates pricing_config with default rates for MVP job types.
 */
import { db } from './index';
import { pricingConfig } from './schema';
import 'dotenv/config';

const DEFAULT_PRICING = [
  { jobType: 'pipe_leak',         laborRatePerHour: 45, transportFee: 10, markupPct: 0.15 },
  { jobType: 'electrical_fault',  laborRatePerHour: 55, transportFee: 10, markupPct: 0.15 },
  { jobType: 'door_hinge',        laborRatePerHour: 30, transportFee: 8,  markupPct: 0.15 },
  { jobType: 'ac_service',        laborRatePerHour: 50, transportFee: 12, markupPct: 0.15 },
  { jobType: 'wall_painting',     laborRatePerHour: 35, transportFee: 8,  markupPct: 0.10 },
  { jobType: 'lock_replacement',  laborRatePerHour: 40, transportFee: 8,  markupPct: 0.15 },
  { jobType: 'appliance_repair',  laborRatePerHour: 50, transportFee: 10, markupPct: 0.15 },
  { jobType: 'general_handyman',  laborRatePerHour: 35, transportFee: 8,  markupPct: 0.15 },
];

async function seed() {
  console.log('🌱 Seeding pricing_config...');

  for (const row of DEFAULT_PRICING) {
    await db
      .insert(pricingConfig)
      .values(row)
      .onConflictDoUpdate({
        target: pricingConfig.jobType,
        set: {
          laborRatePerHour: row.laborRatePerHour,
          transportFee: row.transportFee,
          markupPct: row.markupPct,
        },
      });
    console.log(`  ✓ ${row.jobType}`);
  }

  console.log('✅ Pricing config seeded successfully.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
