'use server';

import { getUserByEmail } from '@/hooks/user';
import { sendDoctorRegisterEmail } from '@/actions/email';
import { generateDoctorRegisterToken } from '@/lib/tokens';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '1 h'), // max requests per hour
});

export const approveDoctor = async (email: string) => {
  const existingUser = await getUserByEmail(email);

  if (!existingUser) {
    return { error: 'Email not found' };
  }

  // Get  name of doctor
  const doctorName = existingUser?.name;

  //* Rate limiter
  const { success, reset } = await ratelimit.limit(email);

  if (!success) {
    const now = Date.now();
    const retryAfter = Math.floor((reset - now) / 1000 / 60);

    return {
      error: `Try the last code sent to your email or wait ${retryAfter}m`,
    };
  }

  // Generate doctor register token and sent it by email
  const doctorRegisterToken = await generateDoctorRegisterToken(email);
  await sendDoctorRegisterEmail(email, doctorRegisterToken.token, doctorName!);

  return { success: 'Reset email sent!' };
};
