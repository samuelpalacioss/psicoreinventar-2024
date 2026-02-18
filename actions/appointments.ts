"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import db from "@/src/db";
import { doctorServices } from "@/src/db/schema";
import { getServerSession } from "@/lib/auth/session";
import { findDoctorByUserId } from "@/src/dal/doctors";
import { createAppointment } from "@/src/dal/appointments";
import { addAppointmentSchema } from "@/lib/schema";
import { tryCatch } from "@/utils/tryCatch";

export async function createAppointmentAction(input: {
  patientId: string;
  serviceId: string;
  startDate: string;
  startTime: string;
  paymentAmount: string;
  notes: string;
}) {
  const session = await getServerSession();
  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  const validation = addAppointmentSchema.safeParse(input);
  if (!validation.success) {
    return { error: "Invalid data" };
  }

  const { patientId, serviceId, startDate, startTime, notes } = validation.data;

  const doctor = await findDoctorByUserId(session.user.id);
  if (!doctor) {
    return { error: "Doctor profile not found" };
  }

  const serviceIdNum = parseInt(serviceId, 10);
  const [doctorService] = await db
    .select()
    .from(doctorServices)
    .where(and(eq(doctorServices.doctorId, doctor.id), eq(doctorServices.serviceId, serviceIdNum)));

  if (!doctorService) {
    return { error: "Service not found" };
  }

  const startDateTime = new Date(`${startDate}T${startTime}`);
  const endDateTime = new Date(startDateTime.getTime() + 45 * 60 * 1000);

  const { error } = await tryCatch(
    createAppointment({
      personId: parseInt(patientId, 10),
      doctorId: doctor.id,
      doctorServiceDoctorId: doctorService.doctorId,
      doctorServiceServiceId: doctorService.serviceId,
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
