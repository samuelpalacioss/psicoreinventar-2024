import Navbar from '@/components/main-nav';
import Sidebar from '@/components/sidebar';
import { buttonVariants } from '@/components/ui/button';
import { dashboardConfig } from '@/config/dashboard';
import { cn } from '@/lib/utils';
import { Circle } from 'lucide-react';

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    //grid lg:grid-cols-5 max-w-7xl px-4`
    // <div className={`grid lg:grid-cols-5 max-w-7xl px-4`}>
    //   <Sidebar links={['hola']} />
    //   {children}
    // </div>
    <div className='flex flex-col'>
      <div className='container flex h-16 items-center justify-between py-4'>
        <Navbar />
        <Circle className='h-6 w-6' />
      </div>
      <div className='container grid gap-4 md:grid-cols-[200px_1fr]'>
        <aside className='hidden w-[200px] flex-col md:flex'>
          <Sidebar items={dashboardConfig.sidebarNav} />
        </aside>
        <main className='flex w-full flex-col overflow-hidden'>{children}</main>
      </div>
    </div>
  );
}
