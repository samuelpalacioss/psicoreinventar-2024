import { Separator } from '@/components/ui/separator';
import { CardContent, Card } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import getOrder from '@/utilities/get-order';
import formatPrice from '@/utilities/format-price';

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: { session_id: string };
}) {
  const session_id = searchParams.session_id;
  const order = await getOrder(session_id);
  // console.log(order);

  return (
    <div className='flex flex-col items-center justify-start pt-12 space-y-4 md:space-y-8 px-4 md:px-6'>
      <div className='flex flex-col items-center space-y-2'>
        <svg
          className='h-12 w-12 text-green-600'
          xmlns='http://www.w3.org/2000/svg'
          width='24'
          height='24'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        >
          <path d='M22 11.08V12a10 10 0 1 1-5.93-9.14' />
          <polyline points='22 4 12 14.01 9 11.01' />
        </svg>

        <h1 className='font-bold text-3xl tracking-tighter'>Payment Successful</h1>
        <p className='text-center text-gray-500 md:w-1/2 dark:text-gray-400'>
          Your payment has been successfully processed. We look forward to helping you on your
          journey towards well-being.
        </p>
      </div>
      <Card className='w-full max-w-sm p-0'>
        <CardContent className='p-0'>
          <div className='flex flex-col gap-2 p-4'>
            <div className='flex flex-col gap-1.5'>
              <h2 className='font-semibold text-sm'>Appointment ID</h2>
              <p className='text-sm'>{order.appointmentId}</p>
            </div>
            <div className='flex flex-col gap-1.5'>
              <h2 className='font-semibold text-sm'>Date of Appointment</h2>
              {/* send this in metadata with doctorId*/}
              <p className='text-sm'>February 14, 2023 (hardcoded)</p>
            </div>
            <div className='flex flex-col gap-1.5'>
              <h2 className='font-semibold text-sm'>Total</h2>
              <p className='text-sm'>{formatPrice(order.total)}</p>
            </div>
          </div>
          <Separator />
          <CardContent className='flex flex-col gap-2 p-4'>
            <div className='flex flex-col gap-2'>
              <h2 className='font-semibold text-sm'>Payment Method</h2>
              <p className='text-sm'>Card ending in {order.lastFourDigits}</p>
            </div>
            <div className='flex flex-col gap-2'>
              <h2 className='font-semibold text-sm'>Session type</h2>
              <p className='text-sm'>{order.product}</p>
            </div>
          </CardContent>
        </CardContent>
      </Card>
      <div className='flex w-full max-w-sm'>
        <Link href={'/dashboard'} className={cn(buttonVariants({ size: 'lg' }), 'w-full')}>
          Go back to dashboard
        </Link>
      </div>
    </div>
  );
}
