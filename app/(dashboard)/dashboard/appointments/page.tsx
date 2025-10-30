// import getProducts from '@/utilities/get-products';
// import { Product } from '@/lib/validations/product';
import ButtonCheckout from '@/components/checkout-button';
import DashboardContainer from '@/components/dashboard-container';
import { DataTable } from '@/components/dashboard/data-table';
import { columns } from '@/components/dashboard/columns';
import { prisma } from '@/lib/db';
import Container from '@/components/container';

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

export default async function AppointmentsPage() {
  // const clients = await getPatients();
  // const products = await getProducts();
  return (
    <div className='py-6 md:py-10 space-y-4'>
      <h1 className='text-3xl font-bold tracking-tight text-gray-900 md:text-4xl'>Appointments</h1>
      {/* <DataTable columns={columns} data={clients} /> */}
    </div>

  );
}
