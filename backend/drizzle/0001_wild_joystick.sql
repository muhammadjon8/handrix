ALTER TYPE "public"."job_status" ADD VALUE 'pending' BEFORE 'dispatching';--> statement-breakpoint
ALTER TABLE "job_parts" ALTER COLUMN "quantity" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "jobs" ALTER COLUMN "status" SET DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "job_parts" ADD COLUMN "name" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "job_parts" ADD COLUMN "total_cost" double precision NOT NULL;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "estimated_duration_hours" double precision NOT NULL;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "labor_cost" double precision NOT NULL;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "transport_fee" double precision NOT NULL;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "total_price" double precision NOT NULL;--> statement-breakpoint
ALTER TABLE "job_parts" DROP COLUMN "part_name";--> statement-breakpoint
ALTER TABLE "job_parts" DROP COLUMN "supplier_order_id";--> statement-breakpoint
ALTER TABLE "jobs" DROP COLUMN "address";--> statement-breakpoint
ALTER TABLE "jobs" DROP COLUMN "price_quote";--> statement-breakpoint
ALTER TABLE "jobs" DROP COLUMN "price_final";