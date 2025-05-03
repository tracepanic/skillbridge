import { getSession } from "@/lib/session";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

export const ourFileRouter = {
  resume: f({ pdf: { maxFileSize: "2MB", maxFileCount: 1, minFileCount: 1 } })
    .middleware(async () => {
      const user = await getSession();
      if (!user) {
        throw new UploadThingError("You must be logged in to upload a resume");
      }
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Uploaded by user", metadata.userId);
      console.log("Uploaded file:", file);
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
