import { auth } from '@/auth';
import getProducts from '@/utilities/get-products';
import Link from 'next/link';
import { Product } from '@/lib/validations/product';
import ButtonCheckout from '@/components/checkout-button';
import SignOutButton from '@/components/sign-out-button';

export default async function DashboardPage() {
  const session = await auth();
  const products = await getProducts();
  return (
    <section className='py-16 sm:py-32'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <h3 className='text-md font-semibold leading-8 tracking-tight text-indigo-600'>
          Welcome to the secret Dashboard {session?.user?.name} {'  '} {session?.user?.role}
        </h3>
        <SignOutButton />

        <div className='grid grid-cols-1 gap-6 mt-6 sm:grid-cols-2 md:gap-y-10 md:max-w-5xl lg:grid-cols-2'>
          {products.length > 0 &&
            products.map((product: Product) => (
              <div
                key={product.stripeId}
                className='flex flex-col justify-between rounded-3xl bg-white p-8 shadow-xl ring-1 ring-gray-900/10 sm:p-10'
              >
                <div>
                  <h3 className='text-base font-semibold leading-7 text-indigo-600'>
                    {product.name}
                  </h3>
                  <div className='mt-4 flex items-baseline gap-x-2'>
                    <span className='text-5xl font-bold tracking-tight text-gray-900'>
                      ${product.price}
                    </span>
                    <span className='text-base font-semibold leading-7 text-gray-600'>
                      / {product.time}
                    </span>
                  </div>
                  <p className='mt-6 text-base leading-7 text-gray-600'>{product.description}</p>
                </div>
                <ButtonCheckout
                  text='Buy now'
                  className='mt-8'
                  stripeId={product.stripeId!}
                  priceId={product.priceId!}
                />
              </div>
            ))}
        </div>
      </div>
    </section>
  );
}
