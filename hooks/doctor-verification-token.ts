import { prisma } from '@/lib/db';

export const getDoctorRegisterTokenByEmail = async (email: string) => {
  try {
    const verificationToken = await prisma.doctorRegisterToken.findFirst({
      where: {
        email: email,
      },
    });

    return verificationToken;
  } catch (error) {
    return null;
  }
};

export const getDoctorRegisterTokenByToken = async (token: string) => {
  try {
    const verificationToken = await prisma.doctorRegisterToken.findUnique({
      where: { token },
    });

    return verificationToken;
  } catch (error) {
    return null;
  }
};
