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
import { findPersonByUserId } from "@/src/dal/persons";
import { findPatients } from "@/src/dal/persons";
import { findAllServicesForDoctor } from "@/src/dal/services";
import { findAllAppointments } from "@/src/dal/appointments";
import { findPatientAppointments } from "@/src/dal/persons";

function formatName(parts: (string | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}

export default async function AppointmentsPage() {
  const session = await getServerSession();

  if (!session?.user) {
    redirect(AUTH_ROUTES.LOGIN);
  }

  const canList = hasPermission(session.user.role as Role, "appointment", "list");
  if (!canList || canList === "none") {
    redirect("/dashboard");
  }

  const role = session.user.role as Role;
  const isDoctor = role === Role.DOCTOR;

  let appointments: Appointment[] = [];
  let patientsForAppointment: Awaited<ReturnType<typeof findPatients>>["data"] = [];
  let servicesForAppointment: Awaited<ReturnType<typeof findAllServicesForDoctor>> = [];
  const perspective: "provider" | "client" = isDoctor ? "provider" : "client";

  if (isDoctor) {
    const doctor = await findDoctorByUserId(session.user.id);
    if (doctor) {
      const [{ data: rawAppointments }, patientsResult, services] = await Promise.all([
        findAllAppointments({ doctorId: doctor.id }, { page: 1, limit: 500, offset: 0 }),
        findPatients(doctor.id, { page: 1, limit: 500, offset: 0 }),
        findAllServicesForDoctor(doctor.id),
      ]);

      patientsForAppointment = patientsResult.data;
      servicesForAppointment = services;

      appointments = rawAppointments.map((appt) => ({
        patientId: appt.person?.id ?? 0,
        id: appt.id,
        patientName: formatName([
          appt.person?.firstName,
          appt.person?.middleName,
          appt.person?.firstLastName,
          appt.person?.secondLastName,
        ]),
        patientCi: appt.person?.ci ?? 0,
        startDateTime: appt.startDateTime.toISOString(),
        endDateTime: appt.endDateTime.toISOString(),
        serviceName: appt.doctorService?.service?.name ?? "",
        status: appt.status,
        paymentAmount: appt.payment ? parseFloat(appt.payment.amount) : 0,
        notes: appt.notes ?? null,
        progressId: appt.progresses?.[0]?.id ?? null,
        progressTitle: appt.progresses?.[0]?.title ?? null,
        progressLevel: appt.progresses?.[0]?.level ?? null,
        cancellationReason: appt.cancellationReason ?? null,
      }));
    }
  } else {
    const person = await findPersonByUserId(session.user.id);
    if (person) {
      const { data: rawAppointments } = await findPatientAppointments(person.id, {
        page: 1,
        limit: 500,
        offset: 0,
      });

      appointments = rawAppointments.map((appt) => ({
        patientId: person.id,
        id: appt.id,
        patientName: formatName([
          person.firstName,
          person.middleName,
          person.firstLastName,
          person.secondLastName,
        ]),
        patientCi: person.ci,
        doctorName: formatName([
          appt.doctor?.firstName,
          appt.doctor?.middleName,
          appt.doctor?.firstLastName,
          appt.doctor?.secondLastName,
        ]),
        startDateTime: appt.startDateTime.toISOString(),
        endDateTime: appt.endDateTime.toISOString(),
        serviceName: appt.doctorService?.service?.name,
        status: appt.status,
        paymentAmount: appt.payment ? parseFloat(appt.payment.amount) : 0,
        notes: appt.notes ?? null,
        progressId: appt.progresses?.[0]?.id ?? null,
        progressTitle: appt.progresses?.[0]?.title ?? null,
        progressLevel: appt.progresses?.[0]?.level ?? null,
        cancellationReason: appt.cancellationReason ?? null,
      }));
    }
  }

  return (
    <DashboardContainer
      title="Appointments"
      description="View and manage your upcoming appointments. Here you can see all scheduled sessions and their status."
    >
      <Suspense fallback={<div>Loading...</div>}>
        <AppointmentsTable
          appointments={appointments}
          patients={patientsForAppointment}
          services={servicesForAppointment}
          perspective={perspective}
        />
      </Suspense>
    </DashboardContainer>
  );
}
