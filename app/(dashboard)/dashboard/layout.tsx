import Navbar from '@/components/navbar';
import Sidebar from '@/components/sidebar';
import { buttonVariants } from '@/components/ui/button';
import { dashboardConfig } from '@/config/dashboard';
import { cn } from '@/lib/utils';

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
      <Navbar />
      <div className='container grid gap-12 md:grid-cols-[200px_1fr]'>
        <aside className='hidden w-[200px] flex-col md:flex'>
          <Sidebar items={dashboardConfig.sidebarNav} />
        </aside>
        <main className='flex w-full flex-col overflow-hidden'>{children}</main>N
      </div>
    </div>
  );
}
