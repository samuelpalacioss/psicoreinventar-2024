"use client";

import { useState } from "react";
import { DataTable } from "@/components/dashboard/data-table";
import { NewAppointmentButton } from "@/components/dashboard/add-appointment-modal";
import { EditAppointmentModal } from "@/components/dashboard/edit-appointment-modal";
import { AppointmentProgressModal } from "@/components/dashboard/appointment-progress-modal";
import {
  createAppointmentColumns,
  type Appointment,
} from "@/components/dashboard/appointments-columns";
import type { AppointmentPatientOption } from "@/components/dashboard/add-appointment-modal";
import type { AppointmentServiceOption } from "@/components/dashboard/add-appointment-modal";
import { AppointmentStatus } from "@/src/types";

interface AppointmentsTableProps {
  appointments: Appointment[];
  patients: AppointmentPatientOption[];
  services: AppointmentServiceOption[];
  perspective: "provider" | "client";
}

export function AppointmentsTable({
  appointments,
  patients,
  services,
  perspective,
}: AppointmentsTableProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [progressOpen, setProgressOpen] = useState(false);
  const [progressMode, setProgressMode] = useState<"view" | "edit">("view");
  const [selectedProgressAppointment, setSelectedProgressAppointment] = useState<Appointment | null>(null);

  const columns = createAppointmentColumns(perspective, {
    onEdit: (appointment) => {
      setSelectedAppointment(appointment);
      setEditOpen(true);
    },
    onEditProgress: (appointment) => {
      if (!appointment.progressId) return;
      setSelectedProgressAppointment(appointment);
      setProgressMode("edit");
      setProgressOpen(true);
    },
    onViewProgress: (appointment) => {
      setSelectedProgressAppointment(appointment);
      setProgressMode("view");
      setProgressOpen(true);
    },
  });

  return (
    <>
      <DataTable
        data={appointments}
        columns={columns}
        searchKey={["patientName", "patientCi", "startDateTime"]}
        searchPlaceholder="Search by patient name, CI, date"
        filterKey="status"
        filterTitle="Status"
        filterLabels={AppointmentStatus}
        actions={
          perspective === "provider"
            ? <NewAppointmentButton patients={patients} services={services} />
            : undefined
        }
      />
      <EditAppointmentModal
        key={selectedAppointment?.id ?? "edit-modal"}
        open={editOpen}
        onOpenChange={setEditOpen}
        appointment={editOpen ? selectedAppointment : null}
      />
      <AppointmentProgressModal
        open={progressOpen}
        onOpenChange={setProgressOpen}
        appointment={progressOpen ? selectedProgressAppointment : null}
        mode={progressMode}
        onSaved={() => window.location.reload()}
      />
    </>
  );
}
