import { DashboardContainer } from "@/components/dashboard/dashboard-container";

export default function ProfilePage() {
  return (
    <DashboardContainer
      title="Profile"
      description="Manage your personal details and account settings."
    >
      <div className="text-gray-500">Profile settings will be displayed here.</div>
    </DashboardContainer>
  );
}
