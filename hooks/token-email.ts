import prisma from '@/lib/db';

export const getVerificationTokenByEmail = async (email: string) => {
  try {
    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        email: email,
      },
    });

    return verificationToken;
  } catch (error) {
    return null;
  }
};
