import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(3).max(128),
  description: z.string().min(3).max(128),
  price: z.number().min(1),
  isArchived: z.boolean().default(false),
  image: z.string().url({ message: 'Invalid url' }),
  time: z.string().min(2).max(12),
});

export type Product = z.infer<typeof productSchema>;

export const patchProductSchema = z.object({
  name: z.string().min(3).max(128).optional(),
  description: z.string().min(3).max(128).optional(),
  price: z.number().min(1).optional(),
  isArchived: z.boolean().optional(),
  images: z.string().url().array().optional(),
  time: z.string().min(2).max(12).optional(),
  active: z.boolean().optional(),
});
