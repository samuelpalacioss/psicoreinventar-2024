'use server';

import { prisma } from '@/lib/db';
import { getUserByEmail } from '@/hooks/user';
import { getDoctorRegisterTokenByToken } from '@/hooks/doctor-verification-token';

export const newDoctorVerification = async (token: string) => {
  const existingToken = await getDoctorRegisterTokenByToken(token);

  if (!existingToken) {
    return {
      error: 'Token not found',
    };
  }

  const hasExpired = new Date(existingToken.expires) < new Date();

  if (hasExpired) {
    return {
      error: 'Token has expired',
    };
  }

  const user = await getUserByEmail(existingToken.email);

  if (!user) {
    return {
      error: 'User not found',
    };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: new Date(), email: existingToken.email },
  });

  await prisma.doctorRegisterToken.delete({
    where: { id: existingToken.id },
  });

  return { success: 'Email verified' };
};
