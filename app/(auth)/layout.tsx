import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Icons } from '@/components/icons';

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className='flex h-screen flex-col justify-center items-center mx-auto max-w-7xl px-4 md:px-6 lg:px-8 relative'>
      <Link
        href='/'
        className={cn(buttonVariants({ variant: 'ghost' }), 'px-0 absolute top-5 left-5')}
      >
        <Icons.chevronLeft className='mr-2 h-4 w-4' />
        Go Back
      </Link>
      <div className='w-full flex justify-center items-center'>{children}</div>
    </div>
  );
}
