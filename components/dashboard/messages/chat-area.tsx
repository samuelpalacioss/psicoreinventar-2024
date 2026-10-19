"use client";

import { useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ChatConversation, ChatMessage } from "@/src/types";
import { Icons } from "@/components/icons";
import { getInitials } from "@/utils/pusher";
import { MessageBubble } from "@/components/dashboard/messages/message-bubble";
import { MessageInput } from "@/components/dashboard/messages/message-input";

interface ChatAreaProps {
  currentUserId: string;
  activeConversation: ChatConversation | null;
  activeMessages: ChatMessage[];
  isMobileChatVisible: boolean;
  onBackToList: () => void;
  onSendMessage: (content: string) => Promise<void>;
}

export function ChatArea({
  currentUserId,
  activeConversation,
  activeMessages,
  isMobileChatVisible,
  onBackToList,
  onSendMessage,
}: ChatAreaProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [activeMessages, activeConversation?.id]);

  return (
    <section
      className={[
        "h-full min-h-0 flex-col rounded-2xl bg-gray-50/50 p-4 sm:p-6",
        isMobileChatVisible ? "flex" : "hidden",
        "lg:flex",
      ].join(" ")}
    >
      {activeConversation ? (
        <>
          <div className="flex items-center gap-3 border-b border-gray-200/70 pb-4">
            <Button
              type="button"
              variant="ghost"
              onClick={onBackToList}
              className="h-8 w-8 p-0 lg:hidden"
            >
              <Icons.chevronLeft className="h-5 w-5 text-gray-700" />
            </Button>
            <Avatar className="h-11 w-11">
              <AvatarImage
                src={activeConversation.participant.image ?? undefined}
                alt={activeConversation.participant.name}
              />
              <AvatarFallback className="bg-indigo-200/40 text-gray-700">
                {getInitials(activeConversation.participant.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-gray-900">{activeConversation.participant.name}</p>
              <p className="text-xs font-light text-gray-500">Conversation</p>
            </div>
          </div>

          <div className="flex-1 min-h-0 space-y-5 overflow-y-auto py-6">
            {activeMessages.length === 0 ? (
              <p className="text-sm font-light text-gray-500">
                Start the conversation by sending your first message.
              </p>
            ) : (
              activeMessages.map((message) => (
                <MessageBubble
                  key={message.id}
                  currentUserId={currentUserId}
                  message={message}
                  participant={activeConversation.participant}
                />
              ))
            )}
            <div ref={bottomRef} />
          </div>

          <div className="border-t border-gray-200/70 pt-4">
            <MessageInput onSendMessage={onSendMessage} />
          </div>
        </>
      ) : (
        <div className="flex h-full items-center justify-center">
          <p className="text-sm font-light text-gray-500">Select a conversation to start chatting.</p>
        </div>
      )}
    </section>
  );
}
