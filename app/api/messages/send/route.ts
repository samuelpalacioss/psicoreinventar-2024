import { NextRequest, NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { eq } from "drizzle-orm";
import db from "@/src/db";
import { conversations, messages } from "@/src/db/schema";
import { getAuthSession } from "@/utils/api/middleware/auth";
import { validateBody } from "@/utils/api/middleware/validation";
import { sendMessageSchema } from "@/lib/validations/message";
import { pusherServer } from "@/lib/pusher/server";

export async function POST(request: NextRequest) {
  const session = await getAuthSession(request);
  if (!session?.user) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: "Unauthorized",
          code: "UNAUTHORIZED",
        },
      },
      { status: StatusCodes.UNAUTHORIZED }
    );
  }

  const body = await request.json().catch(() => ({}));
  const validationResult = validateBody(body, sendMessageSchema);
  if (!validationResult.success) {
    return validationResult.error;
  }

  const { conversationId, content } = validationResult.data;
  const conversation = await db.query.conversations.findFirst({
    where: eq(conversations.id, conversationId),
    with: {
      doctor: {
        columns: {
          userId: true,
        },
      },
      person: {
        columns: {
          userId: true,
        },
      },
    },
  });

  if (!conversation) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: "Conversation not found",
          code: "NOT_FOUND",
        },
      },
      { status: StatusCodes.NOT_FOUND }
    );
  }

  const isParticipant =
    conversation.doctor.userId === session.user.id || conversation.person.userId === session.user.id;

  if (!isParticipant) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: "Forbidden",
          code: "FORBIDDEN",
        },
      },
      { status: StatusCodes.FORBIDDEN }
    );
  }

  const [message] = await db
    .insert(messages)
    .values({
      conversationId,
      senderId: session.user.id,
      content: content.trim(),
    })
    .returning();

  await db
    .update(conversations)
    .set({
      lastMessageAt: new Date(),
    })
    .where(eq(conversations.id, conversationId));

  const recipientUserId =
    conversation.doctor.userId === session.user.id
      ? conversation.person.userId
      : conversation.doctor.userId;

  await pusherServer.trigger(`private-conversation-${conversationId}`, "new-message", {
    id: message.id,
    conversationId: message.conversationId,
    senderId: message.senderId,
    recipientUserId,
    content: message.content,
    isRead: message.isRead,
    createdAt: message.createdAt.toISOString(),
  });

  return NextResponse.json(
    {
      success: true,
      data: {
        id: message.id,
        conversationId: message.conversationId,
        senderId: message.senderId,
        content: message.content,
        isRead: message.isRead,
        createdAt: message.createdAt.toISOString(),
      },
    },
    { status: StatusCodes.CREATED }
  );
}
