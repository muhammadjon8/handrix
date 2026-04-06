import { pgTable, serial, text, varchar, integer, timestamp, doublePrecision, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const userRoleEnum = pgEnum('user_role', ['client', 'handyman', 'admin']);
export const handymanStatusEnum = pgEnum('handyman_status', ['active', 'pending']);
export const handymanAvailabilityEnum = pgEnum('handyman_availability', ['available', 'on_job', 'offline']);
export const jobStatusEnum = pgEnum('job_status', ['dispatching', 'en_route', 'on_site', 'completed', 'cancelled']);

// 1. Users Table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: userRoleEnum('role').default('client').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 2. Handymen Table
export const handymen = pgTable('handymen', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull().unique(),
  skills: jsonb('skills').$type<string[]>().default([]).notNull(), // e.g. ["plumbing", "electrical"]
  serviceRadiusKm: integer('service_radius_km').default(20).notNull(),
  status: handymanStatusEnum('status').default('pending').notNull(),
  availability: handymanAvailabilityEnum('availability').default('offline').notNull(),
  latitude: doublePrecision('latitude'),
  longitude: doublePrecision('longitude'),
});

// 3. Jobs Table
export const jobs = pgTable('jobs', {
  id: serial('id').primaryKey(),
  clientId: integer('client_id').references(() => users.id).notNull(),
  handymanId: integer('handyman_id').references(() => handymen.id),
  status: jobStatusEnum('status').default('dispatching').notNull(),
  jobType: varchar('job_type', { length: 100 }).notNull(), // e.g. "pipe_leak"
  description: text('description').notNull(),
  address: text('address').notNull(),
  latitude: doublePrecision('latitude').notNull(),
  longitude: doublePrecision('longitude').notNull(),
  priceQuote: doublePrecision('price_quote'), // Estimated total
  priceFinal: doublePrecision('price_final'), // Captured total
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 4. Job Parts Table
export const jobParts = pgTable('job_parts', {
  id: serial('id').primaryKey(),
  jobId: integer('job_id').references(() => jobs.id).notNull(),
  partName: varchar('part_name', { length: 255 }).notNull(),
  quantity: integer('quantity').default(1).notNull(),
  unitCost: doublePrecision('unit_cost').notNull(),
  supplierOrderId: varchar('supplier_order_id', { length: 255 }),
});

// 5. Payments Table
export const payments = pgTable('payments', {
  id: serial('id').primaryKey(),
  jobId: integer('job_id').references(() => jobs.id).notNull(),
  stripePaymentIntentId: varchar('stripe_payment_intent_id', { length: 255 }).notNull(),
  amount: doublePrecision('amount').notNull(),
  status: varchar('status', { length: 50 }).notNull(), // e.g. "requires_payment_method", "succeeded"
  capturedAt: timestamp('captured_at'),
});

// 6. Warranties Table
export const warranties = pgTable('warranties', {
  id: serial('id').primaryKey(),
  jobId: integer('job_id').references(() => jobs.id).notNull().unique(),
  clientId: integer('client_id').references(() => users.id).notNull(),
  issuedAt: timestamp('issued_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at').notNull(),
});

// 7. Pricing Config Table
export const pricingConfig = pgTable('pricing_config', {
  jobType: varchar('job_type', { length: 100 }).primaryKey(),
  laborRatePerHour: doublePrecision('labor_rate_per_hour').notNull(),
  transportFee: doublePrecision('transport_fee').default(0).notNull(),
  markupPct: doublePrecision('markup_pct').default(0.15).notNull(), // Default 15% markup on parts
});

// --- Relations ---

export const userRelations = relations(users, ({ one, many }) => ({
  handymanProfile: one(handymen, { fields: [users.id], references: [handymen.userId] }),
  jobs: many(jobs),
  warranties: many(warranties),
}));

export const handymanRelations = relations(handymen, ({ one, many }) => ({
  user: one(users, { fields: [handymen.userId], references: [users.id] }),
  jobs: many(jobs),
}));

export const jobRelations = relations(jobs, ({ one, many }) => ({
  client: one(users, { fields: [jobs.clientId], references: [users.id] }),
  handyman: one(handymen, { fields: [jobs.handymanId], references: [handymen.id] }),
  parts: many(jobParts),
  payment: one(payments, { fields: [jobs.id], references: [payments.jobId] }),
  warranty: one(warranties, { fields: [jobs.id], references: [warranties.jobId] }),
}));
