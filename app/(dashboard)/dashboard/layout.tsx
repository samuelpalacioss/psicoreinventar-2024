import { auth } from '@/auth';
import Navbar from '@/components/main-nav';
import Sidebar from '@/components/sidebar';
import { buttonVariants } from '@/components/ui/button';
import { dashboardConfig } from '@/config/dashboard';
import { cn } from '@/lib/utils';
import Container from '@/components/container';

// export default async function DashboardLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   const session = await auth();
//   const user = session?.user;
//   console.log(user);

//   return (
//     <div className='flex flex-col min-h-screen space-y-6'>
//       <header className='sticky top-0 bg-gray-50 shadow inset-x-0 z-[10] '>
//         <div className='mx-4'>
//           <Navbar className='max-w-none' user={user} />
//         </div>
//       </header>

//       <div className='mx-8 flex gap-2 lg:gap-4'>
//         <aside className='hidden w-[160px] lg:w-[200px] flex-col md:flex'>
//           <Sidebar items={dashboardConfig.sidebarNav} />
//         </aside>
//         <main className='flex w-full flex-col'>{children}</main>
//       </div>
//     </div>
//   );
// }

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
      <header className='sticky top-0 bg-gray-50 shadow inset-x-0 z-[10]'>
        <div className='mx-4'>
          <Navbar className='max-w-none' user={user} />
        </div>
      </header>

      <div className='container flex-1 items-start md:grid md:grid-cols-[160px_minmax(0,1fr)] md:gap-2 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-4'>
        <aside className='fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block'>
          <div className='h-full py-6 pr-6 lg:py-8'>
            <Sidebar items={dashboardConfig.sidebarNav} />
          </div>
        </aside>
        <main className='flex-1 flex-col'>{children}</main>
      </div>
    </div>
  );
}
