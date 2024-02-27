import SignupForm from '@/components/sign-up-form';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { FaChevronLeft } from 'react-icons/fa6';

export default function RegisterPage() {
  return (
    <main className=''>
      <Link
        href='/'
        className={cn(
          buttonVariants({ variant: 'ghost' }),
          'absolute left-4 top-4 md:left-8 md:top-8'
        )}
      >
        <>
          <FaChevronLeft className='mr-2 h-4 w-4' />
          Go Back
        </>
      </Link>
      <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'>
        <SignupForm />
      </div>
    </main>
  );
}
