import prisma from '@/lib/db';
import RegisterDoctorForm from '@/components/register-doctor-form';
import { Option } from '@/components/ui/multiple-selector';

async function getSpecialties() {
  const specialties = await prisma.specialty.findMany();
  return specialties;
}

export default async function RegisterDoctorPage() {
  const specialties = await getSpecialties();

  const options: Option[] = specialties.map((specialty) => ({
    label: specialty.name,
    value: specialty.id,
  }));
  return (
    // <h1 className='text-3xl font-bold tracking-tight text-gray-900 md:text-4xl'>
    //   Register Doctor Page
    // </h1>

    <RegisterDoctorForm specialties={options} />
  );
}
