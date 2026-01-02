import { DashboardContainer } from "@/components/dashboard/dashboard-container";

export default function PayoutsPage() {
  return (
    <DashboardContainer
      title="Payouts"
      description="Track your earnings and manage payout settings. View transaction history."
    >
      <div className="text-gray-500">Payouts table will be displayed here.</div>
    </DashboardContainer>
  );
}
