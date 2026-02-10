import { NextResponse } from "next/server";
import { Role } from "@/src/types";
import db from "@/src/db";
import { and, eq } from "drizzle-orm";
import {
  persons,
  doctors,
  appointments,
  payments,
  paymentMethodPersons,
  payoutMethods,
  reviews,
  progresses,
  phones,
  educations,
  schedules,
  ageGroups,
} from "@/src/db/schema";
import { hasPermission, type Resource, type Action } from "./permissions";
import { StatusCodes } from "http-status-codes";

type CheckResult =
  | { allowed: true }
  | {
      allowed: false;
      error: NextResponse<{
        success: false;
        error: { message: string; code: string };
      }>;
    };

/**
 * Check if user has access to a specific resource
 * Implements ownership and assignment checks based on permission scope
 *
 * @param userId - The user's ID from session
 * @param role - The user's role
 * @param resource - The resource being accessed
 * @param action - The action being performed
 * @param resourceId - Optional ID of the specific resource being accessed (for read/update/delete)
 * @param context - Optional additional context (e.g., parentId for nested resources)
 * @returns Promise<CheckResult> indicating if access is allowed
 */
export async function checkResourceAccess(
  userId: string,
  role: Role,
  resource: Resource,
  action: Action,
  resourceId?: number | string,
  context?: {
    personId?: number;
    doctorId?: number;
    appointmentId?: number;
  }
): Promise<CheckResult> {
  // Get permission scope for this role/resource/action
  const scope = hasPermission(role, resource, action);

  // No permission defined = denied
  if (!scope) {
    return {
      allowed: false,
      error: NextResponse.json(
        {
          success: false,
          error: {
            message: "You do not have permission to perform this action",
            code: "FORBIDDEN",
          },
        },
        { status: StatusCodes.FORBIDDEN }
      ),
    };
  }

  // None scope = denied
  if (scope === "none") {
    return {
      allowed: false,
      error: NextResponse.json(
        {
          success: false,
          error: {
            message: "You do not have permission to perform this action",
            code: "FORBIDDEN",
          },
        },
        { status: StatusCodes.FORBIDDEN }
      ),
    };
  }

  // All scope = allowed
  if (scope === "all") {
    return { allowed: true };
  }

  // For list actions with "own" or "assigned" scope, we don't check individual resource
  // The query will filter results based on ownership/assignment
  if (action === "list") {
    return { allowed: true };
  }

  // For own/assigned scope, we need to verify ownership/assignment
  if (scope === "own") {
    return await checkOwnership(userId, role, resource, resourceId, context);
  }

  if (scope === "assigned") {
    return await checkAssignment(userId, role, resource, resourceId, context);
  }

  // Should never reach here
  return { allowed: true };
}

/**
 * Check if the user owns the resource
 * For patients: personId must belong to userId
 * For doctors: doctorId must belong to userId
 */
