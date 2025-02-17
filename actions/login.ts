"use server";

import { loginSchema, loginType } from "@/lib/validations/auth";
import { signIn } from "@/auth";
import {
  defaultLoginRedirectPatient,
  defaultLoginRedirectDoctor,
} from "@/config/routes";
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
    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password,
    );

    if (!isPasswordValid) {
      return { error: "Invalid email or password" };
    }

    //* Rate limiter
    const { success, reset, limit, remaining } = await ratelimit.limit(email);

    console.log(remaining, limit, success);

    if (!success) {
      /*
      const now = Date.now();
      const retryAfter = Math.floor((reset - now) / 1000); // in seconds
      const minutes = Math.floor(retryAfter / 60);
      const hours = Math.floor(retryAfter / 3600);

      let message;
      if (retryAfter < 3600) {
        message = `Try the last code sent to your email or wait ${minutes} min${minutes !== 1 ? "s" : ""}`;
      } else {
        message = `Try the last code sent to your email or wait ${hours} hour${hours !== 1 ? "s" : ""}`;
      }
      */

      return {
        error: "Email not verified. Check your inbox",
        // error: message,
      };
    }

    const verificationToken = await generateVerificationToken(
      existingUser.email,
    );

    const verificationEmail = await sendVerificationEmail(
      existingUser.email,
      verificationToken.token,
    );

    return { error: "Please confirm your email address" };
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
