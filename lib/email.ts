import { ReceiptEmailHtml } from '@/components/emails/verification-token-email';
import { Resend } from 'resend';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(4, '1 h'), // max requests per hour
});

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVerificationEmail = async (email: string, token: string) => {
  // Link containing the verification token
  const confirmationLink = `${process.env.NEXT_PUBLIC_API_URL}/verify-email?token=${token}`;

  try {
    //* Rate limiter
    const { success, reset } = await ratelimit.limit(email);

    if (!success) {
      const now = Date.now();
      const retryAfter = Math.floor((reset - now) / 1000 / 60);

      return {
        error: `Try the last code sent to your email or wait ${retryAfter}m`,
      };
    }

    const verificationEmail = await resend.emails.send({
      from: 'Psicoreinventar <no-reply@psicoreinventar.com>',
      to: email,
      subject: 'Verify your email address',
      html: ReceiptEmailHtml({
        verificationCode: token,
        confirmationLink,
      }),
    });
  } catch (error) {
    console.error('Error sending verification email:', error);
  }
};
