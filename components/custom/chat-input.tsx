import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cx } from "classix";
import { motion } from "framer-motion";
import { ArrowUpIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ChatInputProps {
  question: string;
  setQuestion: (question: string) => void;
  onSubmit: (text?: string) => void;
  isLoading: boolean;
  showSuggestions: boolean;
  setShowSuggestions: (showSuggestions: boolean) => void;
}

const suggestedActions = [
  {
    title: "How does AI",
    label: "work?",
    action: "How does AI wok?",
  },
  {
    title: "Tell me a fun fact",
    label: "about pandas",
    action: "Tell me an interesting fact about pandas",
  },
];

export const ChatInput = ({
  question,
  setQuestion,
  onSubmit,
  isLoading,
  showSuggestions,
  setShowSuggestions,
}: ChatInputProps) => {
  return (
    <div className="relative w-full flex flex-col gap-4">
      {showSuggestions && (
        <div className="hidden md:grid sm:grid-cols-2 gap-2 w-full">
          {suggestedActions.map((suggestedAction, index) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ delay: 0.05 * index }}
              key={index}
              className={index > 1 ? "hidden sm:block" : "block"}
            >
              <Button
                variant="ghost"
                onClick={() => {
                  const text = suggestedAction.action;
                  onSubmit(text);
                  setShowSuggestions(false);
                }}
                className="text-left cursor-pointer border rounded-xl px-4 py-3.5 text-sm flex-1 gap-1 sm:flex-col w-full h-auto justify-start items-start"
              >
                <span className="font-medium">{suggestedAction.title}</span>
                <span className="text-muted-foreground">
                  {suggestedAction.label}
                </span>
              </Button>
            </motion.div>
          ))}
        </div>
      )}

      <input
        type="file"
        className="fixed -top-4 -left-4 size-0.5 opacity-0 pointer-events-none"
        multiple
        tabIndex={-1}
      />

      <div className="relative">
        <Textarea
          placeholder="Send a message..."
          className={cx(
            "min-h-[100px] max-h-[calc(75dvh)] pr-12 overflow-hidden resize-none rounded-xl text-base bg-muted",
          )}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();

              if (isLoading) {
                toast.error(
                  "Please wait for the model to finish its response!",
                );
              } else {
                setShowSuggestions(false);
                onSubmit(question);
              }
            }
          }}
          rows={6}
          autoFocus
        />

        <Button
          className="absolute bottom-4 right-4 rounded-full cursor-pointer"
          size="icon"
          onClick={() => onSubmit(question)}
          disabled={question.length === 0}
        >
          <ArrowUpIcon size={16} />
        </Button>
      </div>
    </div>
  );
};
