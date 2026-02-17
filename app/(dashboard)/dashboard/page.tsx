import { Suspense } from "react";
import { redirect } from "next/navigation";
import { DashboardContainer } from "@/components/dashboard/dashboard-container";
import { DashboardContainerSkeleton } from "@/components/dashboard/dashboard-container-skeleton";
import SignOutButton from "@/components/sign-out-button";
import { getServerSession } from "@/lib/auth/session";
import { AUTH_ROUTES } from "@/config/auth";
import { Role } from "@/src/types";

export default async function Page() {
  const session = await getServerSession();

  if (!session?.user) {
    redirect(AUTH_ROUTES.LOGIN);
  }

  const { name: userName, role: userRole } = session.user;

  const greeting =
    userRole === Role.DOCTOR ? `Hello doc ${userName}` : `Hello my friend ${userName}`;

  return (
    <DashboardContainer
      title={greeting}
      description={
        userRole === Role.DOCTOR
          ? "Welcome back to your practice dashboard."
          : "Welcome back to your wellness journey."
      }
    >
      <Suspense fallback={<DashboardContainerSkeleton />}>
        <span>holaaaa</span>
        <SignOutButton />
      </Suspense>
    </DashboardContainer>
  );
}
