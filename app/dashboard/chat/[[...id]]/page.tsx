"use client";

import { ChatInput } from "@/components/custom/chat-input";
import { Loader } from "@/components/custom/loader";
import { PreviewMessage, ThinkingMessage } from "@/components/custom/message";
import { Overview } from "@/components/custom/overview";
import { useChatStore } from "@/lib/chat.store";
import { generateAIResponseAction } from "@/lib/server";
import { fromMessagesToAI } from "@/lib/utils";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function Page() {
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);

  const params = useParams();
  const router = useRouter();
  const chatId: number | undefined = Array.isArray(params.id)
    ? params.id[0] !== undefined && !isNaN(Number(params.id[0]))
      ? +params.id[0]
      : undefined
    : undefined;

  const {
    startNewChat,
    saveIntitialChat,
    getCurrentChatMessages,
    addMessageToCurrentChat,
    saveMessageToCurrentChat,
    isLoadingThisChat,
    loadSpecificChat,
    loadThisChatError,
  } = useChatStore();

  const handleSubmit = async (text?: string) => {
    if (!text?.trim()) {
      toast.error("Cannot submit empty chat");
      return;
    }

    if (!getCurrentChatMessages() || getCurrentChatMessages().length === 0) {
      // This is a new conversation
      startNewChat(text);
      setIsLoading(true);
      setQuestion("");
      const aiResponse = await generateAIResponseAction(
        fromMessagesToAI(getCurrentChatMessages()),
      );

      addMessageToCurrentChat({
        content: aiResponse.data ?? "No response sent by AI",
        role: "assistant",
      });

      setIsLoading(false);
      saveIntitialChat();
    } else {
      // This is an ongoing conversation
      setIsLoading(true);
      setQuestion("");
      saveMessageToCurrentChat({ role: "user", content: text });

      const aiResponse = await generateAIResponseAction(
        fromMessagesToAI(getCurrentChatMessages()),
      );

      saveMessageToCurrentChat({
        role: "assistant",
        content: aiResponse.data ?? "No response sent by AI",
      });

      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (chatId) {
      loadSpecificChat(chatId);
    }
  }, [chatId]);

  useEffect(() => {
    if (getCurrentChatMessages().length > 0) {
      setShowSuggestions(false);
    }
  }, [getCurrentChatMessages()]);

  useEffect(() => {
    if (loadThisChatError) {
      router.push("/dashboard/chat");
    }
  }, [loadThisChatError]);

  if (isLoadingThisChat) {
    return (
      <div className="w-full h-fit">
        <Loader />
      </div>
    );
  }

  return (
    <div className="flex flex-col" style={{ height: "calc(100dvh - 100px)" }}>
      <div className="flex flex-col flex-1 overflow-y-auto pb-5 mx-auto w-full md:max-w-3xl px-4">
        {getCurrentChatMessages().length == 0 && <Overview />}
        {getCurrentChatMessages().map((message, index) => (
          <PreviewMessage key={index} message={message} />
        ))}
        {isLoading && <ThinkingMessage />}
      </div>

      <div className="w-full md:max-w-3xl mx-auto px-4 bg-background pt-5 pb-2 md:pb-6">
        <ChatInput
          question={question}
          setQuestion={setQuestion}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          showSuggestions={showSuggestions}
          setShowSuggestions={setShowSuggestions}
        />
      </div>
    </div>
  );
}
