// import { prisma } from '@/lib/db';

export const getVerificationTokenByEmail = async (email: string) => {
  // TODO: Replace with your database solution
  try {
    // const verificationToken = await prisma.verificationToken.findFirst({
    //   where: {
    //     email: email,
    //   },
    // });

    // return verificationToken;
    return null;
  } catch (error) {
    return null;
  }
};

export const getVerificationTokenByToken = async (token: string) => {
  // TODO: Replace with your database solution
  try {
    // const verificationToken = await prisma.verificationToken.findUnique({
    //   where: { token },
    // });

    // return verificationToken;
    return null;
  } catch (error) {
    return null;
  }
};
