import { DashboardContainer } from "@/components/dashboard/dashboard-container";

export default function ProgressPage() {
  return (
    <DashboardContainer
      title="Progress"
      description="Track your therapeutic journey and see how far you've come. Review notes and milestones from your sessions."
    >
      <div className="text-gray-500">Progress content will be displayed here.</div>
    </DashboardContainer>
  );
}
