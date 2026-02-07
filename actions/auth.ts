"use server";

import { signUpActionSchema, signInSchema } from "@/lib/schema";
import { auth } from "@/lib/auth/auth";
import { AUTH_ROUTES } from "@/config/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { tryCatch } from "@/utils/tryCatch";
import { authContext } from "@/lib/auth/auth-context";
import { Role } from "@/src/types";

async function signUpAction(formData: FormData, role: Role) {
  const data = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const validation = signUpActionSchema.safeParse(data);

  if (!validation.success) {
    return { error: validation.error.message };
  }

  const { name, email, password } = validation.data;

  const { error } = await authContext.run({ role }, async () => {
    return tryCatch(
      auth.api.signUpEmail({
        body: {
          email,
          password,
          name,
        },
      })
    );
  });

  if (error) {
    return { error: error.message };
  }

  redirect(AUTH_ROUTES.LOGIN);
}

export async function signUpPatientAction(formData: FormData) {
  return signUpAction(formData, Role.PATIENT);
}

export async function signUpDoctorAction(formData: FormData) {
  return signUpAction(formData, Role.DOCTOR);
}

export async function signInAction(formData: FormData) {
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const validation = signInSchema.safeParse(data);

  if (!validation.success) {
    return { error: validation.error.message };
  }

  const { email, password } = validation.data;

  const { error } = await tryCatch(
    auth.api.signInEmail({
      body: { email, password },
    })
  );

  if (error) {
    return { error: error.message };
  }

  redirect(AUTH_ROUTES.DASHBOARD);
}

export async function signOutAction() {
  await tryCatch(
    auth.api.signOut({
      headers: await headers(),
    })
  );

  redirect("/");
}
