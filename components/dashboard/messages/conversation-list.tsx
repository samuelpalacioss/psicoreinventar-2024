import { ChatConversation } from "@/src/types";
import { ConversationItem } from "@/components/dashboard/messages/conversation-item";

interface ConversationListProps {
  conversations: ChatConversation[];
  activeConversationId: number | null;
  onSelectConversation: (conversationId: number) => void;
}

export function ConversationList({
  conversations,
  activeConversationId,
  onSelectConversation,
}: ConversationListProps) {
  return (
    <aside className="h-full rounded-2xl bg-gray-50/50 p-4">
      <div className="mb-4">
        <h2 className="text-xl font-light text-gray-900">Messages</h2>
        <p className="text-sm font-light text-gray-600">Recent conversations</p>
      </div>

      <div className="space-y-1">
        {conversations.length === 0 ? (
          <p className="px-2 py-6 text-sm font-light text-gray-500">
            You do not have active conversations yet.
          </p>
        ) : (
          conversations.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              isActive={activeConversationId === conversation.id}
              onSelectConversation={onSelectConversation}
            />
          ))
        )}
      </div>
    </aside>
  );
}
