import { DashboardContainer } from "@/components/dashboard/dashboard-container";

export default function PaymentsPage() {
  return (
    <DashboardContainer
      title="Payments"
      description="View your payment history and manage billing information for your sessions."
    >
      <div className="text-gray-500">Payments table will be displayed here.</div>
    </DashboardContainer>
  );
}
