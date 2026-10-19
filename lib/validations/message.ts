import * as z from "zod";
import { numericIdSchema } from "@/lib/api/schemas/common.schemas";

export const sendMessageSchema = z.object({
  conversationId: numericIdSchema,
  content: z.string().trim().min(1).max(2000),
});

export const createConversationSchema = z.object({
  doctorId: numericIdSchema,
  personId: numericIdSchema,
});

export const conversationQuerySchema = z.object({
  conversationId: z.coerce.number().int().positive().optional(),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type CreateConversationInput = z.infer<typeof createConversationSchema>;
export type ConversationQueryInput = z.infer<typeof conversationQuerySchema>;
