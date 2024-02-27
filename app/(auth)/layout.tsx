import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { FaChevronLeft } from 'react-icons/fa6';

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={`flex h-screen flex-col mx-auto max-w-7xl px-4 md:px-6 lg:px-8`}>
      <Link href='/' className={cn(buttonVariants({ variant: 'ghost' }), 'px-0 absolute top-5')}>
        <FaChevronLeft className='mr-2 h-4 w-4' />
        Go Back
      </Link>
      {children}
    </div>
  );
}
