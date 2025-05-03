import { Application, Job } from "@/prisma/generated";
import { z } from "zod";

export const SignupSchema = z.object({
  name: z.string().min(3).max(255),
  email: z.string().email().min(5).max(255),
  phone: z.string().regex(/^\d{7,15}$/),
  password: z.string().min(8).max(255),
});

export const LoginSchema = z.object({
  email: z.string().email().min(5).max(255),
  password: z.string().min(8).max(255),
});

export const SessionSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(3).max(255),
  email: z.string().email().min(5).max(255),
});

export const CreateJobsSchema = z.object({
  title: z.string().min(3).max(255),
  company: z.string().min(3).max(255),
  location: z.string().min(3).max(255),
  salary: z.string().optional(),
  description: z.string().min(15).max(1000),
  status: z.boolean(),
});

export const SalaryRangeSchema = z.object({
  min: z.number(),
  max: z.number(),
});

export const CareerPathSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  confidenceScore: z.number().int().min(1).max(10),
  relevanceReasons: z.string().array().min(1),
  level: z
    .enum([
      "beginner",
      "intermediate",
      "advanced",
      "Beginner",
      "Intermediate",
      "Advanced",
    ])
    .transform((level) => level.toLowerCase()),
  domain: z.string().min(1),
  estimatedTimeToEntry: z.string().min(1),
  salaryRangeUSD: SalaryRangeSchema,
  growthOutlook: z
    .enum(["low", "moderate", "high", "Low", "Moderate", "High"])
    .transform((outlook) => outlook.toLowerCase()),
  jobTitles: z.string().array().min(1),
  requiredSkills: z.string().array().min(1),
  optionalSkills: z.string().array().optional(),
  certifications: z.string().array().optional(),
  relatedPaths: z.string().array().min(1),
});

export const CareerPathArraySchema = z.array(CareerPathSchema).min(1);

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
