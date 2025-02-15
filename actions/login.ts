"use server";

import { loginSchema, loginType } from "@/lib/validations/auth";
import { signIn } from "@/auth";
import { defaultLoginRedirect } from "@/config/routes";
import { AuthError } from "next-auth";
import { getUserByEmail } from "@/hooks/user";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/actions/email";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(4, "1 h"), // max requests per hour
});

export const login = async (data: loginType) => {
  const validatedData = loginSchema.safeParse(data);

  if (!validatedData.success) {
    return { error: "Invalid fields" };
  }

  const { email } = validatedData.data;

  const existingUser = await getUserByEmail(email);

  // If the user does not exist, return an error
  if (!existingUser || !existingUser.email || !existingUser.password) {
    return { error: "Invalid email or password" };
  }

  // Check for verified email
  if (!existingUser.emailVerified) {
    //* Rate limiter
    const { success, reset } = await ratelimit.limit(email);

    if (!success) {
      const now = Date.now();
      const retryAfter = Math.floor((reset - now) / 1000 / 60);

      return {
        error: `Try the last code sent to your email or wait ${retryAfter}m`,
      };
    }

    const verificationToken = await generateVerificationToken(
      existingUser.email,
    );

    try {
      await sendVerificationEmail(existingUser.email, verificationToken.token);
      return {
        error: "Please confirm your email address",
      };
    } catch (error) {
      return {
        error: "Failed to send verification email. Please try again later",
      };
    }
  }

  try {
    await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirectTo: defaultLoginRedirect,
    });
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
