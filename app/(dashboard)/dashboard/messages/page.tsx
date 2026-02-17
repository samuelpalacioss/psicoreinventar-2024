import { redirect } from "next/navigation";
import { DashboardContainer } from "@/components/dashboard/dashboard-container";
import { getServerSession } from "@/lib/auth/session";
import { AUTH_ROUTES } from "@/config/auth";

export default async function MessagesPage() {
  const session = await getServerSession();

  if (!session?.user) {
    redirect(AUTH_ROUTES.LOGIN);
  }

  return (
    <DashboardContainer
      title="Messages"
      description="Communicate with your doctor/patients. View and respond to messages securely."
    >
      <div className="text-gray-500">Messages will be displayed here.</div>
    </DashboardContainer>
  );
}
