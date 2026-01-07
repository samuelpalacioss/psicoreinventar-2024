import db from "@/src/db";
import { appointments, schedules, doctorServices, services } from "@/src/db/schema";
import { and, eq, or, gte, lte, lt, gt } from "drizzle-orm";

/**
 * Business logic utilities for appointment validation
 * Implements scheduling rules and conflict detection
 */

interface ValidationResult {
  success?: boolean;
  error?: string;
}

interface AppointmentSlot {
  doctorId: number;
  startDateTime: Date;
  endDateTime: Date;
}

/**
 * Validate if doctor has the specified service
 */
export async function validateDoctorService(
  doctorId: number,
  serviceId: number
): Promise<ValidationResult & { price?: number; duration?: number }> {
  const doctorService = await db.query.doctorServices.findFirst({
    where: and(eq(doctorServices.doctorId, doctorId), eq(doctorServices.serviceId, serviceId)),
    with: {
      service: true,
    },
  });

  if (!doctorService) {
    return {
      success: false,
      error: "Doctor does not offer this service",
    };
  }

  return {
    success: true,
    price: doctorService.amount,
    duration: doctorService.service.duration,
  };
}

/**
 * Validate if the appointment time slot is within doctor's schedule
 */
export async function validateDoctorSchedule(
  doctorId: number,
  startDateTime: Date
): Promise<ValidationResult> {
  // Get day of week in UTC (0 = Sunday, 1 = Monday, etc.)
  // Use UTC to avoid timezone issues when determining the day
  const dayIndex = startDateTime.getUTCDay();
  const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const dayName = dayNames[dayIndex];

  // Get doctor's schedule for this day
  const schedule = await db.query.schedules.findFirst({
    where: and(eq(schedules.doctorId, doctorId), eq(schedules.day, dayName as any)),
  });

  if (!schedule) {
    return {
      success: false,
      error: `Doctor is not available on ${dayName}s`,
    };
  }

  // Extract time from appointment in UTC (format: HH:MM:SS)
  // Use UTC methods to avoid timezone issues
  const hours = startDateTime.getUTCHours().toString().padStart(2, "0");
  const minutes = startDateTime.getUTCMinutes().toString().padStart(2, "0");
  const seconds = startDateTime.getUTCSeconds().toString().padStart(2, "0");
  const appointmentTime = `${hours}:${minutes}:${seconds}`;

  // Compare times (format: HH:MM:SS)
  if (appointmentTime < schedule.startTime || appointmentTime >= schedule.endTime) {
    return {
      success: false,
      error: `Doctor is not available at this time. Available hours: ${schedule.startTime} - ${schedule.endTime}`,
    };
  }

  return { success: true };
}

/**
 * Check for overlapping appointments with the same doctor
 */
export async function checkAppointmentOverlap(
  doctorId: number,
  startDateTime: Date,
  endDateTime: Date,
  excludeAppointmentId?: number
): Promise<ValidationResult> {
  // Find appointments that overlap with the requested time slot
  // Overlap occurs if:
  // 1. New appointment starts during existing appointment
  // 2. New appointment ends during existing appointment
  // 3. New appointment completely contains existing appointment
  const overlappingAppointments = await db.query.appointments.findMany({
    where: and(
      eq(appointments.doctorId, doctorId),
      // Not cancelled
      or(
        eq(appointments.status, "scheduled"),
        eq(appointments.status, "confirmed"),
        eq(appointments.status, "completed")
      ),
      // Overlap check
      or(
        // Case 1: New starts during existing (startDateTime < existing.end AND startDateTime >= existing.start)
        and(
          lt(appointments.startDateTime, endDateTime),
          gte(appointments.endDateTime, startDateTime)
        ),
        // Case 2: New ends during existing (endDateTime > existing.start AND endDateTime <= existing.end)
        and(
          gt(appointments.endDateTime, startDateTime),
          lte(appointments.startDateTime, endDateTime)
        )
      )
    ),
  });

  // Filter out the appointment being updated (if any)
  const conflicts = excludeAppointmentId
    ? overlappingAppointments.filter((apt) => apt.id !== excludeAppointmentId)
    : overlappingAppointments;

  if (conflicts.length > 0) {
    return {
      success: false,
      error: "This time slot conflicts with an existing appointment",
    };
  }

  return { success: true };
}

/**
 * Calculate end date/time based on service duration
 */
export function calculateEndDateTime(startDateTime: Date, durationMinutes: number): Date {
  const endDateTime = new Date(startDateTime);
  endDateTime.setMinutes(endDateTime.getMinutes() + durationMinutes);
  return endDateTime;
}

/**
 * Validate minimum advance booking (24 hours)
 */
export function validateMinimumAdvanceBooking(startDateTime: Date): ValidationResult {
  const now = new Date();
  const hoursDiff = (startDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (hoursDiff < 24) {
    return {
      success: false,
      error: "Appointments must be booked at least 24 hours in advance",
    };
  }

  return { success: true };
}

/**
 * Comprehensive appointment slot validation
 * Checks all business rules for creating/updating an appointment
 */
export async function validateAppointmentSlot(
  slot: AppointmentSlot,
  excludeAppointmentId?: number
): Promise<ValidationResult> {
  // Check minimum advance booking
  const advanceBookingCheck = validateMinimumAdvanceBooking(slot.startDateTime);
  if (!advanceBookingCheck.success) {
    return advanceBookingCheck;
  }

  // Check doctor's schedule
  const scheduleCheck = await validateDoctorSchedule(slot.doctorId, slot.startDateTime);
  if (!scheduleCheck.success) {
    return scheduleCheck;
  }

  // Check for overlapping appointments
  const overlapCheck = await checkAppointmentOverlap(
    slot.doctorId,
    slot.startDateTime,
    slot.endDateTime,
    excludeAppointmentId
  );
  if (!overlapCheck.success) {
    return overlapCheck;
  }

  return { success: true };
}
