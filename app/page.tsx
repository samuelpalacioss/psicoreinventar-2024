import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function Home() {
  return (
    <main className='space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32'>
      <h1 className='font-semibold text-3xl md:text-7xl'>
        Welcome to <span className='text-blue-500'>Psicoreinventar</span>
      </h1>
      <div className='buttons-wrapper space-x-4'>
        <Link href='/register' className={cn(buttonVariants({ size: 'sm' }))}>
          Sign up
        </Link>

        <Link href='/login' className={cn(buttonVariants({ size: 'sm' }))}>
          Login
        </Link>
      </div>
    </main>
  );
}
