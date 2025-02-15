'use server';

import prisma from '@/lib/db';
import { getPasswordResetTokenByToken } from '@/hooks/password-reset-token';
import { getUserByEmail } from '@/hooks/user';
import { newPasswordSchema, newPasswordType } from '@/lib/validations/auth';
import bcrypt from 'bcryptjs';

export const newPassword = async (data: newPasswordType, token?: string | null) => {
  if (!token) {
    return { error: 'Missing token' };
  }

  const validatedData = newPasswordSchema.safeParse(data);

  if (!validatedData.success) {
    return { error: 'Invalid fields' };
  }

  const { password } = validatedData.data;

  const existingToken = await getPasswordResetTokenByToken(token);

  if (!existingToken) {
    return { error: 'Invalid token' };
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
      error: 'Email does not exist',
    };
  }

  //* Hash user password
  const hashedPassword = await bcrypt.hash(password, 10);

  //* Update user password
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  });

  //* Delete token
  await prisma.passwordResetToken.delete({
    where: { id: existingToken.id },
  });

  return { success: "Password updated!" };
};
