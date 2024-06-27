import getProducts from '@/utilities/get-products';
import { Product } from '@/lib/validations/product';
import ButtonCheckout from '@/components/checkout-button';
import DashboardContainer from '@/components/dashboard-container';
import { DataTable } from '@/components/dashboard/data-table';
import { columns } from '@/components/dashboard/columns';
import prisma from '@/lib/db';
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

export default async function DashboardPage() {
  const clients = await getPatients();
  const products = await getProducts();
  return (
    <div className='py-6 md:py-10 space-y-4'>
      <h1 className='text-3xl font-bold tracking-tight text-gray-900 md:text-4xl'>Overview</h1>
      <DataTable columns={columns} data={clients} />
    </div>

    // <DashboardContainer>
    //   <div className='grid grid-cols-1 gap-6 mt-6 md:gap-y-10 md:max-w-5xl lg:grid-cols-2'>
    //     {products.length > 0 &&
    //       products.map((product: Product) => (
    //         <div
    //           key={product.stripeId}
    //           className='flex flex-col justify-between rounded-3xl bg-white p-8 shadow-xl ring-1 ring-gray-900/10 sm:p-10'
    //         >
    //           <div>
    //             <h3 className='text-base font-semibold leading-7 text-indigo-600'>
    //               {product.name}
    //             </h3>
    //             <div className='mt-4 flex items-baseline gap-x-2'>
    //               <span className='text-5xl font-bold tracking-tight text-gray-900'>
    //                 {/*@currently zod doesnt support decimals validation */}${product.price}.99
    //               </span>
    //               <span className='text-base font-semibold leading-7 text-gray-600'>
    //                 / {product.time}
    //               </span>
    //             </div>
    //             <p className='mt-6 text-base leading-7 text-gray-600'>{product.description}</p>
    //           </div>
    //           <ButtonCheckout
    //             text='Buy now'
    //             className='mt-8'
    //             stripeId={product.stripeId!}
    //             priceId={product.priceId!}
    //           />
    //         </div>
    //       ))}
    //   </div>
    // </DashboardContainer>
  );
}