async function checkOwnership(
  userId: string,
  role: Role,
  resource: Resource,
  resourceId?: number | string,
  context?: {
    personId?: number;
    doctorId?: number;
  }
): Promise<CheckResult> {
  try {
    // For create operations, we check against the provided context
    if (!resourceId) {
      // For create operations on nested resources, check parent ownership
      if (context?.personId && role === Role.PATIENT) {
        const person = await db.query.persons.findFirst({
          where: and(eq(persons.id, context.personId), eq(persons.userId, userId)),
        });
        if (!person) {
          return createForbiddenResponse();
        }
        return { allowed: true };
      }

      if (context?.doctorId && role === Role.DOCTOR) {
        const doctor = await db.query.doctors.findFirst({
          where: and(eq(doctors.id, context.doctorId), eq(doctors.userId, userId)),
        });
        if (!doctor) {
          return createForbiddenResponse();
        }
        return { allowed: true };
      }

      // For top-level creates, ownership will be enforced by setting userId/personId/doctorId in the handler
      return { allowed: true };
    }

    // For read/update/delete operations, check resource ownership
    const id = typeof resourceId === "string" ? parseInt(resourceId) : resourceId;

    switch (resource) {
      case "person": {
        const person = await db.query.persons.findFirst({
          where: and(eq(persons.id, id), eq(persons.userId, userId)),
        });
        return person ? { allowed: true } : createForbiddenResponse();
      }

      case "doctor": {
        const doctor = await db.query.doctors.findFirst({
          where: and(eq(doctors.id, id), eq(doctors.userId, userId)),
        });
        return doctor ? { allowed: true } : createForbiddenResponse();
      }

      case "appointment": {
        if (role === Role.PATIENT) {
          const appointment = await db.query.appointments.findFirst({
            where: eq(appointments.id, id),
            with: { person: true },
          });
          if (appointment?.person.userId === userId) {
            return { allowed: true };
          }
        }
        return createForbiddenResponse();
      }

      case "payment": {
        const payment = await db.query.payments.findFirst({
          where: eq(payments.id, id),
          with: { person: true },
        });
        if (payment?.person.userId === userId) {
          return { allowed: true };
        }
        return createForbiddenResponse();
      }

      case "payment-method": {
        const paymentMethodPerson = await db.query.paymentMethodPersons.findFirst({
          where: eq(paymentMethodPersons.id, id),
          with: { person: true },
        });
        if (paymentMethodPerson?.person.userId === userId) {
          return { allowed: true };
        }
        return createForbiddenResponse();
      }

      case "payout-method": {
        // Payout methods belong to doctors
        const payoutMethod = await db.query.payoutMethods.findFirst({
          where: eq(payoutMethods.id, id),
          with: { doctor: true },
        });
        if (payoutMethod?.doctor.userId === userId) {
          return { allowed: true };
        }
        return createForbiddenResponse();
      }

      case "review": {
        const review = await db.query.reviews.findFirst({
          where: eq(reviews.id, id),
          with: {
            appointment: {
              with: { person: true },
            },
          },
        });
        if (review?.appointment?.person.userId === userId) {
          return { allowed: true };
        }
        return createForbiddenResponse();
      }

      case "progress": {
        const progress = await db.query.progresses.findFirst({
          where: eq(progresses.id, id),
          with: { person: true },
        });
        if (progress?.person.userId === userId) {
          return { allowed: true };
        }
        return createForbiddenResponse();
      }

      case "phone": {
        const phone = await db.query.phones.findFirst({
          where: eq(phones.id, id),
        });
        if (phone?.personId) {
          const person = await db.query.persons.findFirst({
            where: eq(persons.id, phone.personId),
          });
          if (person?.userId === userId) return { allowed: true };
        }
        if (phone?.doctorId) {
          const doctor = await db.query.doctors.findFirst({
            where: eq(doctors.id, phone.doctorId),
          });
          if (doctor?.userId === userId) return { allowed: true };
        }
        return createForbiddenResponse();
      }

      case "education": {
        const education = await db.query.educations.findFirst({
          where: eq(educations.id, id),
          with: { doctor: true },
        });
        if (education?.doctor.userId === userId) {
          return { allowed: true };
        }
        return createForbiddenResponse();
      }

      case "schedule": {
        const schedule = await db.query.schedules.findFirst({
          where: eq(schedules.id, id),
          with: { doctor: true },
        });
        if (schedule?.doctor.userId === userId) {
          return { allowed: true };
        }
        return createForbiddenResponse();
      }

      case "age-group": {
        const ageGroup = await db.query.ageGroups.findFirst({
          where: eq(ageGroups.id, id),
          with: { doctor: true },
        });
        if (ageGroup?.doctor.userId === userId) {
          return { allowed: true };
        }
        return createForbiddenResponse();
      }

      case "doctor-service":
      case "doctor-condition":
      case "doctor-language": {
        // For junction tables and doctor-owned resources, check if the doctor belongs to the user
        if (context?.doctorId) {
          const doctor = await db.query.doctors.findFirst({
            where: and(eq(doctors.id, context.doctorId), eq(doctors.userId, userId)),
          });
          if (doctor) return { allowed: true };
        }
        return createForbiddenResponse();
      }

      default:
        return { allowed: true };
    }
  } catch (error) {
    console.error("Error checking ownership:", error);
    return {
      allowed: false,
      error: NextResponse.json(
        {
          success: false,
          error: {
            message: "Internal server error",
            code: "INTERNAL_ERROR",
          },
        },
        { status: StatusCodes.INTERNAL_SERVER_ERROR }
      ),
    };
  }
}

/**
 * Check if the doctor is assigned to the resource (via appointments)
 * Doctors can only access patient data if they have an appointment with them
 */
