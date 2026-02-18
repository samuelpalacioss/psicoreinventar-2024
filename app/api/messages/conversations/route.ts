import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { StatusCodes } from "http-status-codes";
import db from "@/src/db";
import { appointments, conversations, doctors, messages, persons } from "@/src/db/schema";
import { Role } from "@/src/types";
import { getAuthSession } from "@/utils/api/middleware/auth";
import { validateBody, validateSearchParams } from "@/utils/api/middleware/validation";
import { conversationQuerySchema, createConversationSchema } from "@/lib/validations/message";
import {
  buildParticipantName,
  syncConversationsFromAppointments,
} from "@/src/dal/conversations";

export async function GET(request: NextRequest) {
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

  const queryValidationResult = validateSearchParams(
    request.nextUrl.searchParams,
    conversationQuerySchema
  );
  if (!queryValidationResult.success) {
    return queryValidationResult.error;
  }

  const { conversationId } = queryValidationResult.data;

  const isDoctor = session.user.role === Role.DOCTOR;
  if (session.user.role !== Role.DOCTOR && session.user.role !== Role.PATIENT) {
    return NextResponse.json(
      {
        success: true,
        data: {
          conversations: [],
          messages: [],
        },
      },
      { status: StatusCodes.OK }
    );
  }

  const currentDoctor = isDoctor
    ? await db.query.doctors.findFirst({
        where: eq(doctors.userId, session.user.id),
      })
    : null;
  const currentPerson = !isDoctor
    ? await db.query.persons.findFirst({
        where: eq(persons.userId, session.user.id),
      })
    : null;

  if (isDoctor && !currentDoctor) {
    return NextResponse.json(
      {
        success: true,
        data: {
          conversations: [],
          messages: [],
        },
      },
      { status: StatusCodes.OK }
    );
  }

  if (!isDoctor && !currentPerson) {
    return NextResponse.json(
      {
        success: true,
        data: {
          conversations: [],
          messages: [],
        },
      },
      { status: StatusCodes.OK }
    );
  }

  if (isDoctor) {
    await syncConversationsFromAppointments({ doctorId: currentDoctor!.id });
  } else {
    await syncConversationsFromAppointments({ personId: currentPerson!.id });
  }

  const allConversations = await db.query.conversations.findMany({
    where: isDoctor
      ? eq(conversations.doctorId, currentDoctor!.id)
      : eq(conversations.personId, currentPerson!.id),
    with: {
      doctor: {
        columns: {
          id: true,
          firstName: true,
          firstLastName: true,
        },
        with: {
          user: {
            columns: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      },
      person: {
        columns: {
          id: true,
          firstName: true,
          firstLastName: true,
        },
        with: {
          user: {
            columns: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      },
      messages: {
        columns: {
          id: true,
          senderId: true,
          content: true,
          createdAt: true,
        },
        orderBy: (messageTable, { desc }) => [desc(messageTable.createdAt)],
        limit: 1,
      },
    },
    orderBy: [desc(conversations.lastMessageAt)],
  });

  const conversationItems = allConversations.map((conversation) => {
    const isCurrentUserDoctor = conversation.doctor.user.id === session.user.id;
    const otherUser = isCurrentUserDoctor ? conversation.person.user : conversation.doctor.user;
    const otherProfile = isCurrentUserDoctor ? conversation.person : conversation.doctor;
    const lastMessage = conversation.messages[0];

    return {
      id: conversation.id,
      doctorId: conversation.doctorId,
      personId: conversation.personId,
      lastMessageAt: conversation.lastMessageAt.toISOString(),
      participant: {
        userId: otherUser.id,
        name: buildParticipantName(otherUser.name, otherProfile.firstName, otherProfile.firstLastName),
        image: otherUser.image,
      },
      lastMessage: lastMessage
        ? {
            id: lastMessage.id,
            senderId: lastMessage.senderId,
            content: lastMessage.content,
            createdAt: lastMessage.createdAt.toISOString(),
          }
        : null,
    };
  });

  const selectedConversationId = conversationId ?? conversationItems[0]?.id;
  let selectedConversationMessages: Array<{
    id: number;
    conversationId: number;
    senderId: string;
    content: string;
    isRead: boolean;
    createdAt: string;
  }> = [];

  if (selectedConversationId) {
    const selectedConversation = allConversations.find((item) => item.id === selectedConversationId);
    if (selectedConversation) {
      const queryMessages = await db.query.messages.findMany({
        where: eq(messages.conversationId, selectedConversationId),
        columns: {
          id: true,
          conversationId: true,
          senderId: true,
          content: true,
          isRead: true,
          createdAt: true,
        },
        orderBy: (messageTable, { asc }) => [asc(messageTable.createdAt)],
      });

      selectedConversationMessages = queryMessages.map((message) => ({
        ...message,
        createdAt: message.createdAt.toISOString(),
      }));
    }
  }

  return NextResponse.json(
    {
      success: true,
      data: {
        conversations: conversationItems,
        activeConversationId: selectedConversationId ?? null,
        messages: selectedConversationMessages,
      },
    },
    { status: StatusCodes.OK }
  );
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

  const body = await request.json().catch(() => ({}));
  const validationResult = validateBody(body, createConversationSchema);
  if (!validationResult.success) {
    return validationResult.error;
  }

  const { doctorId, personId } = validationResult.data;

  const appointmentLink = await db.query.appointments.findFirst({
    where: and(eq(appointments.doctorId, doctorId), eq(appointments.personId, personId)),
    columns: {
      id: true,
    },
  });

  if (!appointmentLink) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: "Conversation requires at least one appointment between doctor and patient",
          code: "FORBIDDEN",
        },
      },
      { status: StatusCodes.FORBIDDEN }
    );
  }

  const conversation = await db.query.conversations.findFirst({
    where: and(eq(conversations.doctorId, doctorId), eq(conversations.personId, personId)),
  });

  if (conversation) {
    return NextResponse.json(
      {
        success: true,
        data: conversation,
      },
      { status: StatusCodes.OK }
    );
  }

  const [newConversation] = await db
    .insert(conversations)
    .values({
      doctorId,
      personId,
      lastMessageAt: new Date(),
    })
    .returning();

  return NextResponse.json(
    {
      success: true,
      data: newConversation,
    },
    { status: StatusCodes.CREATED }
  );
}
