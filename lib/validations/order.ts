/* Create a zod schema for this api call
  return NextResponse.json({
      appointmentId: appointment.id,
      total,
      metadata,
    });
*/

import { z } from 'zod';
import { productSchema } from './product';

export const order = z.object({
  appointmentId: z.string(),
  total: z.number(),
  metadata: z.object({
    patientId: z.string(),
    stripePriceId: z.string(),
    productId: z.string(),
  }),
  product: z.string(),
  lastFourDigits: z.string(),
});

export type Order = z.infer<typeof order>;
