import { AIMessage, Message } from "@/lib/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getInitials(name: string): string {
  const wordArray = name.split(" ");
  if (wordArray.length === 0) {
    return "AA";
  }
  if (wordArray.length === 1) {
    return wordArray[0].charAt(0).toUpperCase();
  }

  const firstWord = wordArray[0];
  const secondWord = wordArray[1];
  return firstWord.charAt(0).toUpperCase() + secondWord.charAt(0).toUpperCase();
}

export function fromMessagesToAI(messages: Message[]): AIMessage[] {
  return messages.map((message) => ({
    role: message.role,
    content: message.content,
  }));
}

export function randomNumber(): number {
  const max = 100000;
  return Math.floor(Math.random() * max);
}
