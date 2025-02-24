"use server";

import { loginSchema, loginType } from "@/lib/validations/auth";
import { signIn } from "@/auth";
import { defaultLoginRedirectPatient, defaultLoginRedirectDoctor } from "@/config/routes";
import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { getUserByEmail } from "@/hooks/user";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/actions/email";
import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "@/lib/redis";

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(2, "12 h"), // max requests per 12 hours
  analytics: true,
});

export const login = async (data: loginType) => {
  const validatedData = loginSchema.safeParse(data);

  if (!validatedData.success) {
    return { error: "Invalid fields" };
  }

  const { email, password } = validatedData.data;

  const existingUser = await getUserByEmail(email);

  // If the user does not exist, return an error
  if (!existingUser || !existingUser.email || !existingUser.password) {
    return { error: "Invalid email or password" };
  }

  // Check for verified email
  if (!existingUser.emailVerified) {
    const isPasswordValid = await bcrypt.compare(password, existingUser.password);

    if (!isPasswordValid) {
      return { error: "Invalid email or password" };
    }

    //* Rate limiter
    const { success, reset, limit, remaining } = await ratelimit.limit(email);

    // console.log(remaining, limit, success); // To check remaining attempts, the limit and bool succes

    if (!success) {
      return {
        error: "Email not verified. Check your inbox",
      };
    }

    // Only re-send verification email for patients
    if (existingUser.role === Role.patient) {
      // Get first name of user
      const userFirstname = existingUser?.name?.split(" ")[0]!;

      const verificationToken = await generateVerificationToken(existingUser.email);

      const verificationEmail = await sendVerificationEmail(
        existingUser.email,
        userFirstname,
        verificationToken.token
      );

      return { error: "Please confirm your email address" };
    }

    // For non-patient roles, just return error msg do not resend verification email
    return { error: "Email not verified. Please contact support." };
  }

  try {
    if (existingUser.role === Role.patient) {
      await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirectTo: defaultLoginRedirectPatient,
      });
    } else {
      await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirectTo: defaultLoginRedirectDoctor,
      });
    }
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin": {
          return { error: "Invalid email or password" };
        }
        default:
          return { error: "Failed to sign in. Please try again later" };
      }
    }

    throw error;
  }

  return { success: "Confirmation email sent!" };
};
