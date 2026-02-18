"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getPusherClient } from "@/lib/pusher/client";
import { ChatArea } from "@/components/dashboard/messages/chat-area";
import { ConversationList } from "@/components/dashboard/messages/conversation-list";
import { ChatConversation, ChatMessage } from "@/src/types";

interface ChatLayoutProps {
  currentUserId: string;
  initialConversations: ChatConversation[];
  initialMessagesByConversation: Record<number, ChatMessage[]>;
  initialActiveConversationId: number | null;
}

interface IncomingMessageEvent {
  id: number;
  conversationId: number;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

function upsertMessage(
  currentMessagesByConversation: Record<number, ChatMessage[]>,
  incomingMessage: IncomingMessageEvent
) {
  const previousMessages = currentMessagesByConversation[incomingMessage.conversationId] ?? [];
  const hasMessage = previousMessages.some((message) => message.id === incomingMessage.id);
  if (hasMessage) {
    return currentMessagesByConversation;
  }

  return {
    ...currentMessagesByConversation,
    [incomingMessage.conversationId]: [...previousMessages, incomingMessage],
  };
}

function upsertConversation(
  currentConversations: ChatConversation[],
  incomingMessage: IncomingMessageEvent,
  currentUserId: string,
  activeConversationId: number | null
) {
  const updatedConversations = currentConversations.map((conversation) => {
    if (conversation.id !== incomingMessage.conversationId) {
      return conversation;
    }

    const isFromOtherUser = incomingMessage.senderId !== currentUserId;
    const isActiveConversation = conversation.id === activeConversationId;

    return {
      ...conversation,
      lastMessageAt: incomingMessage.createdAt,
      unreadCount:
        isFromOtherUser && !isActiveConversation
          ? conversation.unreadCount + 1
          : conversation.unreadCount,
      lastMessage: {
        id: incomingMessage.id,
        senderId: incomingMessage.senderId,
        content: incomingMessage.content,
        createdAt: incomingMessage.createdAt,
      },
    };
  });

  return updatedConversations.sort(
    (leftConversation, rightConversation) =>
      new Date(rightConversation.lastMessageAt).getTime() -
      new Date(leftConversation.lastMessageAt).getTime()
  );
}

export function ChatLayout({
  currentUserId,
  initialConversations,
  initialMessagesByConversation,
  initialActiveConversationId,
}: ChatLayoutProps) {
  const [conversations, setConversations] = useState(initialConversations);
  const [messagesByConversation, setMessagesByConversation] = useState(initialMessagesByConversation);
  const [activeConversationId, setActiveConversationId] = useState(
    initialActiveConversationId ?? initialConversations[0]?.id ?? null
  );
  const [isMobileChatVisible, setIsMobileChatVisible] = useState(false);

  // Re-sync client state when auth/user context changes without a hard reload.
  useEffect(() => {
    setConversations(initialConversations);
    setMessagesByConversation(initialMessagesByConversation);
    setActiveConversationId(initialActiveConversationId ?? initialConversations[0]?.id ?? null);
    setIsMobileChatVisible(false);
  }, [currentUserId, initialActiveConversationId, initialConversations, initialMessagesByConversation]);

  const activeConversationIdRef = useRef(activeConversationId);
  useEffect(() => {
    activeConversationIdRef.current = activeConversationId;
  }, [activeConversationId]);

  // On desktop the first conversation is pre-shown on mount — mark it as read immediately.
  // On mobile the list is shown first, so the badge stays until the user taps.
  useEffect(() => {
    if (!initialActiveConversationId || typeof window === "undefined") return;
    if (window.innerWidth < 1024) return;

    const conv = initialConversations.find((c) => c.id === initialActiveConversationId);
    if (!conv || conv.unreadCount === 0) return;

    setConversations((current) =>
      current.map((c) =>
        c.id === initialActiveConversationId ? { ...c, unreadCount: 0 } : c
      )
    );

    fetch("/api/messages/read", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId: initialActiveConversationId }),
    });
  }, [initialActiveConversationId, initialConversations]);

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === activeConversationId) ?? null,
    [activeConversationId, conversations]
  );
  const activeMessages = activeConversationId ? messagesByConversation[activeConversationId] ?? [] : [];

  useEffect(() => {
    const pusherClient = getPusherClient();
    const channels = initialConversations.map((conversation) =>
      pusherClient.subscribe(`private-conversation-${conversation.id}`)
    );

    function handleIncomingMessage(event: IncomingMessageEvent) {
      setMessagesByConversation((current) => upsertMessage(current, event));
      setConversations((current) =>
        upsertConversation(current, event, currentUserId, activeConversationIdRef.current)
      );
    }

    channels.forEach((channel) => {
      channel.bind("new-message", handleIncomingMessage);
    });

    return () => {
      channels.forEach((channel) => {
        channel.unbind("new-message", handleIncomingMessage);
        pusherClient.unsubscribe(channel.name);
      });
    };
  }, [currentUserId, initialConversations]);

  async function handleSendMessage(content: string) {
    if (!activeConversationId) {
      return;
    }

    const response = await fetch("/api/messages/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        conversationId: activeConversationId,
        content,
      }),
    });

    if (!response.ok) {
      return;
    }

    const payload = (await response.json()) as { success: boolean; data: IncomingMessageEvent };
    if (!payload.success) {
      return;
    }

    setMessagesByConversation((current) => upsertMessage(current, payload.data));
    setConversations((current) =>
      upsertConversation(current, payload.data, currentUserId, activeConversationIdRef.current)
    );
  }

  function handleSelectConversation(conversationId: number) {
    setActiveConversationId(conversationId);
    setIsMobileChatVisible(true);

    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === conversationId
          ? { ...conversation, unreadCount: 0 }
          : conversation
      )
    );

    fetch("/api/messages/read", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId }),
    });
  }

  function handleBackToList() {
    setIsMobileChatVisible(false);
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden p-6 lg:p-12">
      <div className="grid h-full min-h-0 grid-rows-1 overflow-hidden grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
        <div className={isMobileChatVisible ? "hidden lg:block" : "block"}>
          <ConversationList
            conversations={conversations}
            activeConversationId={activeConversationId}
            onSelectConversation={handleSelectConversation}
          />
        </div>

        <ChatArea
          currentUserId={currentUserId}
          activeConversation={activeConversation}
          activeMessages={activeMessages}
          isMobileChatVisible={isMobileChatVisible}
          onBackToList={handleBackToList}
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
}
