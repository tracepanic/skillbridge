import { Toaster } from "@/components/ui/sonner";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import type { Metadata } from "next";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "./api/uploadthing/core";
import "./globals.css";

export const metadata: Metadata = {
  title: "SkillBridge",
  description: "Empower Your Future with AI-Driven Skills",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster />
        <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
      </body>
    </html>
  );
}
