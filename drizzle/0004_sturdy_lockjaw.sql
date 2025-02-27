ALTER TABLE "users" ADD COLUMN "role" varchar(50) DEFAULT 'customer' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "phone_number" varchar(15);