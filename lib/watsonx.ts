import { env } from "@/env";
import { WatsonXAI } from "@ibm-cloud/watsonx-ai";

export function createWatsonXAIService() {
  return WatsonXAI.newInstance({
    version: "2024-05-31",
    serviceUrl: env.WATSONX_SERVICE_URL,
  });
}
