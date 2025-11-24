// import { prisma } from '@/lib/db';

export const getPasswordResetTokenByEmail = async (email: string) => {
  // TODO: Replace with your database solution
  try {
    // const passwordResetToken = await prisma.passwordResetToken.findFirst({
    //   where: { email },
    // });
    // return passwordResetToken;
    return null;
  } catch (error) {
    return null;
  }
};

export const getPasswordResetTokenByToken = async (token: string) => {
  // TODO: Replace with your database solution
  try {
    // const passwordResetToken = await prisma.passwordResetToken.findUnique({
    //   where: { token },
    // });
    // return passwordResetToken;
    return null;
  } catch (error) {
    return null;
  }
};
