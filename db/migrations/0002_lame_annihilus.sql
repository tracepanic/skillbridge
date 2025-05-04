ALTER TABLE "applications" RENAME COLUMN "coverNote" TO "cover_note";--> statement-breakpoint
ALTER TABLE "applications" RENAME COLUMN "jobId" TO "job_id";--> statement-breakpoint
ALTER TABLE "applications" RENAME COLUMN "userId" TO "user_id";--> statement-breakpoint
ALTER TABLE "applications" RENAME COLUMN "hiredById" TO "hired_by_id";--> statement-breakpoint
ALTER TABLE "applications" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "applications" RENAME COLUMN "updatedAt" TO "updated_at";--> statement-breakpoint
ALTER TABLE "career_paths" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "career_paths" RENAME COLUMN "updatedAt" TO "updated_at";--> statement-breakpoint
ALTER TABLE "chats" RENAME COLUMN "userId" TO "user_id";--> statement-breakpoint
ALTER TABLE "chats" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "chats" RENAME COLUMN "updatedAt" TO "updated_at";--> statement-breakpoint
ALTER TABLE "cv_infos" RENAME COLUMN "ufsUrl" TO "ufs_url";--> statement-breakpoint
ALTER TABLE "cv_infos" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "cv_infos" RENAME COLUMN "updatedAt" TO "updated_at";--> statement-breakpoint
ALTER TABLE "jobs" RENAME COLUMN "postedById" TO "posted_by_id";--> statement-breakpoint
ALTER TABLE "jobs" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "jobs" RENAME COLUMN "updatedAt" TO "updated_at";--> statement-breakpoint
ALTER TABLE "messages" RENAME COLUMN "chatId" TO "chat_id";--> statement-breakpoint
ALTER TABLE "messages" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "messages" RENAME COLUMN "updatedAt" TO "updated_at";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "updatedAt" TO "updated_at";--> statement-breakpoint
ALTER TABLE "applications" DROP CONSTRAINT "applications_jobId_jobs_id_fk";
--> statement-breakpoint
ALTER TABLE "applications" DROP CONSTRAINT "applications_userId_users_id_fk";
--> statement-breakpoint
ALTER TABLE "applications" DROP CONSTRAINT "applications_hiredById_users_id_fk";
--> statement-breakpoint
ALTER TABLE "chats" DROP CONSTRAINT "chats_userId_users_id_fk";
--> statement-breakpoint
ALTER TABLE "jobs" DROP CONSTRAINT "jobs_postedById_users_id_fk";
--> statement-breakpoint
ALTER TABLE "messages" DROP CONSTRAINT "messages_chatId_chats_id_fk";
--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_hired_by_id_users_id_fk" FOREIGN KEY ("hired_by_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "chats" ADD CONSTRAINT "chats_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_posted_by_id_users_id_fk" FOREIGN KEY ("posted_by_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_chat_id_chats_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."chats"("id") ON DELETE cascade ON UPDATE cascade;