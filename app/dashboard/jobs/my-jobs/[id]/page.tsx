"use client";

import { Loader } from "@/components/custom/loader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchMyJobDetails } from "@/lib/server";
import { JobsWithApplications } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { Building, Calendar, DollarSign, MapPin, Users } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function Page() {
  const [job, setJob] = useState<JobsWithApplications | null>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const params = useParams<{ id: string | string[] }>();
  const jobId: number | undefined = Array.isArray(params.id)
    ? params.id[0] !== undefined
      ? Number(params.id[0])
      : undefined
    : params.id !== undefined
      ? Number(params.id)
      : undefined;

  useEffect(() => {
    (async function fetchJobDetails() {
      if (!jobId) {
        toast.error("Failed to fetch job details");
      }

      const res = await fetchMyJobDetails(jobId ?? -1);

      if (res && res.data && res.success) {
        setJob(res.data);
      } else {
        toast.error("Failed to fetch job details");
      }

      setLoading(false);
    })();
  }, [jobId]);

  if (loading) {
    return (
      <div className="w-full h-fit">
        <Loader />
      </div>
    );
  }

  if (!job) {
    toast.error("Job not found");
    router.push("/dashboard/jobs/my-jobs");
    return;
  }

  return (
    <div className="container mx-auto px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{job.title}</h1>
        <div className="flex flex-col gap-4 text-gray-600 mt-4 pl-4">
          <div className="flex items-center">
            <Building className="h-4 w-4 mr-3" /> {job.company}
          </div>
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-3" /> {job.location}
          </div>
          {job.salary && (
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 mr-3" /> {job.salary}
            </div>
          )}
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-3" />
            Posted {formatDistanceToNow(job.createdAt, { addSuffix: true })}
          </div>
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-3" />
            {job.applications.length} Applications
          </div>
        </div>
      </div>

      <Separator className="my-10" />

      <Tabs defaultValue="details">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger className="cursor-pointer" value="details">
            Job Details
          </TabsTrigger>
          <TabsTrigger className="cursor-pointer" value="applications">
            Applications ({job.applications.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Job Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line text-muted-foreground">
                {job.description}
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
