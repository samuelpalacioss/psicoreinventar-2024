import { auth } from '@/auth';
import Navbar from '@/components/main-nav';
import Sidebar from '@/components/sidebar';
import { buttonVariants } from '@/components/ui/button';
import { dashboardConfig } from '@/config/dashboard';
import { cn } from '@/lib/utils';
import Container from '@/components/container';

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
        <div className='mx-4'>
          <Navbar className='max-w-none' user={user} />
        </div>
      </header>

      {/* This creates overflow (!!without grid no), changed it to flex*/}
      <div className='mx-8 flex gap-4'>
        <aside className='hidden w-[150px] flex-col md:flex'>
          <Sidebar items={dashboardConfig.sidebarNav} />
        </aside>
        <main className='flex w-full flex-col'>{children}</main>
      </div>
      {/* <main>
        <Container>{children}</Container>
      </main> */}
    </div>
  );
}
