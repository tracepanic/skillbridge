import { relations } from "drizzle-orm";
import {
  integer,
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

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  password: text("password").notNull(),
  createdAt: timestamp("createdAt", { precision: 3, mode: "date" })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updatedAt", { precision: 3, mode: "date" }).notNull(),
});

export const chats = pgTable("chats", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  userId: integer("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
  createdAt: timestamp("createdAt", { precision: 3, mode: "date" })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updatedAt", { precision: 3, mode: "date" }).notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  role: messageRole("role").notNull(),
  chatId: integer("chatId")
    .notNull()
    .references(() => chats.id, { onDelete: "cascade", onUpdate: "cascade" }),
  createdAt: timestamp("createdAt", { precision: 3, mode: "date" })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updatedAt", { precision: 3, mode: "date" }).notNull(),
});

export const cvInfos = pgTable("cv_infos", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  ufsUrl: text("ufsUrl").notNull(),
  userId: integer("userId")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
  createdAt: timestamp("createdAt", { precision: 3, mode: "date" })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updatedAt", { precision: 3, mode: "date" }).notNull(),
});

export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  salary: text("salary"),
  company: text("company").notNull(),
  status: jobStatus("status").notNull().default("open"),
  postedById: integer("postedById")
    .notNull()
    .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
  createdAt: timestamp("createdAt", { precision: 3, mode: "date" })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updatedAt", { precision: 3, mode: "date" }).notNull(),
});

export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  coverNote: text("coverNote"),
  status: applicationStatus("status").notNull().default("pending"),
  jobId: integer("jobId")
    .notNull()
    .references(() => jobs.id, { onDelete: "cascade", onUpdate: "cascade" }),
  userId: integer("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
  hiredById: integer("hiredById").references(() => users.id, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),
  createdAt: timestamp("createdAt", { precision: 3, mode: "date" })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updatedAt", { precision: 3, mode: "date" }).notNull(),
});

export const usersRelations = relations(users, ({ many, one }) => ({
  chats: many(chats),
  cv: one(cvInfos),
  jobsPosted: many(jobs, { relationName: "PostedJobs" }),
  applications: many(applications),
  jobsGotten: many(applications, { relationName: "JobsGotten" }),
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
