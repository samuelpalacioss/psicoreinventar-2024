import db from "@/src/db";
import { users, persons, doctors } from "@/src/db/schema";
import { eq } from "drizzle-orm";

// ============================================================================
// CORE
// ============================================================================

export async function findUserById(id: string) {
  return db.query.users.findFirst({
    where: eq(users.id, id),
  });
}

/**
 * Fetch the patient profile for a user, with place and phones.
 * Used by the user profile endpoint for patients.
 */
export async function findUserPersonProfile(userId: string) {
  return db.query.persons.findFirst({
    where: eq(persons.userId, userId),
    with: { place: true, phones: true },
  });
}

/**
 * Fetch the doctor profile for a user, with all relations.
 * Used by the user profile endpoint for doctors.
 */
export async function findUserDoctorProfile(userId: string) {
  return db.query.doctors.findFirst({
    where: eq(doctors.userId, userId),
    with: {
      place: true,
      phones: true,
      educations: { with: { institution: { with: { place: true } } } },
      schedules: true,
      ageGroups: true,
      doctorServices: { with: { service: true } },
      doctorConditions: { with: { condition: true } },
      doctorLanguages: { with: { language: true } },
    },
  });
}
