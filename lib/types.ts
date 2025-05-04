import {
  applications,
  careerPaths,
  chats,
  cvInfos,
  jobs,
  messages,
  users,
} from "@/db/schema";
import { InferSelectModel } from "drizzle-orm";
import { LucideIcon } from "lucide-react";

export type User = InferSelectModel<typeof users>;
export type Job = InferSelectModel<typeof jobs>;
export type Application = InferSelectModel<typeof applications>;
export type Chat = InferSelectModel<typeof chats>;
export type Message = InferSelectModel<typeof messages>;
export type CVInfo = InferSelectModel<typeof cvInfos>;
export type CareerPath = InferSelectModel<typeof careerPaths>;

export interface AIMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ServerActionRes<T> {
  success: boolean;
  message: string;
  data?: T;
}

export interface JobsWithApplications extends Job {
  applications: Application[];
}

export interface JobsWithApplicationCount extends Job {
  applications: number;
}

export interface StatusCardProps {
  title: string;
  status: "positive" | "negative" | "neutral";
  message: string;
  action?: React.ReactNode;
}

export interface ListItemProps {
  id: number;
  title: string;
  description?: string;
  icon: LucideIcon;
  actionHref: string;
  tags?: React.ReactNode[];
}
