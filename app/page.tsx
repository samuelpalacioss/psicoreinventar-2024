import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Home() {
  return (
    <main className='space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32'>
      <h1 className='font-semibold text-3xl md:text-7xl'>
        Welcome to <span className='text-blue-500'>Psicoreinventar</span>
      </h1>
      <div className='buttons-wrapper space-x-4'>
        <Button>
          <Link href='/register'>Sign up</Link>
        </Button>
        <Button>
          <Link href='/login'>Login</Link>
        </Button>
      </div>
    </main>
  );
}