async function checkAssignment(
  userId: string,
  role: Role,
  resource: Resource,
  resourceId?: number | string,
  context?: {
    personId?: number;
    appointmentId?: number;
  }
): Promise<CheckResult> {
  try {
    // Only doctors have "assigned" permissions
    if (role !== Role.DOCTOR) {
      return createForbiddenResponse();
    }

    // Get the doctor record for this user
    const doctor = await db.query.doctors.findFirst({
      where: eq(doctors.userId, userId),
    });

    if (!doctor) {
      return createForbiddenResponse();
    }

    // For list operations, we allow and filter in the query
    if (!resourceId && !context?.personId && !context?.appointmentId) {
      return { allowed: true };
    }

    const id = resourceId
      ? typeof resourceId === "string"
        ? parseInt(resourceId)
        : resourceId
      : undefined;

    switch (resource) {
      case "person": {
        // Check if doctor has any appointment with this person
        const personId = id || context?.personId;
        if (!personId) return createForbiddenResponse();

        const appointment = await db.query.appointments.findFirst({
          where: and(eq(appointments.doctorId, doctor.id), eq(appointments.personId, personId)),
        });
        return appointment ? { allowed: true } : createForbiddenResponse();
      }

      case "appointment": {
        // Check if this appointment belongs to the doctor
        const appointmentId = id || context?.appointmentId;
        if (!appointmentId) return createForbiddenResponse();

        const appointment = await db.query.appointments.findFirst({
          where: and(eq(appointments.id, appointmentId), eq(appointments.doctorId, doctor.id)),
        });
        return appointment ? { allowed: true } : createForbiddenResponse();
      }

      case "payment": {
        // Check if payment is for an appointment with this doctor
        if (!id) return createForbiddenResponse();

        const payment = await db.query.payments.findFirst({
          where: eq(payments.id, id),
        });

        if (!payment) return createForbiddenResponse();

        const appointment = await db.query.appointments.findFirst({
          where: and(eq(appointments.paymentId, payment.id), eq(appointments.doctorId, doctor.id)),
        });
        return appointment ? { allowed: true } : createForbiddenResponse();
      }

      case "review": {
        // Check if review is for an appointment with this doctor
        if (!id) return createForbiddenResponse();

        const review = await db.query.reviews.findFirst({
          where: eq(reviews.id, id),
          with: {
            appointment: true,
          },
        });

        if (review?.appointment?.doctorId === doctor.id) {
          return { allowed: true };
        }
        return createForbiddenResponse();
      }

      case "progress": {
        // Check if progress record is for a patient assigned to this doctor
        // Doctors can only create progress notes for completed appointments
        if (!id) {
          // For create, check context.personId
          if (context?.personId) {
            const appointment = await db.query.appointments.findFirst({
              where: and(
                eq(appointments.doctorId, doctor.id),
                eq(appointments.personId, context.personId),
                eq(appointments.status, "completed")
              ),
            });
            return appointment ? { allowed: true } : createForbiddenResponse();
          }
          return createForbiddenResponse();
        }

        const progress = await db.query.progresses.findFirst({
          where: eq(progresses.id, id),
        });

        if (!progress) return createForbiddenResponse();

        const appointment = await db.query.appointments.findFirst({
          where: and(
            eq(appointments.doctorId, doctor.id),
            eq(appointments.personId, progress.personId),
            eq(appointments.status, "completed")
          ),
        });
        return appointment ? { allowed: true } : createForbiddenResponse();
      }

      default:
        return createForbiddenResponse();
    }
  } catch (error) {
    console.error("Error checking assignment:", error);
    return {
      allowed: false,
      error: NextResponse.json(
        {
          success: false,
          error: {
            message: "Internal server error",
            code: "INTERNAL_ERROR",
          },
        },
        { status: StatusCodes.INTERNAL_SERVER_ERROR }
      ),
    };
  }
}

/**
 * Helper to create consistent forbidden response
 */
function createForbiddenResponse(): CheckResult {
  return {
    allowed: false,
    error: NextResponse.json(
      {
        success: false,
        error: {
          message: "You do not have permission to access this resource",
          code: "FORBIDDEN",
        },
      },
      { status: StatusCodes.FORBIDDEN }
    ),
  };
}
