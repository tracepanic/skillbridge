"use server";

import { db } from "@/db/drizzle";
import {
  applications,
  careerPaths,
  chats,
  cvInfos,
  jobs,
  messages,
  users,
} from "@/db/schema";
import { env } from "@/env";
import { CurrentChat } from "@/lib/chat.store";
import { PromptLab } from "@/lib/prompts";
import {
  CareerPathSchema,
  CreateJobsSchema,
  LoginSchema,
  SignupSchema,
} from "@/lib/schemas";
import { createSession, getSession } from "@/lib/session";
import {
  AIMessage,
  CareerPath,
  Chat,
  CVInfo,
  JobsWithApplicationCount,
  JobsWithApplications,
  ServerActionRes,
} from "@/lib/types";
import { createWatsonXAIService } from "@/lib/watsonx";
import * as argon from "argon2";
import { and, asc, count, desc, eq } from "drizzle-orm";
import { z } from "zod";

const promptLab = new PromptLab();

export async function signup(
  values: z.infer<typeof SignupSchema>,
): Promise<ServerActionRes<undefined>> {
  try {
    const data = SignupSchema.parse(values);

    const hashedPassword = await argon.hash(data.password);

    const res = await db
      .insert(users)
      .values({
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    if (!res) {
      return {
        success: false,
        message: "Failed to create user",
      };
    }

    return {
      success: true,
      message: "Success",
      data: undefined,
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Failed to create user",
    };
  }
}

export async function login(
  values: z.infer<typeof LoginSchema>,
): Promise<ServerActionRes<undefined>> {
  try {
    const data = LoginSchema.parse(values);

    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email))
      .limit(1)
      .execute();

    if (!user || user.length === 0) {
      return {
        success: false,
        message: "Invalid credentials",
      };
    }

    const isPasswordValid = await argon.verify(user[0].password, data.password);

    if (!isPasswordValid) {
      return {
        success: false,
        message: "Invalid credentials",
      };
    }

    await createSession(user[0]);

    return {
      success: true,
      message: "Success",
      data: undefined,
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Invalid credentials",
    };
  }
}

export async function fetchChats(): Promise<ServerActionRes<Chat[]>> {
  try {
    const user = await getSession();
    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }

    const allChats = await db
      .select()
      .from(chats)
      .where(eq(chats.userId, user.id))
      .orderBy(desc(chats.createdAt))
      .execute();

    if (!allChats) {
      return {
        success: false,
        message: "Chats not found",
      };
    }

    return {
      success: true,
      message: "Success",
      data: allChats,
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Failed to load chats",
    };
  }
}

export async function generateAIResponseAction(
  messages: AIMessage[],
): Promise<ServerActionRes<string>> {
  try {
    const watsonxAIService = createWatsonXAIService();

    const response = await watsonxAIService.textChat({
      modelId: "ibm/granite-3-8b-instruct",
      projectId: env.WATSONX_PROJECT_ID,
      maxTokens: 100000,
      messages,
    });

    const output = response.result.choices?.[0]?.message?.content ?? "";

    return {
      success: true,
      message: "AI response generated successfully",
      data: output,
    };
  } catch (error) {
    console.error("Server AI response error:", error);
    return {
      success: false,
      message: "Failed to generate AI response",
    };
  }
}

export async function generateChatTitle(
  input: string,
): Promise<ServerActionRes<string>> {
  try {
    const messages: AIMessage[] = [
      { role: "user", content: promptLab.getTitlePrompt(input) },
    ];

    const aiResponse = await generateAIResponseAction(messages);

    if (!aiResponse.success || !aiResponse.data) {
      return {
        success: false,
        message: aiResponse.message || "Failed to generate title",
      };
    }

    return {
      success: true,
      message: "Success",
      data: aiResponse.data,
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Failed to generate title",
    };
  }
}

