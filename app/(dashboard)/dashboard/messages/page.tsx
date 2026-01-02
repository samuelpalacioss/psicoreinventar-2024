import { DashboardContainer } from "@/components/dashboard/dashboard-container";

export default function MessagesPage() {
  return (
    <DashboardContainer
      title="Messages"
      description="Communicate with your doctor/patients. View and respond to messages securely."
    >
      <div className="text-gray-500">Messages will be displayed here.</div>
    </DashboardContainer>
  );
}
