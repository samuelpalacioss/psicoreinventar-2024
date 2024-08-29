'use server';

import { Resend } from 'resend';
import PsicoreinventarVerifyEmail from '@/components/emails/verification-token-email';
import PsicoreinventarResetPasswordEmail from '@/components/emails/reset-password-email';
import PsicoreinventarDoctorRegisterEmail from '@/components/emails/doctor-register-email';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVerificationEmail = async (email: string, token: string) => {
  // Link containing the verification token
  const confirmationLink = `${process.env.NEXT_PUBLIC_API_URL}/verify-email?token=${token}`;

  try {
    const verificationEmail = await resend.emails.send({
      from: 'Psicoreinventar <no-reply@psicoreinventar.com>',
      to: email,
      subject: 'Verify your email address',
      react: PsicoreinventarVerifyEmail({
        verificationCode: token,
        confirmationLink,
      }),
    });
    return {
      success: true,
      verificationEmail,
    };
  } catch (error) {
    return {
      success: false,
      error,
    };
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
      react: PsicoreinventarResetPasswordEmail({
        userFirstname,
        resetPasswordLink,
      }),
    });
    return {
      success: true,
      passwordResetEmail,
    };
  } catch (error) {
    return {
      success: false,
      error,
    };
    // console.error('Error sending verification email:', error);
  }
};

export const sendDoctorRegisterEmail = async (
  email: string,
  token: string,
  doctorName?: string
) => {
  // Link containing the verification token
  const registerDoctorLink = `${process.env.NEXT_PUBLIC_API_URL}/doctor-register?token=${token}`;

  try {
    const passwordResetEmail = await resend.emails.send({
      from: 'Psicoreinventar <no-reply@psicoreinventar.com>',
      to: email,
      subject: 'Welcome to the Psicoreinventar Team!',
      react: PsicoreinventarDoctorRegisterEmail({
        doctorName,
        registerDoctorLink,
      }),
    });
    return {
      success: true,
      passwordResetEmail,
    };
  } catch (error) {
    return {
      success: false,
      error,
    };
  }
};
