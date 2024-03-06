import { auth } from '@/auth';
import Navbar from '@/components/main-nav';
import Sidebar from '@/components/sidebar';
import { buttonVariants } from '@/components/ui/button';
import { dashboardConfig } from '@/config/dashboard';
import { cn } from '@/lib/utils';

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const user = session?.user;
  console.log(user);

  return (
    <div className='flex flex-col min-h-screen space-y-6'>
      <header className='sticky top-0 bg-gray-50 shadow inset-x-0 z-[10] '>
        <div className='container '>
          <Navbar className='max-w-none' user={user} />
        </div>
      </header>

      <div className='container grid gap-4 md:grid-cols-[200px_1fr]'>
        <aside className='hidden w-[200px] flex-col md:flex'>
          <Sidebar items={dashboardConfig.sidebarNav} />
        </aside>
        <main className='flex w-full flex-col'>{children}</main>
      </div>
    </div>
  );
}
