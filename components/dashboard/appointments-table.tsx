"use client";

import { useState } from "react";
import { DataTable } from "@/components/dashboard/data-table";
import { NewAppointmentButton } from "@/components/dashboard/add-appointment-modal";
import { EditAppointmentModal } from "@/components/dashboard/edit-appointment-modal";
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
}

export function AppointmentsTable({
  appointments,
  patients,
  services,
}: AppointmentsTableProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const columns = createAppointmentColumns("provider", {
    onEdit: (appointment) => {
      setSelectedAppointment(appointment);
      setEditOpen(true);
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
          <NewAppointmentButton patients={patients} services={services} />
        }
      />
      <EditAppointmentModal
        key={selectedAppointment?.id ?? "edit-modal"}
        open={editOpen}
        onOpenChange={setEditOpen}
        appointment={editOpen ? selectedAppointment : null}
      />
    </>
  );
}
