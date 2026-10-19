"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import db from "@/src/db";
import { doctorServices } from "@/src/db/schema";
import { getServerSession } from "@/lib/auth/session";
import { findDoctorByUserId, findDoctorPreferredPayoutMethod } from "@/src/dal/doctors";
import { findPatientPersonById, isExistingPatientOfDoctor } from "@/src/dal/persons";
import {
  createAppointmentWithPayment,
  editAppointment,
  findAppointmentByIdBasic,
} from "@/src/dal/appointments";
import { addAppointmentActionSchema, editAppointmentActionSchema } from "@/lib/schema";
import { AppointmentStatus } from "@/src/types";
import { tryCatch } from "@/utils/tryCatch";

// Edit appointment: date/time is only applied when status is scheduled or confirmed; new date/time must be in the future.
const APPOINTMENT_DURATION_MINUTES = 45;

export async function createAppointmentAction(input: {
  patientId: string;
  serviceId: string;
  startDateTime: string; // ISO 8601 UTC instant, built on the client from its local date + time
  paymentAmount: string;
  notes: string;
}) {
  const session = await getServerSession();
  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  const validation = addAppointmentActionSchema.safeParse(input);
  if (!validation.success) {
    return { error: "Invalid data" };
  }

  const { patientId, serviceId, paymentAmount, notes } = validation.data;

  const startDateTime = new Date(validation.data.startDateTime);
  if (startDateTime < new Date()) {
    return { error: "Time cannot be in the past" };
  }

  const doctor = await findDoctorByUserId(session.user.id);
  if (!doctor) {
    return { error: "Doctor profile not found" };
  }

  const patientIdNum = parseInt(patientId, 10);
  const patient = await findPatientPersonById(patientIdNum);
  if (!patient) {
    return { error: "Patient not found" };
  }

  const isExistingPatient = await isExistingPatientOfDoctor(patientIdNum, doctor.id);
  if (!isExistingPatient) {
    return { error: "Patient not found" };
  }

  const serviceIdNum = parseInt(serviceId, 10);
  const [doctorService] = await db
    .select()
    .from(doctorServices)
    .where(and(eq(doctorServices.doctorId, doctor.id), eq(doctorServices.serviceId, serviceIdNum)));

  if (!doctorService) {
    return { error: "Service not found" };
  }

  const endDateTime = new Date(startDateTime.getTime() + APPOINTMENT_DURATION_MINUTES * 60 * 1000);

  // Payout method is optional: a doctor may not have a preferred one configured yet
  const preferredPayoutMethod = await findDoctorPreferredPayoutMethod(doctor.id);

  const { error } = await tryCatch(
    createAppointmentWithPayment({
      personId: patientIdNum,
      doctorId: doctor.id,
      doctorServiceDoctorId: doctorService.doctorId,
      doctorServiceServiceId: doctorService.serviceId,
      paymentMethodId: null,
      payoutMethodId: preferredPayoutMethod?.id ?? null,
      amount: paymentAmount,
      paymentStatus: "pending",
      startDateTime,
      endDateTime,
      notes: notes || null,
    })
  );

  if (error) {
    return { error: "Failed to schedule appointment" };
  }

  revalidatePath("/dashboard/appointments");
  return { success: true };
}

export async function updateAppointmentAction(input: {
  appointmentId: number;
  startDateTime: string; // ISO 8601 UTC instant, built on the client from its local date + time
  status: keyof typeof AppointmentStatus;
  notes: string;
}) {
  const session = await getServerSession();
  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  const validation = editAppointmentActionSchema.safeParse(input);
  if (!validation.success) {
    return { error: "Invalid data" };
  }

  const { appointmentId, status, notes } = validation.data;

  const doctor = await findDoctorByUserId(session.user.id);
  if (!doctor) {
    return { error: "Doctor profile not found" };
  }

  const appointment = await findAppointmentByIdBasic(appointmentId);
  if (!appointment) {
    return { error: "Appointment not found" };
  }
  if (appointment.doctorId !== doctor.id) {
    return { error: "Not allowed to edit this appointment" };
  }

  // Only apply date/time when status allows reschedule (scheduled or confirmed). New time must be in the future.
  const canChangeDateTime = status === "scheduled" || status === "confirmed";
  const updatePayload: Parameters<typeof editAppointment>[1] = {
    status,
    notes: notes || null,
  };

  if (canChangeDateTime) {
    const startDateTime = new Date(validation.data.startDateTime);
    if (Number.isNaN(startDateTime.getTime())) {
      return { error: "Invalid date or time" };
    }
    if (startDateTime < new Date()) {
      return { error: "New date and time must be in the future" };
    }
    const endDateTime = new Date(
      startDateTime.getTime() + APPOINTMENT_DURATION_MINUTES * 60 * 1000
    );
    updatePayload.startDateTime = startDateTime;
    updatePayload.endDateTime = endDateTime;
  }

  const { error } = await tryCatch(editAppointment(appointmentId, updatePayload));
  if (error) {
    return { error: "Failed to update appointment" };
  }

  revalidatePath("/dashboard/appointments");
  return { success: true };
}
