import { NextRequest, NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { getAuthSession } from "@/utils/api/middleware/auth";
import db from "@/src/db";
import { conversations } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { pusherServer } from "@/lib/pusher/server";

function getConversationIdFromChannelName(channelName: string) {
  const matches = channelName.match(/^private-conversation-(\d+)$/);
  if (!matches) {
    return null;
  }

  const conversationId = Number(matches[1]);
  return Number.isNaN(conversationId) ? null : conversationId;
}

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

  const rawBody = await request.text();
  const body = new URLSearchParams(rawBody);
  const socketId = body.get("socket_id");
  const channelName = body.get("channel_name");

  if (!socketId || !channelName) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: "socket_id and channel_name are required",
          code: "BAD_REQUEST",
        },
      },
      { status: StatusCodes.BAD_REQUEST }
    );
  }

  const conversationId = getConversationIdFromChannelName(channelName);
  if (!conversationId) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: "Invalid channel name",
          code: "BAD_REQUEST",
        },
      },
      { status: StatusCodes.BAD_REQUEST }
    );
  }

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

  const authResponse = pusherServer.authorizeChannel(socketId, channelName);
  return NextResponse.json(authResponse);
}
