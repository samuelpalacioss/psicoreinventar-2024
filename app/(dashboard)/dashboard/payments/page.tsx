import { redirect } from "next/navigation";
import { DashboardContainer } from "@/components/dashboard/dashboard-container";
import { getServerSession } from "@/lib/auth/session";
import { AUTH_ROUTES } from "@/config/auth";

export default async function PaymentsPage() {
  const session = await getServerSession();

  if (!session?.user) {
    redirect(AUTH_ROUTES.LOGIN);
  }

  return (
    <DashboardContainer
      title="Payments"
      description="View your payment history and manage billing information for your sessions."
    >
      <div className="text-gray-500">Payments table will be displayed here.</div>
    </DashboardContainer>
  );
}
