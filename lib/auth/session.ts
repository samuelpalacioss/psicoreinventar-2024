import { cache } from "react";
import { auth } from "./auth";
import { headers } from "next/headers";

// For server components getCurrentUser
export const getServerSession = cache(async () => {
  console.log("getServerSession called");
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
});
