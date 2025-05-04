"use client";

import {
  DashboardSkeleton,
  ListItem,
  StatusCard,
} from "@/components/custom/dashboard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { fetchCareerPaths, fetchChats, getUserCV } from "@/lib/server";
import { getSession, Session } from "@/lib/session";
import { CareerPath, Chat, CVInfo } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { ArrowRight, MessageSquare, Network, UploadCloud } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function Page() {
  const [user, setUser] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [cv, setCv] = useState<CVInfo | null>(null);
  const [chats, setChats] = useState<Chat[] | []>([]);
  const [careers, setCareers] = useState<CareerPath[] | []>([]);

  const router = useRouter();

  useEffect(() => {
    (async function loadData() {
      const user = await getSession();
      if (!user) {
        router.push("/login");
      }

      setUser(user);
      await loadAllData();

      setLoading(false);
    })();
  }, []);

  const loadAllData = async () => {
    const [cv, chats, careers] = await Promise.all([
      getUserCV(),
      fetchChats(),
      fetchCareerPaths(),
    ]);

    setCv(cv.data ?? null);
    setChats(chats.data ?? []);
    setCareers(careers.data ?? []);
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (!user) {
    toast.error("Failed to load dashboard data");
    return null;
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6 lg:p-8">
      <div className="flex items-center justify-between space-x-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Welcome back, {user.name.split(" ")[0]}!
          </h1>
          <p className="text-sm text-muted-foreground">
            Here's your personalized dashboard overview.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatusCard
          title="Your CV/Resume"
          status={cv ? "positive" : "negative"}
          message={
            cv
              ? `Last updated ${formatDistanceToNow(cv.updatedAt, { addSuffix: true })}`
              : "No CV uploaded yet. Upload one in the media page."
          }
          action={
            cv ? (
              <Button variant="outline" size="sm" asChild>
                <Link href={cv.ufsUrl} target="_blank">
                  View your resume <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <Button size="sm" asChild>
                <Link href="/dashboard/media">
                  <UploadCloud className="mr-2 h-4 w-4" /> Upload CV
                </Link>
              </Button>
            )
          }
        />

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">AI Assistant</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Chat with SkillBridge AI about your career
            </p>
            <Button size="sm" asChild>
              <Link href="/dashboard/chat">
                <MessageSquare className="mr-2 h-4 w-4" /> Start New Chat
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Career Exploration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Discover potential career paths tailored to you.
            </p>
            <Button size="sm" asChild>
              <Link href="/dashboard/career">
                <Network className="mr-2 h-4 w-4" /> Career Paths
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Chats</CardTitle>
            <CardDescription>
              Continue your conversations with the AI assistant.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {chats.length > 0 ? (
              <div className="space-y-2">
                {chats.slice(0, 5).map((chat) => (
                  <ListItem
                    key={chat.id}
                    id={chat.id}
                    title={chat.title}
                    description={`Last message ${formatDistanceToNow(chat.updatedAt, { addSuffix: true })}`}
                    icon={MessageSquare}
                    actionHref={`/dashboard/chat/${chat.id}`}
                  />
                ))}
                {chats.length > 5 && (
                  <Button
                    variant="link"
                    size="sm"
                    className="w-full justify-center"
                    asChild
                  >
                    <Link href="/dashboard/chat">View All Chats</Link>
                  </Button>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No recent chats found.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Career Paths</CardTitle>
            <CardDescription>
              Review the career paths generated for you.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {careers.length > 0 ? (
              <div className="space-y-2">
                {careers.slice(0, 5).map((path) => (
                  <ListItem
                    key={path.id}
                    id={path.id}
                    title={path.title}
                    description={`Confidence: ${path.confidenceScore}% | Generated ${formatDistanceToNow(path.createdAt, { addSuffix: true })}`}
                    icon={Network}
                    actionHref="/dashboard/career"
                    tags={[
                      <Badge
                        key="level"
                        variant="outline"
                        className="capitalize"
                      >
                        {path.level}
                      </Badge>,
                      <Badge
                        key="growth"
                        variant={
                          path.growthOutlook === "high"
                            ? "default"
                            : "secondary"
                        }
                        className="capitalize bg-opacity-80"
                      >
                        {path.growthOutlook} Growth
                      </Badge>,
                    ]}
                  />
                ))}
                {careers.length > 5 && (
                  <Button
                    variant="link"
                    size="sm"
                    className="w-full justify-center"
                    asChild
                  >
                    <Link href="/dashboard/career">View All Paths</Link>
                  </Button>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No career paths generated yet.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
