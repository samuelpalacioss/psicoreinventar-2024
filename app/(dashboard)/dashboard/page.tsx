import { auth } from '@/auth';
import SignOutButton from '@/components/sign-out-button';

export default async function DashboardPage() {
  const session = await auth();
  return (
    <main className='space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32'>
      <h1 className='font-semibold text-3xl md:text-7xl'>
        Welcome to the<span className='text-blue-500 text-xl md:text-4xl'>secret</span> Dashboard{' '}
        {session?.user?.name}
        {session?.user?.role}
      </h1>
      <SignOutButton />
    </main>
  );
}
