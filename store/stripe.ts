import { redis } from "@/lib/redis";

// type STRIPE_ORDER_STATUS = "pending" | "paid" | "fulfilled" | "cancelled";

export type STRIPE_ORDER_CACHE = {
  // From checkout session
  userId: string; // From metadata.userId
  status: string; // Payment status from Stripe
  amount: number; // From session.amount_total
  paymentIntentId: string; // From session.payment_intent
  customerEmail: string; // From customer_email
  // From checkout session metadata
  metadata: Record<string, any>; // As i may change the metadata in the future
  // metadata: {
  //   dateTime: string; // From metadata.dateTime
  //   doctorId: string; // From metadata.doctorId
  //   patientId: string; // From metadata.patientId
  //   stripePriceId: string; // From metadata.stripePriceId
  //   productId: string; // From metadata.productId
  // };
};

export const STRIPE_CACHE_KV = {
  // For storing order data
  ORDER: {
    generateKey(stripeCustomerId: string) {
      return `stripe:order:${stripeCustomerId}`;
    },
    async get(stripeCustomerId: string): Promise<STRIPE_ORDER_CACHE | null> {
      const response = await redis.get(this.generateKey(stripeCustomerId));
      if (!response) return null;
      return JSON.parse(response as string) as STRIPE_ORDER_CACHE;
    },
    async set(stripeCustomerId: string, orderData: STRIPE_ORDER_CACHE) {
      await redis.set(this.generateKey(stripeCustomerId), JSON.stringify(orderData));
    },
  },

  // Keep the customer ID mapping (this is still useful)
  CUSTOMER: {
    generateKey(userId: string) {
      return `stripe:user:${userId}`;
    },
    async get(userId: string) {
      return await redis.get(this.generateKey(userId));
    },
    async set(userId: string, customerId: string) {
      await redis.set(this.generateKey(userId), customerId);
    },
  },
};
