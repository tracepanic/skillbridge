"use server";

import { env } from "@/env";
import { CurrentChat } from "@/lib/chat.store";
import db from "@/lib/db";
import { PromptLab } from "@/lib/prompts";
import {
  AIMessage,
  CreateJobsSchema,
  JobsWithApplicationCount,
  JobsWithApplications,
  LoginSchema,
  ServerActionRes,
  SignupSchema,
} from "@/lib/schemas";
import { createSession, getSession } from "@/lib/session";
import { createWatsonXAIService } from "@/lib/watsonx";
import { Chat, CVInfo } from "@/prisma/generated";
import * as argon from "argon2";
import { z } from "zod";

const promptLab = new PromptLab();

export async function signup(
  values: z.infer<typeof SignupSchema>,
): Promise<{ success: boolean }> {
  try {
    const data = SignupSchema.parse(values);

    const res = await db.user.create({
      data: { ...data, password: await argon.hash(data.password) },
    });

    return { success: !!res };
  } catch (error) {
    console.log(error);
    return { success: false };
  }
}

export async function login(
  values: z.infer<typeof LoginSchema>,
): Promise<{ success: boolean }> {
  try {
    const data = LoginSchema.parse(values);

    const user = await db.user.findUnique({
      where: { email: data.email },
    });

    if (!user) return { success: false };

    const isPasswordValid = await argon.verify(user.password, data.password);

    if (!isPasswordValid) return { success: false };

    await createSession(user);

    return { success: true };
  } catch (error) {
    console.log(error);
    return { success: false };
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

    const chats = await db.chat.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
    if (!chats) {
      return {
        success: false,
        message: "Chats not found",
      };
    }

    return {
      success: true,
      message: "Success",
      data: chats,
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
): Promise<ServerActionRes<string>> {
  try {
    const messages = chat.messages;
    const user = await getSession();
    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }

    if (!messages || messages.length !== 2) {
      return {
        success: false,
        message: "Invalid messages",
      };
    }

    const res = await db.chat.create({
      data: {
        title: chat.title,
        userId: user.id,
        messages: {
          createMany: {
            data: [
              { role: messages[0].role, content: messages[0].content },
              { role: messages[1].role, content: messages[1].content },
            ],
          },
        },
      },
    });

    if (!res) {
      return {
        success: false,
        message: "Failed to create chat",
      };
    }

    return {
      success: true,
      message: "Success",
      data: res.id,
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
  chatId: string,
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

    const res = await db.message.create({
      data: {
        role: message.role,
        content: message.content,
        chatId,
      },
    });

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
  chatId: string,
): Promise<ServerActionRes<CurrentChat>> {
  try {
    const user = await getSession();
    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }

    const res = await db.chat.findUnique({
      where: { id: chatId, user: { id: user.id } },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });

    if (!res) {
      return {
        success: false,
        message: "Failed to fetch chat",
      };
    }

    return {
      success: true,
      message: "Success",
      data: { ...res, saved: true },
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

    const res = await db.cVInfo.findUnique({ where: { userId: user.id } });

    return {
      success: true,
      message: "Success",
      data: res,
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

    const res = await db.cVInfo.upsert({
      where: { userId: user.id },
      create: { name, ufsUrl, userId: user.id },
      update: { name, ufsUrl, userId: user.id },
    });

    if (!res) {
      return {
        success: false,
        message: "Failed to update CV",
      };
    }

    return {
      success: true,
      message: "Success",
      data: res,
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

    const res = await db.cVInfo.delete({ where: { userId: user.id } });

    if (!res) {
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

    const res = await db.job.findMany({
      where: {
        postedById: user.id,
      },
      include: {
        _count: {
          select: {
            applications: true,
          },
        },
      },
    });

    const jobsWithApplicationCount: JobsWithApplicationCount[] = res.map(
      (job) => ({
        ...job,
        applications: job._count.applications,
      }),
    );

    return {
      success: true,
      message: "Success",
      data: jobsWithApplicationCount,
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

    const res = await db.job.create({
      data: {
        ...data,
        postedById: user.id,
        status: data.status ? "open" : "closed",
      },
    });

    if (!res) {
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
  jobId: string,
): Promise<ServerActionRes<JobsWithApplications | null>> {
  try {
    const user = await getSession();
    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }

    const res = await db.job.findUnique({
      where: { postedById: user.id, id: jobId },
      include: { applications: true },
    });

    return {
      success: true,
      message: "Success",
      data: res,
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Failed to fetch my job details",
    };
  }
}
