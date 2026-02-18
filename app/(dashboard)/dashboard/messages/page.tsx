import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/session";
import { AUTH_ROUTES } from "@/config/auth";
import { Role } from "@/src/types";
import { ChatSkeleton } from "@/components/dashboard/messages/chat-skeleton";
import { MessagesLoader } from "@/components/dashboard/messages/messages-loader";

export default async function MessagesPage() {
  const session = await getServerSession();

  if (!session?.user) {
    redirect(AUTH_ROUTES.LOGIN);
  }

  const userRole = session.user.role as Role;

  return (
    <Suspense fallback={<ChatSkeleton />}>
      <MessagesLoader currentUserId={session.user.id} currentUserRole={userRole} />
    </Suspense>
  );
}
