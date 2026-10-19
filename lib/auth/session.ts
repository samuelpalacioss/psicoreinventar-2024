import { cache } from "react";
import { cookies } from "next/headers";
import { auth } from "./auth";

// For server components and server actions.
// In Next.js 16, cookies()/headers() must be read outside cached functions.
const getCachedServerSession = cache(async (cookieHeader: string) =>
  auth.api.getSession({
    headers: {
      cookie: cookieHeader,
    },
  })
);

export async function getServerSession(cookieHeader?: string) {
  const resolvedCookieHeader = cookieHeader ?? (await cookies()).toString();

  return getCachedServerSession(resolvedCookieHeader);
}
