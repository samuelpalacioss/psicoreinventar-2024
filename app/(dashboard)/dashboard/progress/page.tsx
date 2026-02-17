import { redirect } from "next/navigation";
import { DashboardContainer } from "@/components/dashboard/dashboard-container";
import { getServerSession } from "@/lib/auth/session";
import { AUTH_ROUTES } from "@/config/auth";
import { Role } from "@/src/types";
import { hasPermission } from "@/utils/api/authorization/permissions";

export default async function ProgressPage() {
  const session = await getServerSession();

  if (!session?.user) {
    redirect(AUTH_ROUTES.LOGIN);
  }

  const canList = hasPermission(session.user.role as Role, "progress", "list");
  if (!canList || canList === "none") {
    redirect("/dashboard");
  }

  return (
    <DashboardContainer
      title="Progress"
      description="Track your therapeutic journey and see how far you've come. Review notes and milestones from your sessions."
    >
      <div className="text-gray-500">Progress content will be displayed here.</div>
    </DashboardContainer>
  );
}
