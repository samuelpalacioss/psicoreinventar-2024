import { ReceiptEmailHtml } from '@/components/emails/verification-token-email';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVerificationEmail = async (email: string, token: string) => {
  // Link containing the verification token
  const confirmationLink = `${process.env.NEXT_PUBLIC_API_URL}/verify-email?token=${token}`;

  try {
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
