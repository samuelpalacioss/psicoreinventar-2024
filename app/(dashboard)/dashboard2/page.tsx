// import getProducts from "@/utilities/get-products";
import { DataTable } from "@/components/dashboard2/data-table";
import { columns } from "@/components/dashboard2/columns";
// import { prisma } from "@/lib/db";
// import { auth } from "@/auth";
import ButtonRegisterDoctor from "@/components/button-register-doctor";

async function getPatients() {
  // TODO: Replace with your database solution
  // const patients = await prisma.user.findMany({
  //   where: {
  //     role: "patient",
  //   },
  //   select: {
  //     id: true,
  //     name: true,
  //     email: true,
  //     phone: true,
  //     isActive: true,
  //   },
  // });

  // const patientsCoolId = patients.map((patient) => {
  //   return {
  //     ...patient,
  //     id: patient.id.slice(0, 12), // First 12 chars
  //   };
  // });

  // return patientsCoolId;
  return [];
}

export default async function DashboardPage() {
  const clients = await getPatients();

  return (
    <div className="py-6 md:py-10 space-y-4">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">Overview</h1>

      <ButtonRegisterDoctor />
      <DataTable columns={columns} data={clients} />
    </div>
  );
}
