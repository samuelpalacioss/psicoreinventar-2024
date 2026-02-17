"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import db from "@/src/db";
import { persons, doctors, phones } from "@/src/db/schema";
import { getServerSession } from "@/lib/auth/session";
import { auth } from "@/lib/auth/auth";
import { tryCatch } from "@/utils/tryCatch";
import { Role } from "@/src/types";
import * as z from "zod";

// ============================================================================
// HELPERS
// ============================================================================

function parseFullName(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 2) {
    return { firstName: parts[0], middleName: null, firstLastName: parts[1], secondLastName: null };
  }
  if (parts.length === 3) {
    return { firstName: parts[0], middleName: null, firstLastName: parts[1], secondLastName: parts[2] };
  }
  return { firstName: parts[0], middleName: parts[1], firstLastName: parts[2], secondLastName: parts[3] };
}

// ============================================================================
// VALIDATION
// ============================================================================

const updatePersonalDetailsSchema = z.object({
  name: z
    .string()
    .min(1)
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/)
    .refine((val) => val.trim().split(/\s+/).length >= 2)
    .refine((val) => val.trim().split(/\s+/).length <= 4)
    .refine((val) => val.trim().split(/\s+/).every((p) => p.length <= 100)),
  phoneAreaCode: z.string().min(1).max(3).regex(/^\d+$/),
  phoneNumber: z.string().min(1).max(7).regex(/^\d+$/),
  birthDate: z.string().min(1),
});

export type UpdatePersonalDetailsInput = z.infer<typeof updatePersonalDetailsSchema>;

// ============================================================================
// QUERIES
// ============================================================================

export async function getProfileAction() {
  const session = await getServerSession();

  if (!session?.user) {
    return { error: "Unauthorized" as const };
  }

  const userId = session.user.id;
  const role = session.user.role as string;

  if (role === Role.PATIENT) {
    const person = await db.query.persons.findFirst({
      where: eq(persons.userId, userId),
      with: { phones: true },
    });

    if (!person) return { data: null };

    const phone = person.phones[0];
    return {
      data: {
        birthDate: person.birthDate ?? undefined,
        phoneAreaCode: phone?.areaCode ?? undefined,
        phoneNumber: phone?.number ?? undefined,
      },
    };
  }

  if (role === Role.DOCTOR) {
    const doctor = await db.query.doctors.findFirst({
      where: eq(doctors.userId, userId),
      with: { phones: true },
    });

    if (!doctor) return { data: null };

    const phone = doctor.phones[0];
    return {
      data: {
        birthDate: doctor.birthDate ?? undefined,
        phoneAreaCode: phone?.areaCode ?? undefined,
        phoneNumber: phone?.number ?? undefined,
      },
    };
  }

  return { data: null };
}

// ============================================================================
// MUTATIONS
// ============================================================================

export async function updatePersonalDetailsAction(input: UpdatePersonalDetailsInput) {
  const session = await getServerSession();

  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  const validation = updatePersonalDetailsSchema.safeParse(input);
  if (!validation.success) {
    return { error: "Invalid data" };
  }

  const { name, phoneAreaCode, phoneNumber, birthDate } = validation.data;
  const userId = session.user.id;
  const role = session.user.role as string;

  // Update display name in the auth users table
  if (name !== session.user.name) {
    const { error } = await tryCatch(
      auth.api.updateUser({
        body: { name },
        headers: await headers(),
      })
    );
    if (error) return { error: error.message ?? "Failed to update name." };
  }

  const areaCodeInt = parseInt(phoneAreaCode, 10);
  const numberInt = parseInt(phoneNumber, 10);

  if (role === Role.PATIENT) {
    const person = await db.query.persons.findFirst({
      where: eq(persons.userId, userId),
      with: { phones: true },
    });

    if (!person) return { error: "Patient profile not found." };

    await db.update(persons).set({ ...parseFullName(name), birthDate }).where(eq(persons.userId, userId));

    const existingPhone = person.phones[0];
    if (existingPhone) {
      await db
        .update(phones)
        .set({ areaCode: areaCodeInt, number: numberInt })
        .where(eq(phones.id, existingPhone.id));
    } else {
      await db.insert(phones).values({
        personId: person.id,
        areaCode: areaCodeInt,
        number: numberInt,
      });
    }

    revalidatePath("/dashboard/profile");
    return { success: true };
  }

  if (role === Role.DOCTOR) {
    const doctor = await db.query.doctors.findFirst({
      where: eq(doctors.userId, userId),
      with: { phones: true },
    });

    if (!doctor) return { error: "Doctor profile not found." };

    await db.update(doctors).set({ ...parseFullName(name), birthDate }).where(eq(doctors.userId, userId));

    const existingPhone = doctor.phones[0];
    if (existingPhone) {
      await db
        .update(phones)
        .set({ areaCode: areaCodeInt, number: numberInt })
        .where(eq(phones.id, existingPhone.id));
    } else {
      await db.insert(phones).values({
        doctorId: doctor.id,
        areaCode: areaCodeInt,
        number: numberInt,
      });
    }

    revalidatePath("/dashboard/profile");
    return { success: true };
  }

  return { error: "Unsupported role." };
}
