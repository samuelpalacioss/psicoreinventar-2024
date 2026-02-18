import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChatMessage, ChatParticipant } from "@/src/types";
import { cn } from "@/lib/utils";
import { formatChatTime, getInitials } from "@/utils/pusher";

interface MessageBubbleProps {
  currentUserId: string;
  message: ChatMessage;
  participant: ChatParticipant;
}

export function MessageBubble({ currentUserId, message, participant }: MessageBubbleProps) {
  const isOwnMessage = currentUserId === message.senderId;

  return (
    <div className={cn("flex w-full", isOwnMessage ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "flex max-w-[80%] gap-2",
          isOwnMessage ? "flex-row-reverse items-end" : "flex-col items-start"
        )}
      >
        {!isOwnMessage && (
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarImage src={participant.image ?? undefined} alt={participant.name} />
              <AvatarFallback className="bg-indigo-200/40 text-xs text-gray-700">
                {getInitials(participant.name)}
              </AvatarFallback>
            </Avatar>
            <p
              className={cn(
                "max-w-[280px] wrap-break-word rounded-2xl px-4 py-2 text-sm font-light leading-relaxed text-gray-900",
                "bg-gray-200/40"
              )}
            >
              {message.content}
            </p>
          </div>
        )}

        {isOwnMessage && (
          <div className="flex flex-col items-end space-y-1">
            <p
              className={cn(
                "max-w-[280px] wrap-break-word rounded-2xl px-4 py-2 text-sm font-light leading-relaxed text-gray-900",
                "bg-rose-200/40"
              )}
            >
              {message.content}
            </p>
            <span className="text-xs font-light text-gray-500">{formatChatTime(message.createdAt)}</span>
          </div>
        )}

        {/* Time at bottom for other user: below avatar + bubble row, aligned under bubble */}
        {!isOwnMessage && (
          <span className="ml-10 text-xs font-light text-gray-500">
            {formatChatTime(message.createdAt)}
          </span>
        )}
      </div>
    </div>
  );
}
