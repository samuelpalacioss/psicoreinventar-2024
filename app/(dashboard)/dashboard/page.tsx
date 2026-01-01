import { DataTable } from "@/components/dashboard/data-table";
import { DashboardContainer } from "@/components/dashboard/dashboard-container";
import data from "./data.json";
import { SectionCards } from "@/components/dashboard/section-cards";

export default function Page() {
  return (
    <DashboardContainer
      title="Appointments"
      description="View and manage your upcoming appointments. Here you can see all scheduled sessions and their status."
    >
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <SectionCards />
        <div className="px-4 lg:px-6"></div>
        <DataTable data={data} />
      </div>
    </DashboardContainer>
  );
}
