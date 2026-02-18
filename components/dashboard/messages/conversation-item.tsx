import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { ChatConversation } from "@/src/types";
import { formatChatTime, getInitials } from "@/utils/pusher";

interface ConversationItemProps {
  conversation: ChatConversation;
  isActive: boolean;
  onSelectConversation: (conversationId: number) => void;
}

export function ConversationItem({
  conversation,
  isActive,
  onSelectConversation,
}: ConversationItemProps) {
  return (
    <button
      type="button"
      onClick={() => onSelectConversation(conversation.id)}
      className={cn(
        "flex w-full cursor-pointer items-center gap-3 rounded-xl px-2 py-3 text-left transition-colors",
        "hover:bg-white/80",
        isActive ? "bg-white" : "bg-transparent"
      )}
    >
      <Avatar className="h-11 w-11">
        <AvatarImage src={conversation.participant.image ?? undefined} alt={conversation.participant.name} />
        <AvatarFallback className="bg-indigo-200/40 text-gray-700">
          {getInitials(conversation.participant.name)}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-medium text-gray-900">{conversation.participant.name}</p>
          <div className="flex shrink-0 items-center gap-2">
            {conversation.lastMessage && (
              <span className="text-xs font-light text-gray-500">
                {formatChatTime(conversation.lastMessage.createdAt)}
              </span>
            )}
            {conversation.unreadCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-500 px-1 text-xs font-medium text-white">
                {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
              </span>
            )}
          </div>
        </div>
        <p className="truncate text-sm font-light text-gray-600">
          {conversation.lastMessage?.content ?? "No messages yet"}
        </p>
      </div>
    </button>
  );
}
