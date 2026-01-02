import { DashboardContainer } from "@/components/dashboard/dashboard-container";

export default function AppointmentsPage() {
  return (
    <DashboardContainer
      title="Appointments"
      description="View and manage your upcoming appointments. Here you can see all scheduled sessions and their status."
    >
      <div className="text-gray-500">Appointments table will be displayed here.</div>
    </DashboardContainer>
  );
}
