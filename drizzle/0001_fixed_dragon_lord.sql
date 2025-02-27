ALTER TABLE "users" RENAME COLUMN "password" TO "password_hash";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");