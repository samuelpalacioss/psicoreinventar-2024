// import { prisma } from '@/lib/db';
import RegisterDoctorForm from '@/components/register-doctor-form';
import { Option } from '@/components/ui/multiple-selector';
import { Suspense } from 'react';

async function getSpecialties() {
  // TODO: Replace with your database solution
  // const specialties = await prisma.specialty.findMany();
  // return specialties;
  return [];
}

export default async function RegisterDoctorPage() {
  const specialties = await getSpecialties();

  const options: Option[] = specialties.map((specialty) => ({
    label: specialty.name,
    value: specialty.name,
  }));
  return (
    <Suspense>
      <RegisterDoctorForm specialties={options} />
    </Suspense>
  );
}
