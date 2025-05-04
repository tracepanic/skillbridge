"use client";

import { Loader } from "@/components/custom/loader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fetchMyJobs } from "@/lib/server";
import { JobsWithApplicationCount } from "@/lib/types";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";
import { ChevronRight, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function Page() {
  const [jobs, setJobs] = useState<JobsWithApplicationCount[] | []>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    (async function fetchJobs() {
      const res = await fetchMyJobs();

      if (res && res.success) {
        setJobs(res.data || []);
      } else {
        toast.error("Failed to fetch jobs");
      }

      setLoading(false);
    })();
  }, []);

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "title",
      header: "Job Title",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("title")}</div>
      ),
    },
    {
      accessorKey: "company",
      header: "Company",
    },
    {
      accessorKey: "location",
      header: "Location",
    },
    {
      accessorKey: "applications",
      header: "Applications",
      cell: ({ row }) => (
        <div className="text-center">{row.getValue("applications")}</div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge className={status === "open" ? "bg-green-500" : "bg-gray-500"}>
            {status === "open" ? "Open" : "Closed"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Posted",
      cell: ({ row }) => {
        const date = row.getValue("createdAt") as Date;
        return formatDistanceToNow(date, { addSuffix: true });
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        return (
          <Button
            variant="ghost"
            size="sm"
            className="cursor-pointer"
            onClick={() =>
              router.push(`/dashboard/jobs/my-jobs/${row.original.id}`)
            }
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        );
      },
    },
  ];

  const table = useReactTable({
    data: jobs,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });

  if (loading) {
    return (
      <div className="w-full h-fit">
        <Loader />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 w-full">
      <h1 className="text-3xl font-bold">My Job Listings</h1>
      <div className="mt-5 flex justify-end">
        <Link href="/dashboard/jobs/new">
          <Button className="cursor-pointer">
            <Plus className="mr-2 h-4 w-4" /> Create New Job
          </Button>
        </Link>
      </div>

      <Card className="mt-10">
        <CardHeader>
          <CardTitle className="text-xl">Jobs You've Posted</CardTitle>
          <CardDescription>
            Manage your job listings and view applications.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() =>
                      router.push(`/dashboard/jobs/my-jobs/${row.original.id}`)
                    }
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No jobs found. Create your first job posting!
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <div className="flex items-center justify-end space-x-2 py-4">
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
