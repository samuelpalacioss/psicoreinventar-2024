import { PsicoreinventarResetPasswordEmailHtml } from '@/components/emails/reset-password-email';
import { VerificationEmailHtml } from '@/components/emails/verification-token-email';
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
      html: VerificationEmailHtml({
        verificationCode: token,
        confirmationLink,
      }),
    });
  } catch (error) {
    console.error('Error sending verification email:', error);
  }
};

export const sendPasswordResetEmail = async (
  email: string,
  token: string,
  userFirstname?: string
) => {
  // Link containing the verification token
  const resetPasswordLink = `${process.env.NEXT_PUBLIC_API_URL}/new-password?token=${token}`;

  try {
    const passwordResetEmail = await resend.emails.send({
      from: 'Psicoreinventar <no-reply@psicoreinventar.com>',
      to: email,
      subject: 'Reset your password',
      html: PsicoreinventarResetPasswordEmailHtml({
        userFirstname,
        resetPasswordLink,
      }),
    });
  } catch (error) {
    console.error('Error sending verification email:', error);
  }
};