export async function createNewChat(
  chat: CurrentChat,
): Promise<ServerActionRes<number>> {
  try {
    const userMessages = chat.messages;
    const user = await getSession();
    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }

    if (!userMessages || userMessages.length !== 2) {
      return {
        success: false,
        message: "Invalid messages",
      };
    }

    const res = await db
      .insert(chats)
      .values({
        title: chat.title,
        userId: user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning({ id: chats.id });

    const chatId = res[0].id;

    await db.insert(messages).values([
      {
        role: userMessages[0].role,
        content: userMessages[0].content,
        chatId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        role: userMessages[1].role,
        content: userMessages[1].content,
        chatId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    if (!chatId) {
      return {
        success: false,
        message: "Failed to create chat",
      };
    }

    return {
      success: true,
      message: "Success",
      data: chatId,
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Failed to create chat",
    };
  }
}

export async function updateMessagesToDB(
  chatId: number,
  message: AIMessage,
): Promise<ServerActionRes<undefined>> {
  try {
    const user = await getSession();
    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }

    const res = await db
      .insert(messages)
      .values({
        role: message.role,
        content: message.content,
        chatId,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    if (!res) {
      return {
        success: false,
        message: "Failed to save messagee",
      };
    }

    return {
      success: true,
      message: "Success",
      data: undefined,
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Failed to save message",
    };
  }
}

export async function fetchSpecificChat(
  chatId: number,
): Promise<ServerActionRes<CurrentChat>> {
  try {
    const user = await getSession();
    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }

    const chat = await db
      .select()
      .from(chats)
      .where(and(eq(chats.id, chatId), eq(chats.userId, user.id)))
      .limit(1)
      .execute();

    if (!chat || chat.length === 0) {
      return {
        success: false,
        message: "Chat not found",
      };
    }

    const chatMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.chatId, chatId))
      .orderBy(asc(messages.createdAt))
      .execute();

    return {
      success: true,
      message: "Success",
      data: { ...chat[0], messages: chatMessages, saved: true },
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Failed to fetch chat",
    };
  }
}

export async function getUserCV(): Promise<ServerActionRes<CVInfo | null>> {
  try {
    const user = await getSession();
    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }

    const cv = await db
      .select()
      .from(cvInfos)
      .where(eq(cvInfos.userId, user.id))
      .limit(1)
      .execute();

    return {
      success: true,
      message: "Success",
      data: cv.length > 0 ? cv[0] : null,
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Failed to fetch user CV",
    };
  }
}

export async function updateOrCreateCV({
  name,
  ufsUrl,
}: {
  name: string;
  ufsUrl: string;
}): Promise<ServerActionRes<CVInfo>> {
  try {
    const user = await getSession();
    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }

    const existingCV = await db
      .select()
      .from(cvInfos)
      .where(eq(cvInfos.userId, user.id))
      .limit(1)
      .execute();

    let result;

    if (existingCV.length > 0) {
      result = await db
        .update(cvInfos)
        .set({
          name,
          ufsUrl,
          updatedAt: new Date(),
        })
        .where(eq(cvInfos.userId, user.id))
        .returning();
    } else {
      result = await db
        .insert(cvInfos)
        .values({
          name,
          ufsUrl,
          userId: user.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();
    }

    if (!result || result.length === 0) {
      return {
        success: false,
        message: "Failed to update CV",
      };
    }

    return {
      success: true,
      message: "Success",
      data: result[0],
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Failed to update CV",
    };
  }
}

export async function deleteCV(): Promise<ServerActionRes<undefined>> {
  try {
    const user = await getSession();
    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }

    const result = await db
      .delete(cvInfos)
      .where(eq(cvInfos.userId, user.id))
      .returning();

    if (!result || result.length === 0) {
      return {
        success: false,
        message: "Failed to delete CV",
      };
    }

    return {
      success: true,
      message: "Success",
      data: undefined,
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Failed to delete CV",
    };
  }
}

export async function fetchMyJobs(): Promise<
  ServerActionRes<JobsWithApplicationCount[] | []>
> {
  try {
    const user = await getSession();
    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }

    const userJobs = await db
      .select()
      .from(jobs)
      .where(eq(jobs.postedById, user.id))
      .execute();

    const jobsWithCounts: JobsWithApplicationCount[] = [];

    for (const job of userJobs) {
      const applicationCount = await db
        .select({ count: count() })
        .from(applications)
        .where(eq(applications.jobId, job.id))
        .execute();

      jobsWithCounts.push({
        ...job,
        applications: applicationCount[0]?.count || 0,
      });
    }

    return {
      success: true,
      message: "Success",
      data: jobsWithCounts,
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Failed to fetch my jobs",
    };
  }
}

