'use server';

import { loginSchema, loginType } from '@/lib/validations/auth';
import { signIn } from '@/auth';
import { defaultLoginRedirect } from '@/config/routes';
import { AuthError } from 'next-auth';
import { getUserByEmail } from '@/hooks/user';
import { generateVerificationToken } from '@/lib/verification-token';
import { sendVerificationEmail } from '@/lib/email';

export const login = async (data: loginType) => {
  const validatedData = loginSchema.safeParse(data);

  if (!validatedData.success) {
    return { error: 'Invalid fields' };
  }

  const { email, password } = validatedData.data;

  const existingUser = await getUserByEmail(email);

  // If the user does not exist, return an error
  if (!existingUser || !existingUser.email || !existingUser.password) {
    return { error: 'Email does not exist' };
  }

  // Check for verified email
  if (!existingUser.emailVerified) {
    const verificationToken = await generateVerificationToken(existingUser.email);

    await sendVerificationEmail(existingUser.email, verificationToken.token);
    return { error: 'Please confirm your email address' };
  }

  try {
    await signIn('credentials', {
      email: data.email,
      password: data.password,
      redirectTo: defaultLoginRedirect,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin': {
          return { error: 'Invalid credentials' };
        }
        default:
          return { error: 'Something went wrong' };
      }
    }

    throw error;
  }

  return { success: 'Confirmation email sent!' };
};
