"use client";

import { FormEvent, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";

interface MessageInputProps {
  isDisabled?: boolean;
  onSendMessage: (content: string) => Promise<void>;
}

export function MessageInput({ isDisabled, onSendMessage }: MessageInputProps) {
  const [messageContent, setMessageContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isDisabled || isSubmitting || messageContent.trim().length === 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSendMessage(messageContent.trim());
      setMessageContent("");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-3">
      <Input
        value={messageContent}
        onChange={(event) => setMessageContent(event.target.value)}
        placeholder="Write a message..."
        disabled={isDisabled || isSubmitting}
        maxLength={500}
        className="h-11 rounded-xl border-gray-200/70 bg-white text-sm md:text-base"
      />
      <Button
        type="submit"
        disabled={isDisabled || isSubmitting || messageContent.trim().length === 0}
        className="h-11 rounded-xl bg-gray-900 px-5 text-sm text-white hover:bg-gray-800"
      >
        <Icons.send className="size-5" />
      </Button>
    </form>
  );
}
