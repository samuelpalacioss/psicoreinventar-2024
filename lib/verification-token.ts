import { getVerificationTokenByEmail } from '@/hooks/token-email';
import prisma from '@/lib/db';

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
