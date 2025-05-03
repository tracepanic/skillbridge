"use client";

import { Loader } from "@/components/custom/loader";
import { Button } from "@/components/ui/button";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useChatStore } from "@/lib/chat.store";
import { BotOff, Plus } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export function NavProjects() {
  const { isLoadingChats, chats, loadChats, resetCurrentChat } = useChatStore();

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Your Chats</SidebarGroupLabel>
      <Link
        href="/dashboard/chat"
        className="w-full mb-3"
        onClick={() => resetCurrentChat()}
      >
        <Button size="sm" className="w-full cursor-pointer">
          <Plus /> New Chat
        </Button>
      </Link>
      {isLoadingChats ? (
        <Loader size={20} className="mt-2" />
      ) : (
        <SidebarMenu>
          {chats.length > 0 ? (
            chats.map((chat) => (
              <SidebarMenuItem key={chat.id}>
                <SidebarMenuButton asChild>
                  <Link href={`/dashboard/chat/${chat.id}`}>
                    <span>{chat.title.replace(/^"(.*)"$/, "$1")}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))
          ) : (
            <SidebarMenuItem className="mt-1 flex flex-col items-center justify-center py-4">
              <BotOff />
              <span className="text-xs text-primary">No chats yet</span>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      )}
    </SidebarGroup>
  );
}
