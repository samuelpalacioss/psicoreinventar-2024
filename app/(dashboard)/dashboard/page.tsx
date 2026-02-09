import { DashboardContainer } from "@/components/dashboard/dashboard-container";
import { DashboardContainerSkeleton } from "@/components/dashboard/dashboard-container-skeleton";
import SignOutButton from "@/components/sign-out-button";
import { getServerSession } from "@/lib/auth/session";
import { Role } from "@/src/types";
import { Suspense } from "react";

// const boilerplateUser = {
//   name: "Samuel Palacios",
//   role: Role.PATIENT, // Change to "doctor" to test doctor view
// };

// const { name, role } = boilerplateUser;
export default function Page() {
  return (
    <Suspense fallback={<DashboardPageFallback />}>
      <DashboardPageContent />
    </Suspense>
  );
}

async function DashboardPageContent() {
  const session = await getServerSession();
  const { name: userName, role: userRole } = session?.user ?? {};

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
      <span>holaaaa</span>
      <SignOutButton />
    </DashboardContainer>
  );
}

function DashboardPageFallback() {
  return <DashboardContainerSkeleton />;
}
