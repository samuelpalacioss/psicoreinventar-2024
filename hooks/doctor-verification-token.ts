// import { prisma } from '@/lib/db';

export const getDoctorRegisterTokenByEmail = async (email: string) => {
  // TODO: Replace with your database solution
  try {
    // const verificationToken = await prisma.doctorRegisterToken.findFirst({
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

export const getDoctorRegisterTokenByToken = async (token: string) => {
  // TODO: Replace with your database solution
  try {
    // const verificationToken = await prisma.doctorRegisterToken.findUnique({
    //   where: { token },
    // });

    // return verificationToken;
    return null;
  } catch (error) {
    return null;
  }
};
