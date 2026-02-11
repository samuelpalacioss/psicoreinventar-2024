import { DashboardContainer } from "@/components/dashboard/dashboard-container";
import { Suspense } from "react";
import { appointmentsColumns, type Appointment } from "@/components/dashboard/appointments-columns";
import { DataTable } from "@/components/dashboard/data-table";
import { ActionNewButton } from "@/components/dashboard/action-new-button";
import { AppointmentStatus } from "@/src/types";

const mockAppointments: Appointment[] = [
  {
    id: 1,
    patientName: "Luanna Martelli",
    patientCi: 12345678,
    startDateTime: "2024-02-15T09:00:00",
    endDateTime: "2024-02-15T09:45:00",
    serviceName: "Talk Therapy",
    status: "scheduled",
    paymentAmount: 80.00,
    notes: "First session - anxiety management",
    cancellationReason: null,
  },
  {
    id: 2,
    patientName: "Carlos Rodriguez",
    patientCi: 87654321,
    startDateTime: "2024-02-15T14:30:00",
    endDateTime: "2024-02-15T15:30:00",
    serviceName: "Couples Therapy",
    status: "confirmed",
    paymentAmount: 120.00,
    notes: "Session with partner - communication issues",
    cancellationReason: null,
  },
  {
    id: 3,
    patientName: "Ana Martinez",
    patientCi: 45678912,
    startDateTime: "2024-02-14T10:00:00",
    endDateTime: "2024-02-14T10:45:00",
    serviceName: "Talk Therapy",
    status: "completed",
    paymentAmount: 80.00,
    notes: "Follow-up session - good progress",
    cancellationReason: null,
  },
  {
    id: 4,
    patientName: "Luis Fernandez",
    patientCi: 98765432,
    startDateTime: "2024-02-13T16:00:00",
    endDateTime: "2024-02-13T17:00:00",
    serviceName: "Teen Therapy",
    status: "cancelled",
    paymentAmount: 90.00,
    notes: "Initial consultation scheduled",
    cancellationReason: "Cancelado por el paciente",
  },
];


export default function AppointmentsPage() {
  return (
    <DashboardContainer
      title="Appointments"
      description="View and manage your upcoming appointments. Here you can see all scheduled sessions and their status."
    >
      <Suspense fallback={<div>Loading...</div>}>
        <DataTable
          data={mockAppointments}
          columns={appointmentsColumns}
          searchKey={["patientName", "patientCi", "startDateTime"]}
          searchPlaceholder="Search by patient name, CI, date"
          filterKey="status"
          filterTitle="Status"
          filterLabels={AppointmentStatus}
          actions={<ActionNewButton label="New Appointment" icon="plus" />}
        />
      </Suspense>
    </DashboardContainer>
  );
}
