"use server";

import { env } from "@/env";
import { SessionSchema } from "@/lib/schemas";
import { User } from "@/lib/types";
import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { z } from "zod";

export type Session = z.infer<typeof SessionSchema>;

const secret = new TextEncoder().encode(env.SESSION_SECRET);

export async function createSession(data: User) {
  const payload: Session = {
    id: data.id,
    name: data.name,
    email: data.email,
  };

  const session = await new SignJWT(payload)
    .setIssuedAt()
    .setExpirationTime("7d")
    .setProtectedHeader({ alg: "HS256" })
    .sign(secret);

  const expiredAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const cookieStore = await cookies();

  cookieStore.set({
    name: "session",
    value: session,
    httpOnly: true,
    secure: true,
    expires: expiredAt,
    sameSite: "lax",
    path: "/",
  });
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  if (!session) return null;

  try {
    const { payload } = await jwtVerify(session, secret, {
      algorithms: ["HS256"],
    });

    const result = SessionSchema.safeParse(payload);
    if (!result.success) {
      console.log("Invalid session payload");
      // await deleteSession();
      return null;
    }

    return result.data;
  } catch {
    console.log("Failed to verify the session");
    // await deleteSession();
    return null;
  }
}

export async function deleteSession() {
  (await cookies()).delete("session");
}
