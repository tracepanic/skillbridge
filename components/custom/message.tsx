import { MessageActions } from "@/components/custom/actions";
import { Markdown } from "@/components/custom/markdown";
import { Message } from "@/prisma/generated";
import { cx } from "classix";
import { motion } from "framer-motion";
import { SparklesIcon } from "lucide-react";

export const PreviewMessage = ({ message }: { message: Message }) => {
  return (
    <motion.div
      className="w-full mx-auto max-w-3xl py-3 px-4 group/message"
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      data-role={message.role}
    >
      <div
        className={cx(
          "group-data-[role=user]/message:bg-zinc-700 dark:group-data-[role=user]/message:bg-muted group-data-[role=user]/message:text-white flex gap-4 group-data-[role=user]/message:px-3 w-full group-data-[role=user]/message:w-fit group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl group-data-[role=user]/message:py-2 rounded-xl",
        )}
      >
        {message.role === "assistant" && (
          <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border">
            <SparklesIcon size={14} />
          </div>
        )}

        <div className="flex flex-col w-full">
          {message.content && (
            <div className="flex flex-col gap-4 text-left">
              <Markdown>{message.content}</Markdown>
            </div>
          )}

          {message.role === "assistant" && <MessageActions message={message} />}
        </div>
      </div>
    </motion.div>
  );
};

export const ThinkingMessage = () => {
  const role = "assistant";

  return (
    <motion.div
      className="w-full mx-auto max-w-3xl px-4 group/message "
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1, transition: { delay: 0.2 } }}
      data-role={role}
    >
      <div
        className={cx(
          "flex gap-4 group-data-[role=user]/message:px-3 w-full group-data-[role=user]/message:w-fit group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl group-data-[role=user]/message:py-2 rounded-xl",
          "group-data-[role=user]/message:bg-muted",
        )}
      >
        <motion.div
          className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border"
          animate={{
            rotate: [0, 15, -15, 0],
            scale: [1, 1.1, 1],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <SparklesIcon size={14} />
        </motion.div>
        <p className="text-sm text-muted-foreground translate-y-2">
          Thinking...
        </p>
      </div>
    </motion.div>
  );
};