export async function createJob(
  values: z.infer<typeof CreateJobsSchema>,
): Promise<ServerActionRes<undefined>> {
  try {
    const user = await getSession();
    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }

    const data = CreateJobsSchema.parse(values);

    const result = await db
      .insert(jobs)
      .values({
        title: data.title,
        description: data.description,
        location: data.location,
        salary: data.salary,
        company: data.company,
        status: data.status ? "open" : "closed",
        postedById: user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    if (!result || result.length === 0) {
      return {
        success: false,
        message: "Failed to create job",
      };
    }

    return {
      success: true,
      message: "Success",
      data: undefined,
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Failed to fetch create job",
    };
  }
}

export async function fetchMyJobDetails(
  jobId: number,
): Promise<ServerActionRes<JobsWithApplications | null>> {
  try {
    const user = await getSession();
    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }

    const job = await db
      .select()
      .from(jobs)
      .where(and(eq(jobs.id, jobId), eq(jobs.postedById, user.id)))
      .limit(1)
      .execute();

    if (!job || job.length === 0) {
      return {
        success: false,
        message: "Job not found",
      };
    }

    const jobApplications = await db
      .select()
      .from(applications)
      .where(eq(applications.jobId, jobId))
      .execute();

    return {
      success: true,
      message: "Success",
      data: {
        ...job[0],
        applications: jobApplications,
      },
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Failed to fetch my job details",
    };
  }
}

export async function saveCareerPath(
  values: z.infer<typeof CareerPathSchema>,
): Promise<ServerActionRes<undefined>> {
  try {
    const user = await getSession();
    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }

    const data = CareerPathSchema.parse(values);

    const result = await db
      .insert(careerPaths)
      .values({
        title: data.title,
        description: data.description,
        confidenceScore: data.confidenceScore,
        level: data.level as "beginner" | "intermediate" | "advanced",
        domain: data.domain,
        estimatedTimeToEntry: data.estimatedTimeToEntry,
        salaryRangeMin: data.salaryRangeUSD.min,
        salaryRangeMax: data.salaryRangeUSD.max,
        growthOutlook: data.growthOutlook as "low" | "moderate" | "high",
        relevanceReasons: data.relevanceReasons,
        jobTitles: data.jobTitles,
        requiredSkills: data.requiredSkills,
        optionalSkills: data.optionalSkills || [],
        certifications: data.certifications || [],
        relatedPaths: data.relatedPaths,
        userId: user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    if (!result || result.length === 0) {
      return {
        success: false,
        message: "Failed to create career path",
      };
    }

    return {
      success: true,
      message: "Success",
      data: undefined,
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Failed to create career path",
    };
  }
}

export async function fetchCareerPaths(): Promise<
  ServerActionRes<CareerPath[]>
> {
  try {
    const user = await getSession();
    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }

    const careers = await db
      .select()
      .from(careerPaths)
      .where(eq(careerPaths.userId, user.id))
      .orderBy(desc(careerPaths.createdAt))
      .execute();

    return {
      success: true,
      message: "Success",
      data: careers,
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Failed to load career paths",
    };
  }
}
