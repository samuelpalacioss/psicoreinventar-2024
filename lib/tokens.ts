import { getVerificationTokenByEmail } from '@/hooks/verification-token';
import { getPasswordResetTokenByEmail } from '@/hooks/password-reset-token';
import prisma from '@/lib/db';
import { getDoctorRegisterTokenByEmail } from '@/hooks/doctor-verification-token';

export const generatePasswordResetToken = async (email: string) => {
  // generate 6 digit token (not starting with 0)
  const token = (Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000).toString();

  // expires 30min
  const expires = new Date().getTime() + 30 * 60 * 1000;

  // Check if user has existing token
  const existingToken = await getPasswordResetTokenByEmail(email);

  if (existingToken) {
    await prisma.passwordResetToken.delete({
      where: {
        id: existingToken.id,
      },
    });
  }

  // Create new token
  const passwordToken = await prisma.passwordResetToken.create({
    data: {
      email,
      token,
      expires: new Date(expires),
    },
  });

  return passwordToken;
};

export const generateVerificationToken = async (email: string) => {
  // generate 6 digit token (not starting with 0)
  const token = (Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000).toString();

  // expires 30min
  const expires = new Date().getTime() + 30 * 60 * 1000;

  // Check if user has existing token
  const existingToken = await getVerificationTokenByEmail(email);

  if (existingToken) {
    await prisma.verificationToken.delete({
      where: {
        id: existingToken.id,
      },
    });
  }

  // Create new token
  const verificationToken = await prisma.verificationToken.create({
    data: {
      email,
      token,
      expires: new Date(expires),
    },
  });

  return verificationToken;
};

export const generateDoctorRegisterToken = async (email: string) => {
  // generate 6 digit token (not starting with 0)
  const token = (Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000).toString();

  // expires 7 days
  const expires = new Date().getTime() + 7 * 24 * 60 * 60 * 1000;

  // Check if user has existing token
  const existingToken = await getDoctorRegisterTokenByEmail(email);

  if (existingToken) {
    await prisma.doctorRegisterToken.delete({
      where: {
        id: existingToken.id,
      },
    });
  }

  // Create new token
  const verificationToken = await prisma.doctorRegisterToken.create({
    data: {
      email,
      token,
      expires: new Date(expires),
    },
  });

  return verificationToken;
};
