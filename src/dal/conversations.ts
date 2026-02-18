import { and, eq } from "drizzle-orm";
import db from "@/src/db";
import { appointments, conversations } from "@/src/db/schema";

export function buildParticipantName(
  userName: string | null,
  firstName: string | null | undefined,
  firstLastName: string | null | undefined
): string {
  if (userName && userName.trim().length > 0) {
    return userName;
  }

  return [firstName, firstLastName].filter(Boolean).join(" ").trim();
}

export async function syncConversationsFromAppointments(params: {
  doctorId?: number;
  personId?: number;
}): Promise<void> {
  const { doctorId, personId } = params;
  if (!doctorId && !personId) {
    return;
  }

  const appointmentPairs = await db
    .select({
      doctorId: appointments.doctorId,
      personId: appointments.personId,
    })
    .from(appointments)
    .where(doctorId ? eq(appointments.doctorId, doctorId) : eq(appointments.personId, personId!))
    .groupBy(appointments.doctorId, appointments.personId);

  for (const pair of appointmentPairs) {
    const existingConversation = await db.query.conversations.findFirst({
      where: and(
        eq(conversations.doctorId, pair.doctorId),
        eq(conversations.personId, pair.personId)
      ),
      columns: { id: true },
    });

    if (existingConversation) {
      continue;
    }

    try {
      await db.insert(conversations).values({
        doctorId: pair.doctorId,
        personId: pair.personId,
        lastMessageAt: new Date(),
      });
    } catch {
      // Ignore duplicate insert race when two requests sync simultaneously.
    }
  }
}
