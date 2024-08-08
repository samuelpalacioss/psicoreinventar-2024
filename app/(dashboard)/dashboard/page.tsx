import getProducts from '@/utilities/get-products';

import { DataTable } from '@/components/dashboard/data-table';
import { columns } from '@/components/dashboard/columns';
import prisma from '@/lib/db';

import ButtonRegisterDoctor from '@/components/button-register-doctor';

async function getPatients() {
  const patients = await prisma.user.findMany({
    where: {
      role: 'patient',
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      isActive: true,
    },
  });

  const patientsCoolId = patients.map((patient) => {
    return {
      ...patient,
      id: patient.id.slice(0, 12), // First 12 chars
    };
  });

  return patientsCoolId;
}

export default async function DashboardPage() {
  const clients = await getPatients();
  // const products = await getProducts();
  return (
    <div className='py-6 md:py-10 space-y-4'>
      <h1 className='text-3xl font-bold tracking-tight text-gray-900 md:text-4xl'>Overview</h1>
      <ButtonRegisterDoctor />
      <DataTable columns={columns} data={clients} />
    </div>
  );
}
