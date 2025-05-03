"use client";

import { Loader } from "@/components/custom/loader";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { deleteCV, getUserCV, updateOrCreateCV } from "@/lib/server";
import { CVInfo } from "@/prisma/generated";
import { deleteUploadthingCV } from "@/server/upladthing";
import { useUploadThing } from "@/utils/uploadthing";
import { useDropzone } from "@uploadthing/react";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  FileText,
  Loader2,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  generateClientDropzoneAccept,
  generatePermittedFileTypes,
} from "uploadthing/client";

export default function Page() {
  const [loading, setLoading] = useState(true);
  const [dbCV, setDbCV] = useState<CVInfo | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [shownCV, setShownCV] = useState<{
    name: string;
    ufsUrl: string;
  } | null>(null);

  const { isUploading, routeConfig, startUpload } = useUploadThing("resume", {
    uploadProgressGranularity: "fine",
    onClientUploadComplete: async (res) => {
      if (res && res[0]) {
        setShownCV({ name: res[0].name, ufsUrl: res[0].ufsUrl });

        toast("Verifying CV...");

        const response = await updateOrCreateCV({
          name: res[0].name,
          ufsUrl: res[0].ufsUrl,
        });

        if (dbCV) {
          await deleteUploadthingCV(dbCV.name);
        }

        if (response && response.success && response.data) {
          setDbCV(response.data);
          toast.success("CV updated successfully");
        }
      }

      setUploadProgress(0);
      setIsUpdating(false);
    },
    onUploadError: (error) => {
      toast.error(error.message ?? "An error occurred during upload.");
      setUploadProgress(0);
      setIsUpdating(false);
    },
    onUploadBegin: () => {
      toast("Upload started");
      setIsUpdating(true);
    },
    onUploadProgress: (progress) => {
      setUploadProgress(progress);
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0 && !isUploading && !isUpdating) {
      const file = acceptedFiles[0];
      handleUpload(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: routeConfig
      ? generateClientDropzoneAccept(
          generatePermittedFileTypes(routeConfig).fileTypes,
        )
      : { "application/pdf": [".pdf"] },
    maxFiles: 1,
    disabled: isUploading || isDeleting || isUpdating,
  });

  const handleUpload = (file: File) => {
    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file.");
      return;
    }

    if (file.size > 2 * 1024 * 2024) {
      toast.error("File is too large. Maximum size is 2MB.");
      return;
    }

    startUpload([file]);
  };

  useEffect(() => {
    (async function fetchCV() {
      const res = await getUserCV();

      if (res.success && res.data) {
        setDbCV(res.data);
        setShownCV({ name: res.data.name, ufsUrl: res.data.ufsUrl });
      }

      setLoading(false);
    })();
  }, []);

  const handleView = () => {
    if (shownCV) {
      window.open(shownCV.ufsUrl, "_blank");
    } else {
      toast.error("No CV available to display");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && !isUploading && !isUpdating) {
      const file = e.target.files[0];
      handleUpload(file);
    }
  };

  const handleDelete = async () => {
    if (!dbCV || isDeleting || isUploading || isUpdating) {
      if (!dbCV) toast.error("CV not found");
      return;
    }

    setIsDeleting(true);
    const res = await deleteCV();

    if (res && res.success) {
      setShownCV(null);
      await deleteUploadthingCV(dbCV.name);
      toast.success("CV deleted successfully");
      setDbCV(null);
    } else {
      toast.error("Failed to delete CV");
    }

    setIsDeleting(false);
  };

  if (loading) {
    return (
      <div className="w-full h-fit">
        <Loader />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold mb-8">CV Management</h1>

      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-xl">Your Curriculum Vitae</CardTitle>
          <CardDescription>
            Upload, view or manage your CV document
          </CardDescription>
        </CardHeader>

        <CardContent>
          {isUploading || isUpdating ? (
            <div className="space-y-4 py-6">
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <p>Uploading your CV...</p>
              </div>
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-sm text-muted-foreground text-right">
                {Math.round(uploadProgress)}%
              </p>
            </div>
          ) : (
            <>
              {shownCV ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <FileText className="text-primary" size={28} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">Current CV</h3>
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {shownCV.name}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button
                      variant="outline"
                      onClick={handleView}
                      className="flex items-center gap-2 cursor-pointer"
                      disabled={isDeleting || isUploading || isUpdating}
                    >
                      <Eye size={16} />
                      View CV
                    </Button>

                    <label
                      htmlFor="cv-upload-existing"
                      className={`cursor-pointer ${
                        isDeleting || isUploading || isUpdating
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      <Button
                        variant="outline"
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={() =>
                          document.getElementById("cv-upload-existing")?.click()
                        }
                        disabled={isDeleting || isUploading || isUpdating}
                      >
                        <UploadCloud size={16} />
                        Replace CV
                      </Button>
                      <input
                        id="cv-upload-existing"
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        onChange={handleFileChange}
                        disabled={isDeleting || isUploading || isUpdating}
                      />
                    </label>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          className="flex items-center gap-2 cursor-pointer"
                          disabled={isDeleting || isUploading || isUpdating}
                        >
                          {isDeleting ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <Trash2 size={16} />
                          )}
                          {isDeleting ? "Deleting..." : "Delete CV"}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. Your CV will be
                            permanently deleted.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="cursor-pointer">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            className="cursor-pointer"
                            onClick={handleDelete}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ) : (
                <div
                  {...getRootProps()}
                  className={`border-3 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                    isDragActive
                      ? "border-primary bg-primary/5"
                      : "border-muted-foreground/20 hover:border-primary/50 hover:bg-muted/50"
                  } ${
                    isDeleting || isUploading || isUpdating
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  <input {...getInputProps()} />
                  <div className="flex flex-col items-center gap-4">
                    <div className="p-3 rounded-full bg-primary/10">
                      <UploadCloud className="h-10 w-10 text-primary" />
                    </div>
                    <div>
                      <p className="text-lg font-medium">
                        {isDragActive
                          ? "Drop your CV here"
                          : "Drag and drop your CV here"}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        or click to browse files (PDF only)
                      </p>
                      <Button
                        className="cursor-pointer mt-2"
                        variant="secondary"
                        disabled={isDeleting || isUploading || isUpdating}
                      >
                        Browse Files
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>

        <CardFooter className="flex justify-between">
          <div className="flex items-center text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4 mr-2" />
            Only PDF files are accepted (max 2MB)
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
