CREATE TYPE "public"."handyman_availability" AS ENUM('available', 'on_job', 'offline');--> statement-breakpoint
CREATE TYPE "public"."handyman_status" AS ENUM('active', 'pending');--> statement-breakpoint
CREATE TYPE "public"."job_status" AS ENUM('dispatching', 'en_route', 'on_site', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('client', 'handyman', 'admin');--> statement-breakpoint
CREATE TABLE "handymen" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"skills" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"service_radius_km" integer DEFAULT 20 NOT NULL,
	"status" "handyman_status" DEFAULT 'pending' NOT NULL,
	"availability" "handyman_availability" DEFAULT 'offline' NOT NULL,
	"latitude" double precision,
	"longitude" double precision,
	CONSTRAINT "handymen_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "job_parts" (
	"id" serial PRIMARY KEY NOT NULL,
	"job_id" integer NOT NULL,
	"part_name" varchar(255) NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"unit_cost" double precision NOT NULL,
	"supplier_order_id" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "jobs" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" integer NOT NULL,
	"handyman_id" integer,
	"status" "job_status" DEFAULT 'dispatching' NOT NULL,
	"job_type" varchar(100) NOT NULL,
	"description" text NOT NULL,
	"address" text NOT NULL,
	"latitude" double precision NOT NULL,
	"longitude" double precision NOT NULL,
	"price_quote" double precision,
	"price_final" double precision,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"job_id" integer NOT NULL,
	"stripe_payment_intent_id" varchar(255) NOT NULL,
	"amount" double precision NOT NULL,
	"status" varchar(50) NOT NULL,
	"captured_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "pricing_config" (
	"job_type" varchar(100) PRIMARY KEY NOT NULL,
	"labor_rate_per_hour" double precision NOT NULL,
	"transport_fee" double precision DEFAULT 0 NOT NULL,
	"markup_pct" double precision DEFAULT 0.15 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"role" "user_role" DEFAULT 'client' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "warranties" (
	"id" serial PRIMARY KEY NOT NULL,
	"job_id" integer NOT NULL,
	"client_id" integer NOT NULL,
	"issued_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL,
	CONSTRAINT "warranties_job_id_unique" UNIQUE("job_id")
);
--> statement-breakpoint
ALTER TABLE "handymen" ADD CONSTRAINT "handymen_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_parts" ADD CONSTRAINT "job_parts_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_client_id_users_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_handyman_id_handymen_id_fk" FOREIGN KEY ("handyman_id") REFERENCES "public"."handymen"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "warranties" ADD CONSTRAINT "warranties_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "warranties" ADD CONSTRAINT "warranties_client_id_users_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;