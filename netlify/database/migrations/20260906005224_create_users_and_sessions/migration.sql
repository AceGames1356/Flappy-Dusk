CREATE TABLE "sessions" (
	"token" text PRIMARY KEY,
	"user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY,
	"name" text NOT NULL UNIQUE,
	"password_hash" text NOT NULL,
	"password_salt" text NOT NULL,
	"admin" boolean DEFAULT false NOT NULL,
	"coins" integer DEFAULT 0 NOT NULL,
	"total_pipes_passed" integer DEFAULT 0 NOT NULL,
	"owned_birds" jsonb DEFAULT '{"classic":true}' NOT NULL,
	"selected_bird" text DEFAULT 'classic' NOT NULL,
	"best" integer DEFAULT 0 NOT NULL,
	"pending_coin_delta" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;