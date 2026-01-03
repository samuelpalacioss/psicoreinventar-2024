import { authClient } from "./auth-client";
import { tryCatch } from "@/utils/tryCatch";
import { AUTH_ROUTES } from "@/config/auth";

export async function socialSignIn(provider: string) {
  const { error, data } = await tryCatch(
    authClient.signIn.social({
      provider,
      callbackURL: AUTH_ROUTES.DASHBOARD,
    })
  );

  if (error) {
    return { error: error.message };
  }
}
