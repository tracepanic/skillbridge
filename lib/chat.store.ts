import { AIMessage } from "@/lib/schemas";
import {
  createNewChat,
  fetchChats,
  fetchSpecificChat,
  generateChatTitle,
  updateMessagesToDB,
} from "@/lib/server";
import { Chat, Message } from "@/prisma/generated";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { create } from "zustand";

export interface CurrentChat extends Chat {
  saved: boolean;
  messages?: Message[];
}

interface ChatState {
  chats: Chat[];
  currentChat: CurrentChat | null;
  isLoadingChats: boolean;
  isLoadingThisChat: boolean;
  loadThisChatError: boolean;
}

interface ChatActions {
  loadChats: () => Promise<void>;
  loadSpecificChat: (id: string) => Promise<void>;
  startNewChat: (input: string) => void;
  getCurrentChatMessages: () => Message[] | [];
  addMessageToCurrentChat: (message: AIMessage) => void;
  saveMessageToCurrentChat: (message: AIMessage) => void;
  saveIntitialChat: () => void;
  resetCurrentChat: () => void;
}

export const useChatStore = create<ChatState & ChatActions>((set, get) => ({
  chats: [],
  currentChat: null,
  isLoadingChats: false,
  isLoadingThisChat: false,
  loadThisChatError: false,

  loadChats: async () => {
    set({ isLoadingChats: true });

    const res = await fetchChats();
    if (!res.success || !res.data) {
      toast.error("Failed to load chats");
    }

    set({ isLoadingChats: false, chats: res.data });
  },

  resetCurrentChat: () => {
    set({ currentChat: null });
  },

  loadSpecificChat: async (id: string) => {
    set({ isLoadingThisChat: true });

    const res = await fetchSpecificChat(id);
    if (res.success && res.data) {
      set({ currentChat: res.data });
    } else {
      toast.error("Failed to load chat");
      set({ loadThisChatError: true });
    }

    set({ isLoadingThisChat: false, currentChat: res.data });
  },

  startNewChat: (input: string) => {
    const id = uuidv4();
    const newUserMessage: Message = {
      id: uuidv4(),
      chatId: id,
      content: input,
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const newChat: CurrentChat = {
      id,
      title: "New chat",
      saved: false,
      messages: [newUserMessage],
      userId: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    set({ currentChat: newChat, chats: [newChat, ...get().chats] });

    (async () => {
      const res = await generateChatTitle(input);
      if (!res.success || !res.data) {
        console.error(res.message);
        return;
      }

      const generatedTitle = res.data;

      set((state) => {
        const chatIndex = state.chats.findIndex((chat) => chat.id === id);

        if (chatIndex === -1) {
          return state;
        }

        const updatedCurrentChat: CurrentChat = {
          ...state.currentChat!,
          title: generatedTitle,
        };

        const updatedChats = [...state.chats];
        updatedChats[chatIndex] = {
          ...updatedChats[chatIndex],
          title: generatedTitle,
        };

        return {
          ...state,
          currentChat: updatedCurrentChat,
          chats: updatedChats,
        };
      });
    })();
  },

  saveIntitialChat: async () => {
    const state = get();
    const currentChat = state.currentChat;

    if (!currentChat || currentChat.saved) {
      console.log(
        "No current chat or chat already saved. Skipping initial save.",
      );
      return;
    }

    if (!currentChat.messages || currentChat.messages.length < 2) {
      console.warn("Not enough messages (less than 2) for initial chat save.");
      return;
    }

    const res = await createNewChat(currentChat);

    if (!res.success && !res.data) {
      toast.error("Failed to save chat");
    } else {
      set((state) => {
        return {
          ...state,
          currentChat: {
            ...state.currentChat!,
            saved: true,
            id: res.data as string,
          },
        };
      });
    }
  },

  addMessageToCurrentChat: (message: AIMessage) => {
    set((state) => {
      if (!state.currentChat) {
        return state;
      }

      const fullMessage: Message = {
        id: uuidv4(),
        chatId: state.currentChat.id,
        content: message.content,
        role: message.role,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedMessages = [
        ...(state.currentChat.messages || []),
        fullMessage,
      ];

      const updatedCurrentChat: CurrentChat = {
        ...state.currentChat,
        messages: updatedMessages,
      };

      const chatIndex = state.chats.findIndex(
        (chat) => chat.id === state.currentChat!.id,
      );

      const updatedChats = [...state.chats];
      if (chatIndex !== -1) {
        updatedChats[chatIndex] = updatedCurrentChat;
      }

      return {
        ...state,
        currentChat: updatedCurrentChat,
        chats: updatedChats,
      };
    });
  },

  saveMessageToCurrentChat: async (message: AIMessage) => {
    const state = get();
    const currentChat = state.currentChat;

    if (!currentChat) {
      return;
    }

    const fullMessage: Message = {
      id: uuidv4(),
      chatId: currentChat.id,
      content: message.content,
      role: message.role,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    set((state) => {
      if (!state.currentChat) return state;

      const updatedMessages = [
        ...(state.currentChat.messages || []),
        fullMessage,
      ];

      const updatedCurrentChat: CurrentChat = {
        ...state.currentChat,
        messages: updatedMessages,
      };

      const chatIndex = state.chats.findIndex(
        (chat) => chat.id === state.currentChat!.id,
      );

      const updatedChats = [...state.chats];
      if (chatIndex !== -1) {
        updatedChats[chatIndex] = updatedCurrentChat;
      }

      return {
        ...state,
        currentChat: updatedCurrentChat,
        chats: updatedChats,
      };
    });

    await updateMessagesToDB(currentChat.id, {
      role: message.role,
      content: message.content,
    });
  },

  getCurrentChatMessages: () => {
    const state = get();
    return state.currentChat ? state.currentChat.messages || [] : [];
  },
}));
