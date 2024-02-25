import { z } from 'zod';

export const productSchema = z.object({
  stripeId: z.string().min(10).optional(),
  name: z.string().min(3).max(128),
  description: z.string().min(3).max(128),
  price: z.number().min(1),
  priceId: z.string().min(10).optional(),
  isArchived: z.boolean().default(false),
  time: z.string().min(2).max(8),
  image: z.string().url({ message: 'Invalid url' }),
});

export type Product = z.infer<typeof productSchema>;

export const patchProductSchema = z.object({
  name: z.string().min(3).max(128).optional(),
  description: z.string().min(3).max(128).optional(),
  price: z.number().min(1).optional(),
  isArchived: z.boolean().optional(),
  image: z.string().url().optional(),
  time: z.string().min(2).max(12).optional(),
  active: z.boolean().optional(),
});
