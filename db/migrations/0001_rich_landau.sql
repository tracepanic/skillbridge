CREATE TYPE "public"."CareerPathLevel" AS ENUM('beginner', 'intermediate', 'advanced');--> statement-breakpoint
CREATE TYPE "public"."GrowthOutlook" AS ENUM('low', 'moderate', 'high');--> statement-breakpoint
CREATE TABLE "career_paths" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"confidence_score" integer NOT NULL,
	"level" "CareerPathLevel" NOT NULL,
	"domain" text NOT NULL,
	"estimated_time_to_entry" text NOT NULL,
	"salary_range_min" integer NOT NULL,
	"salary_range_max" integer NOT NULL,
	"growth_outlook" "GrowthOutlook" NOT NULL,
	"relevance_reasons" jsonb NOT NULL,
	"job_titles" jsonb NOT NULL,
	"required_skills" jsonb NOT NULL,
	"optional_skills" jsonb,
	"certifications" jsonb,
	"related_paths" jsonb NOT NULL,
	"user_id" integer NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "career_paths" ADD CONSTRAINT "career_paths_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;