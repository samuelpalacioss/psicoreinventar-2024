'use server';

import { resetPasswordSchema, resetPasswordType } from '@/lib/validations/auth';
import { getUserByEmail } from '@/hooks/user';
import { sendPasswordResetEmail } from '@/actions/email';
import { generatePasswordResetToken } from '@/lib/tokens';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(4, '1 h'), // max requests per hour
});

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

  // Get first name of user
  const userFirstName = existingUser?.name?.split(' ')[0];

  //* Rate limiter
  const { success, reset } = await ratelimit.limit(email);

  if (!success) {
    const now = Date.now();
    const retryAfter = Math.floor((reset - now) / 1000 / 60);

    return {
      error: `Try the last code sent to your email or wait ${retryAfter}m`,
    };
  }

  // Generate password reset token and sent it by email
  const passwordResetToken = await generatePasswordResetToken(email);
  await sendPasswordResetEmail(email, passwordResetToken.token, userFirstName);

  return { success: 'Reset email sent!' };
};
