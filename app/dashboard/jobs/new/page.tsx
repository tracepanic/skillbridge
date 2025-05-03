"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { CreateJobsSchema } from "@/lib/schemas";
import { createJob } from "@/lib/server";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export default function Page() {
  const router = useRouter();

  const form = useForm<z.infer<typeof CreateJobsSchema>>({
    resolver: zodResolver(CreateJobsSchema),
    defaultValues: {
      title: "",
      company: "",
      location: "",
      salary: "",
      description: "",
      status: true,
    },
  });

  const onSubmit = async (values: z.infer<typeof CreateJobsSchema>) => {
    const res = await createJob(values);

    if (res && res.success) {
      toast.success("Job created successfully");
      router.push("/dashboard/jobs/my-jobs");
    } else {
      form.reset();
      toast.error("Failed to create job");
    }
  };

  return (
    <div className="container px-4 mx-auto">
      <Button
        variant="ghost"
        className="mb-6 cursor-pointer text-primary"
        onClick={() => router.back()}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <Card className="max-w-3xl mx-auto mb-32">
        <CardHeader>
          <CardTitle className="text-2xl">Create New Job Listing</CardTitle>
          <CardDescription>
            Fill out the form below to create a new job listing. Be as detailed
            as possible to attract qualified candidates.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Senior Frontend Developer"
                        className="max-w-lg"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      The official title for this position.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. TechCorp"
                        className="max-w-lg"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>The name of your company.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Remote, New York, NY"
                        className="max-w-lg"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Where the job is located or if it's remote.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="salary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Salary Range (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. $80,000 - $120,000"
                        className="max-w-lg"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Providing a salary range can attract more qualified
                      candidates.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter a detailed job description..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Include responsibilities, requirements, benefits, and any
                      other relevant information.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="status"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Open for Applications</FormLabel>
                      <FormDescription>
                        Toggle off to mark job status as closed and won't take
                        applications.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full mt-5 cursor-pointer"
                loading={form.formState.isSubmitting}
              >
                Create Job
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
