'use server';

import { resetPasswordSchema, resetPasswordType } from '@/lib/validations/auth';
import { getUserByEmail } from '@/hooks/user';

export const resetPassword = async (data: resetPasswordType) => {
  const validatedData = resetPasswordSchema.safeParse(data);

  if (!validatedData.success) {
    return { error: 'Invalid email' };
  }

  const { email } = validatedData.data;

  const existingUser = await getUserByEmail(email);

  if (!existingUser) {
    return { error: 'Email not found' };
  }

  return { success: 'Reset email sent!' };
};
