import { redirect } from "next/navigation";
import { DashboardContainer } from "@/components/dashboard/dashboard-container";
import { getServerSession } from "@/lib/auth/session";
import { AUTH_ROUTES } from "@/config/auth";
import { Role } from "@/src/types";
import { hasPermission } from "@/utils/api/authorization/permissions";
import { Suspense } from "react";
import { DataTable } from "@/components/dashboard/data-table";
import { progressColumns, type Progress } from "@/components/dashboard/progress-columns";

const mockProgresses: Progress[] = [
  {
    id: 1,
    doctorName: "Dr. Sofia Herrera",
    appointmentId: 3,
    conditionName: "Anxiety",
    title: "Breathing techniques introduced",
    level: "moderate",
    notes: "Patient responded well to diaphragmatic breathing exercises. Will continue next session.",
    createdAt: "2024-02-14T10:45:00",
  },
  {
    id: 2,
    doctorName: "Dr. Sofia Herrera",
    appointmentId: 5,
    conditionName: "Anxiety",
    title: "Cognitive restructuring — first steps",
    level: "good",
    notes: "Identified three recurring negative thought patterns. Patient engaged and motivated.",
    createdAt: "2024-02-21T10:45:00",
  },
  {
    id: 3,
    doctorName: "Dr. Sofia Herrera",
    appointmentId: 8,
    conditionName: "Self-Esteem",
    title: "Self-compassion journaling started",
    level: "good",
    notes: "Patient completed daily journal entries for the full week prior to session.",
    createdAt: "2024-03-01T10:45:00",
  },
  {
    id: 4,
    doctorName: "Dr. Sofia Herrera",
    appointmentId: 11,
    conditionName: "Anxiety",
    title: "Exposure hierarchy completed",
    level: "great",
    notes: "Patient successfully faced all items on the social anxiety exposure list. Significant milestone.",
    createdAt: "2024-03-15T10:45:00",
  },
  {
    id: 5,
    doctorName: "Dr. Sofia Herrera",
    appointmentId: null,
    conditionName: "Depression",
    title: "Sleep hygiene review",
    level: "low",
    notes: "Patient reported irregular sleep schedule. Recommended structured bedtime routine.",
    createdAt: "2024-03-22T10:45:00",
  },
];

export default async function ProgressPage() {
  const session = await getServerSession();

  if (!session?.user) {
    redirect(AUTH_ROUTES.LOGIN);
  }

  const canList = hasPermission(session.user.role as Role, "progress", "list");
  if (!canList || canList === "none") {
    redirect("/dashboard");
  }

  return (
    <DashboardContainer
      title="Progress"
      description="Track your therapeutic journey and see how far you've come. Review notes and milestones from your sessions."
    >
      <Suspense fallback={<div>Loading...</div>}>
        <DataTable
          data={mockProgresses}
          columns={progressColumns}
          searchKey={["title", "conditionName", "doctorName"]}
          searchPlaceholder="Search by title, condition, doctor"
          filterKey="level"
          filterTitle="Level"
          filterLabels={{
            low: "Low",
            moderate: "Moderate",
            good: "Good",
            great: "Great",
          }}
        />
      </Suspense>
    </DashboardContainer>
  );
}
