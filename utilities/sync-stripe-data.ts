import { stripe } from "@/lib/stripe";
import { STRIPE_CACHE_KV } from "@/store/stripe";
import Stripe from "stripe";

/**
 * Syncs Stripe payment data to KV store for a given customer
 * Focuses on appointment payments and their current status
 */
export async function syncStripeDataToKV(customerId: string) {
  try {
    // Fetch recent payment data from Stripe
    const checkoutSessions = await stripe.checkout.sessions.list({
      customer: customerId,
      limit: 25, // Adjust based on needs
      expand: ["line_items", "payment_intent"],
    });

    // No sessions found
    if (checkoutSessions.data.length === 0) {
      return { success: true, message: "No payment sessions found" };
    }

    // Process each session
    for (const session of checkoutSessions.data) {
      if (!session.payment_intent || typeof session.payment_intent === "string") {
        continue;
      }

      // Map payment status
      let status: "pending" | "paid" | "fulfilled" | "cancelled";
      switch (session.payment_status) {
        case "paid":
          status = "paid";
          break;
        case "unpaid":
          status = "pending";
          break;
        case "no_payment_required":
          status = "fulfilled";
          break;
        default:
          status = "cancelled";
      }

      // Format order data according to your cache structure
      const orderData = {
        orderId: session.id,
        userId: session.metadata?.userId || "",
        status,
        amount: session.amount_total || 0,
        items:
          session.line_items?.data.map((item) => ({
            id: item.price?.product as string,
            quantity: item.quantity || 1,
            priceId: item.price?.id || "",
            unitAmount: item.price?.unit_amount || 0,
          })) || [],
        paymentIntentId: session.payment_intent.id,
        metadata: {
          dateTime: session.metadata?.dateTime,
          doctorId: session.metadata?.doctorId,
          productId: session.metadata?.productId,
          stripePriceId: session.metadata?.stripePriceId,
        },
        customerEmail: session.customer_details?.email || "",
      };

      // Store in KV cache
      await STRIPE_CACHE_KV.ORDER.set(session.id, orderData);
    }

    return { success: true, message: "Payment data synced successfully" };
  } catch (error) {
    console.error("[SYNC_STRIPE_DATA_ERROR]", error);
    throw error;
  }
}
