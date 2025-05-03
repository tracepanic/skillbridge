import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    SESSION_SECRET: z.string(),
    UPLOADTHING_TOKEN: z.string(),
    WATSONX_AI_AUTH_TYPE: z.string().length(3).startsWith("iam"),
    WATSONX_AI_APIKEY: z.string(),
    WATSONX_SERVICE_URL: z.string().url(),
    WATSONX_PROJECT_ID: z.string(),
  },
  experimental__runtimeEnv: process.env,
});
