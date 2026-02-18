import { NextRequest, NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { and, eq, ne } from "drizzle-orm";
import * as z from "zod";
import db from "@/src/db";
import { conversations, messages } from "@/src/db/schema";
import { getAuthSession } from "@/utils/api/middleware/auth";
import { validateBody } from "@/utils/api/middleware/validation";
import { numericIdSchema } from "@/lib/api/schemas/common.schemas";

const markReadSchema = z.object({
  conversationId: numericIdSchema,
});

export async function PATCH(request: NextRequest) {
  const session = await getAuthSession(request);
  if (!session?.user) {
    return NextResponse.json(
      { success: false, error: { message: "Unauthorized", code: "UNAUTHORIZED" } },
      { status: StatusCodes.UNAUTHORIZED }
    );
  }

  const body = await request.json().catch(() => ({}));
  const validationResult = validateBody(body, markReadSchema);
  if (!validationResult.success) {
    return validationResult.error;
  }

  const { conversationId } = validationResult.data;

  const conversation = await db.query.conversations.findFirst({
    where: eq(conversations.id, conversationId),
    with: {
      doctor: { columns: { userId: true } },
      person: { columns: { userId: true } },
    },
  });

  if (!conversation) {
    return NextResponse.json(
      { success: false, error: { message: "Conversation not found", code: "NOT_FOUND" } },
      { status: StatusCodes.NOT_FOUND }
    );
  }

  const isParticipant =
    conversation.doctor.userId === session.user.id || conversation.person.userId === session.user.id;

  if (!isParticipant) {
    return NextResponse.json(
      { success: false, error: { message: "Forbidden", code: "FORBIDDEN" } },
      { status: StatusCodes.FORBIDDEN }
    );
  }

  await db
    .update(messages)
    .set({ isRead: true })
    .where(
      and(
        eq(messages.conversationId, conversationId),
        ne(messages.senderId, session.user.id)
      )
    );

  return NextResponse.json({ success: true }, { status: StatusCodes.OK });
}
