import { relations } from "drizzle-orm";
import {
  integer,
  jsonb,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const messageRole = pgEnum("MessageRole", ["user", "assistant"]);
export const jobStatus = pgEnum("JobStatus", ["open", "closed"]);
export const applicationStatus = pgEnum("ApplicationStatus", [
  "pending",
  "accepted",
  "rejected",
]);
export const careerPathLevel = pgEnum("CareerPathLevel", [
  "beginner",
  "intermediate",
  "advanced",
]);
export const growthOutlook = pgEnum("GrowthOutlook", [
  "low",
  "moderate",
  "high",
]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at", { precision: 3, mode: "date" })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { precision: 3, mode: "date" }).notNull(),
});

export const chats = pgTable("chats", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
  createdAt: timestamp("created_at", { precision: 3, mode: "date" })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { precision: 3, mode: "date" }).notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  role: messageRole("role").notNull(),
  chatId: integer("chat_id")
    .notNull()
    .references(() => chats.id, { onDelete: "cascade", onUpdate: "cascade" }),
  createdAt: timestamp("created_at", { precision: 3, mode: "date" })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { precision: 3, mode: "date" }).notNull(),
});

export const cvInfos = pgTable("cv_infos", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  ufsUrl: text("ufs_url").notNull(),
  userId: integer("userId")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
  createdAt: timestamp("created_at", { precision: 3, mode: "date" })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { precision: 3, mode: "date" }).notNull(),
});

export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  salary: text("salary"),
  company: text("company").notNull(),
  status: jobStatus("status").notNull().default("open"),
  postedById: integer("posted_by_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
  createdAt: timestamp("created_at", { precision: 3, mode: "date" })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { precision: 3, mode: "date" }).notNull(),
});

export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  coverNote: text("cover_note"),
  status: applicationStatus("status").notNull().default("pending"),
  jobId: integer("job_id")
    .notNull()
    .references(() => jobs.id, { onDelete: "cascade", onUpdate: "cascade" }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
  hiredById: integer("hired_by_id").references(() => users.id, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),
  createdAt: timestamp("created_at", { precision: 3, mode: "date" })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { precision: 3, mode: "date" }).notNull(),
});

export const careerPaths = pgTable("career_paths", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  confidenceScore: integer("confidence_score").notNull(),
  level: careerPathLevel("level").notNull(),
  domain: text("domain").notNull(),
  estimatedTimeToEntry: text("estimated_time_to_entry").notNull(),
  salaryRangeMin: integer("salary_range_min").notNull(),
  salaryRangeMax: integer("salary_range_max").notNull(),
  growthOutlook: growthOutlook("growth_outlook").notNull(),
  relevanceReasons: jsonb("relevance_reasons").notNull().$type<string[]>(),
  jobTitles: jsonb("job_titles").notNull().$type<string[]>(),
  requiredSkills: jsonb("required_skills").notNull().$type<string[]>(),
  optionalSkills: jsonb("optional_skills").$type<string[]>(),
  certifications: jsonb("certifications").$type<string[]>(),
  relatedPaths: jsonb("related_paths").notNull().$type<string[]>(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
  createdAt: timestamp("created_at", { precision: 3, mode: "date" })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { precision: 3, mode: "date" }).notNull(),
});

export const usersRelations = relations(users, ({ many, one }) => ({
  chats: many(chats),
  cv: one(cvInfos),
  jobsPosted: many(jobs, { relationName: "PostedJobs" }),
  applications: many(applications),
  jobsGotten: many(applications, { relationName: "JobsGotten" }),
  careerPaths: many(careerPaths),
}));

export const chatsRelations = relations(chats, ({ many, one }) => ({
  messages: many(messages),
  user: one(users, {
    fields: [chats.userId],
    references: [users.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  chat: one(chats, {
    fields: [messages.chatId],
    references: [chats.id],
  }),
}));

export const cvInfosRelations = relations(cvInfos, ({ one }) => ({
  user: one(users, {
    fields: [cvInfos.userId],
    references: [users.id],
  }),
}));

export const jobsRelations = relations(jobs, ({ many, one }) => ({
  applications: many(applications),
  postedBy: one(users, {
    relationName: "PostedJobs",
    fields: [jobs.postedById],
    references: [users.id],
  }),
}));

export const applicationsRelations = relations(applications, ({ one }) => ({
  job: one(jobs, {
    fields: [applications.jobId],
    references: [jobs.id],
  }),
  user: one(users, {
    fields: [applications.userId],
    references: [users.id],
  }),
  hiredBy: one(users, {
    relationName: "JobsGotten",
    fields: [applications.hiredById],
    references: [users.id],
  }),
}));

export const careerPathsRelations = relations(careerPaths, ({ one }) => ({
  user: one(users, {
    fields: [careerPaths.userId],
    references: [users.id],
  }),
}));
