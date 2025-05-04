"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Bot,
  Briefcase,
  File,
  GraduationCap,
  House,
  Settings2,
} from "lucide-react";
import Link from "next/link";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import { Session } from "@/lib/session";
import { NavProjects } from "./nav-projects";

const navs = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: House,
  },
  {
    title: "Careers",
    url: "/dashboard/careers",
    icon: GraduationCap,
    isActive: true,
    items: [{ title: "Generate", url: "/dashboard/career/generate" }],
  },
  {
    title: "Chatbot",
    url: "/dashboard/chat",
    icon: Bot,
  },
  {
    title: "Media",
    url: "/dashboard/media",
    icon: File,
  },
  {
    title: "Jobs",
    url: "/dashboard/jobs",
    icon: Briefcase,
    items: [{ title: "My Jobs", url: "/dashboard/jobs/my-jobs" }],
  },
];

export function AppSidebar({ user }: { user: Session }) {
  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/" className="text-primary text-xl font-bold">
                SkillBridge
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navs} />
        <NavProjects />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
