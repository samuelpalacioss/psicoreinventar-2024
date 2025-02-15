import { auth } from '@/auth';

// For server components
export const getCurrentUser = async () => {
  const session = await auth();

  return session?.user;
};
