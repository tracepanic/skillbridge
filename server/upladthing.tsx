"use server";

import { UTApi } from "uploadthing/server";

export async function deleteUploadthingCV(name: string) {
  const utapi = new UTApi({});

  // Deleting CV is currently not working

  await utapi.deleteFiles(name);
}
