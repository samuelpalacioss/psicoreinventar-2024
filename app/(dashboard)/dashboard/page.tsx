import getProducts from '@/utilities/get-products';
import { Product } from '@/lib/validations/product';
import ButtonCheckout from '@/components/checkout-button';
import DashboardContainer from '@/components/dashboard-container';

export default async function DashboardPage() {
  const products = await getProducts();
  return (
    <DashboardContainer className='mx-0'>
      <div className='grid grid-cols-1 gap-6 mt-6 md:gap-y-10 md:max-w-5xl lg:grid-cols-2'>
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
                    ${product.price}.99
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
    </DashboardContainer>
  );
}
