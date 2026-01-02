import { DashboardContainer } from "@/components/dashboard/dashboard-container";

export default function PatientsPage() {
  return (
    <DashboardContainer
      title="Patients"
      description="View and manage your patient list. Access patient profiles and session history."
    >
      <div className="text-gray-500">Patients table will be displayed here.</div>
    </DashboardContainer>
  );
}
