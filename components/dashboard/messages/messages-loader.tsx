import { asc, desc, eq, inArray } from "drizzle-orm";
import { ChatLayout } from "@/components/dashboard/messages/chat-layout";
import { ChatConversation, ChatMessage } from "@/src/types";
import db from "@/src/db";
import { conversations, doctors, messages, persons } from "@/src/db/schema";
import { Role } from "@/src/types";
import {
  buildParticipantName,
  syncConversationsFromAppointments,
} from "@/src/dal/conversations";

interface MessagesLoaderProps {
  currentUserId: string;
  currentUserRole: Role;
}

export async function MessagesLoader({ currentUserId, currentUserRole }: MessagesLoaderProps) {
  if (currentUserRole !== Role.DOCTOR && currentUserRole !== Role.PATIENT) {
    return (
      <ChatLayout
        currentUserId={currentUserId}
        initialConversations={[]}
        initialMessagesByConversation={{}}
        initialActiveConversationId={null}
      />
    );
  }

  const currentDoctor =
    currentUserRole === Role.DOCTOR
      ? await db.query.doctors.findFirst({
          where: eq(doctors.userId, currentUserId),
          columns: { id: true },
        })
      : null;

  const currentPerson =
    currentUserRole === Role.PATIENT
      ? await db.query.persons.findFirst({
          where: eq(persons.userId, currentUserId),
          columns: { id: true },
        })
      : null;

  if (currentUserRole === Role.DOCTOR && !currentDoctor) {
    return (
      <ChatLayout
        currentUserId={currentUserId}
        initialConversations={[]}
        initialMessagesByConversation={{}}
        initialActiveConversationId={null}
      />
    );
  }

  if (currentUserRole === Role.PATIENT && !currentPerson) {
    return (
      <ChatLayout
        currentUserId={currentUserId}
        initialConversations={[]}
        initialMessagesByConversation={{}}
        initialActiveConversationId={null}
      />
    );
  }

  if (currentUserRole === Role.DOCTOR) {
    await syncConversationsFromAppointments({ doctorId: currentDoctor!.id });
  }

  if (currentUserRole === Role.PATIENT) {
    await syncConversationsFromAppointments({ personId: currentPerson!.id });
  }

  const currentConversations = await db.query.conversations.findMany({
    where:
      currentUserRole === Role.DOCTOR
        ? eq(conversations.doctorId, currentDoctor!.id)
        : eq(conversations.personId, currentPerson!.id),
    with: {
      doctor: {
        columns: { id: true, firstName: true, firstLastName: true },
        with: { user: { columns: { id: true, name: true, image: true } } },
      },
      person: {
        columns: { id: true, firstName: true, firstLastName: true },
        with: { user: { columns: { id: true, name: true, image: true } } },
      },
      messages: {
        columns: { id: true, senderId: true, content: true, createdAt: true },
        orderBy: [desc(messages.createdAt)],
        limit: 1,
      },
    },
    orderBy: [desc(conversations.lastMessageAt)],
  });

  const conversationIds = currentConversations.map((conversation) => conversation.id);
  const allMessages = conversationIds.length
    ? await db.query.messages.findMany({
        where: inArray(messages.conversationId, conversationIds),
        columns: {
          id: true,
          conversationId: true,
          senderId: true,
          content: true,
          isRead: true,
          createdAt: true,
        },
        orderBy: [asc(messages.createdAt)],
      })
    : [];

  const messagesByConversation = allMessages.reduce<Record<number, ChatMessage[]>>(
    (accumulator, message) => {
      const currentMessages = accumulator[message.conversationId] ?? [];
      accumulator[message.conversationId] = [
        ...currentMessages,
        {
          id: message.id,
          conversationId: message.conversationId,
          senderId: message.senderId,
          content: message.content,
          isRead: message.isRead,
          createdAt: message.createdAt.toISOString(),
        },
      ];
      return accumulator;
    },
    {}
  );

  const parsedConversations: ChatConversation[] = currentConversations.map((conversation) => {
    const doctorUser = conversation.doctor.user;
    const personUser = conversation.person.user;

    // The "other participant" is whoever is not the current user.
    // Doctors chat with patients (persons), patients chat with doctors.
    const isCurrentUserPatient = currentUserRole === Role.PATIENT;
    const otherUser = isCurrentUserPatient ? doctorUser : personUser;
    const otherProfile = isCurrentUserPatient ? conversation.doctor : conversation.person;

    const conversationMessages = messagesByConversation[conversation.id] ?? [];
    const unreadCount = conversationMessages.filter(
      (message) => !message.isRead && message.senderId !== currentUserId
    ).length;

    return {
      id: conversation.id,
      doctorId: conversation.doctorId,
      personId: conversation.personId,
      lastMessageAt: conversation.lastMessageAt.toISOString(),
      unreadCount,
      participant: {
        userId: otherUser.id,
        name: buildParticipantName(otherUser.name, otherProfile.firstName, otherProfile.firstLastName),
        image: otherUser.image,
      },
      lastMessage: conversation.messages[0]
        ? {
            id: conversation.messages[0].id,
            senderId: conversation.messages[0].senderId,
            content: conversation.messages[0].content,
            createdAt: conversation.messages[0].createdAt.toISOString(),
          }
        : null,
    };
  });

  return (
    <ChatLayout
      currentUserId={currentUserId}
      initialConversations={parsedConversations}
      initialMessagesByConversation={messagesByConversation}
      initialActiveConversationId={parsedConversations[0]?.id ?? null}
    />
  );
}
