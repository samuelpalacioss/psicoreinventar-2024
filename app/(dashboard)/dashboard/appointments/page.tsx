import { DashboardContainer } from "@/components/dashboard/dashboard-container";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { type Appointment } from "@/components/dashboard/appointments-columns";
import { AppointmentsTable } from "@/components/dashboard/appointments-table";
import { getServerSession } from "@/lib/auth/session";
import { AUTH_ROUTES } from "@/config/auth";
import { Role } from "@/src/types";
import { hasPermission } from "@/utils/api/authorization/permissions";
import { findDoctorByUserId } from "@/src/dal/doctors";
import { findPatients } from "@/src/dal/persons";
import { findAllServicesForDoctor } from "@/src/dal/services";

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


export default async function AppointmentsPage() {
  const session = await getServerSession();

  if (!session?.user) {
    redirect(AUTH_ROUTES.LOGIN);
  }

  const canList = hasPermission(session.user.role as Role, "appointment", "list");
  if (!canList || canList === "none") {
    redirect("/dashboard");
  }

  const doctor = await findDoctorByUserId(session.user.id);
  const patientsForAppointment: Awaited<ReturnType<typeof findPatients>>["data"] = doctor
    ? (
      await findPatients(doctor.id, {
        page: 1,
        limit: 500,
        offset: 0,
      })
    ).data
    : [];
  const servicesForAppointment: Awaited<ReturnType<typeof findAllServicesForDoctor>> = doctor
    ? await findAllServicesForDoctor(doctor.id)
    : [];

  return (
    <DashboardContainer
      title="Appointments"
      description="View and manage your upcoming appointments. Here you can see all scheduled sessions and their status."
    >
      <Suspense fallback={<div>Loading...</div>}>
        <AppointmentsTable
          appointments={mockAppointments}
          patients={patientsForAppointment}
          services={servicesForAppointment}
        />
      </Suspense>
    </DashboardContainer>
  );
}
