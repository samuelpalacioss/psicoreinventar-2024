import { Suspense } from "react";
import { patientsColumns, type Patient } from "@/components/dashboard/clients-columns";
import { DashboardContainer } from "@/components/dashboard/dashboard-container";
import { DataTable } from "@/components/dashboard/data-table";
import { ActionNewButton } from "@/components/dashboard/action-new-button";

const mockPatients: Patient[] = [
  {
    id: 1,
    ci: 12345678,
    name: "Luanna Martelli",
    birthDate: "1985-03-15",
    age: 39,
    phone: "04121234567",
    email: "lua.martelli@gmail.com",
    totalSessions: 12,
    totalBilled: 1200.00,
    lastAppointment: "2024-02-01",
    filesCount: 8,
  },
  {
    id: 2,
    ci: 23456789,
    name: "Carlos Rodríguez",
    birthDate: "1990-07-22",
    age: 34,
    phone: "04142345678",
    email: "carlos.rodriguez@gmail.com",
    totalSessions: 8,
    totalBilled: 800.00,
    lastAppointment: "2024-01-28",
    filesCount: 5,
  },
  {
    id: 3,
    ci: 34567890,
    name: "Ana Martínez",
    birthDate: "1978-11-10",
    age: 46,
    phone: "04243456789",
    email: "ana.martinez@gmail.com",
    totalSessions: 24,
    totalBilled: 2400.00,
    lastAppointment: "2024-02-05",
    filesCount: 15,
  },
  {
    id: 4,
    ci: 45678901,
    name: "Luis Fernández",
    birthDate: "2000-05-18",
    age: 24,
    phone: "04164567890",
    email: "luis.fernandez@gmail.com",
    totalSessions: 4,
    totalBilled: 400.00,
    lastAppointment: "2024-01-20",
    filesCount: 3,
  },
  {
    id: 5,
    ci: 56789012,
    name: "Sofia López",
    birthDate: "1995-09-30",
    age: 29,
    phone: "04245678901",
    email: "sofia.lopez@gmail.com",
    totalSessions: 16,
    totalBilled: 1600.00,
    lastAppointment: "2024-02-08",
    filesCount: 10,
  },
  {
    id: 6,
    ci: 67890123,
    name: "Pedro Sánchez",
    birthDate: "1982-12-05",
    age: 42,
    phone: "04126789012",
    email: "pedro.sanchez@gmail.com",
    totalSessions: 0,
    totalBilled: 0.00,
    lastAppointment: null,
    filesCount: 0,
  },
];

export default function PatientsPage() {
  return (
    <DashboardContainer
      title="Patients"
      description="View and manage your patient list. Access patient profiles and session history."
    >
      <Suspense fallback={<div>Loading...</div>}>
        <DataTable
          data={mockPatients}
          columns={patientsColumns}
          searchKey={["ci", "name", "email", "phone"]}
          searchPlaceholder="Search by CI, name, email or phone"
          actions={
            <ActionNewButton label="New patient" icon="plus" />
          } />
      </Suspense>
    </DashboardContainer>
  );
}
