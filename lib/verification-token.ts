import { generateVerificationTokenByEmail } from '@/hooks/token-email';
import prisma from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export const generateVerificationToken = async (email: string) => {
  const token = uuidv4();
  // expires 30min
  const expires = new Date().getTime() + 30 * 60 * 1000;
  // check for existing token
  const existingToken = await generateVerificationTokenByEmail(email);

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
