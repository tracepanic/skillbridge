import { ListItemProps, StatusCardProps } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ArrowRight, CheckCircle, FileText, XCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="flex-1 space-y-6 p-4 md:p-6 lg:p-8 animate-pulse">
      <div className="flex items-center justify-between space-y-2">
        <Skeleton className="h-9 w-48" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-[120px] w-full rounded-lg" />
        <Skeleton className="h-[120px] w-full rounded-lg" />
        <Skeleton className="h-[120px] w-full rounded-lg" />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function StatusCard({
  title,
  status,
  message,
  action,
}: StatusCardProps) {
  const Icon =
    status === "positive"
      ? CheckCircle
      : status === "negative"
        ? XCircle
        : FileText;
  const iconColor =
    status === "positive"
      ? "text-green-600"
      : status === "negative"
        ? "text-red-600"
        : "text-muted-foreground";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={cn("h-5 w-5", iconColor)} />
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-3">{message}</p>
        {action ? action : null}
      </CardContent>
    </Card>
  );
}

export function ListItem({
  id,
  title,
  description,
  icon: Icon,
  actionHref,
  tags,
}: ListItemProps) {
  return (
    <div className="flex items-center justify-between space-x-4 py-3 px-1 hover:bg-muted/50 rounded-md transition-colors">
      <div className="flex items-center space-x-3">
        <Icon />
        <div className="flex-1">
          <p className="text-sm font-medium line-clamp-1 leading-none">
            {title}
          </p>
          {description && (
            <p className="text-xs text-muted-foreground pt-1">{description}</p>
          )}
          {tags && <div className="flex flex-wrap gap-1 pt-2">{tags}</div>}
        </div>
      </div>
      <Button variant="ghost" size="sm" asChild>
        <Link href={actionHref}>
          View <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}
