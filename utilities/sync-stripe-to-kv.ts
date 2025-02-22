import { stripe } from "@/lib/stripe";
import { STRIPE_CACHE_KV } from "@/store/stripe";
import Stripe from "stripe";

export async function syncStripeDataToKV(stripeCustomerId: string) {
  try {
    const paymentIntents = await stripe.paymentIntents.list({
      customer: stripeCustomerId,
      limit: 1, // Only get most recent one
    });

    // Get the most recent payment intent
    const latestPayment = paymentIntents.data[0];

    if (!latestPayment) {
      return null;
    }

    // Map Stripe PaymentIntent status to our order status
    const orderStatus = mapPaymentIntentStatus(latestPayment.status);

    // Only proceed if we have required metadata
    if (!latestPayment.metadata?.dateTime || !latestPayment.metadata?.doctorId) {
      return null;
    }

    // Create the appointment data structure
    const appointmentData = {
      userId: latestPayment.metadata.userId,
      status: orderStatus,
      amount: latestPayment.amount,
      paymentIntentId: latestPayment.id,
      customerEmail: latestPayment.receipt_email || "",
      metadata: {
        dateTime: latestPayment.metadata.dateTime,
        doctorId: latestPayment.metadata.doctorId,
        patientId: latestPayment.metadata.patientId,
        stripePriceId: latestPayment.metadata.stripePriceId,
        productId: latestPayment.metadata.productId,
      },
    };

    // Store the data in KV using the payment intent ID as the key
    await STRIPE_CACHE_KV.ORDER.set(latestPayment.id, appointmentData);

    // Return the created data
    return appointmentData;
  } catch (error) {
    console.error("[SYNC_STRIPE_TO_KV]", error);
    throw error;
  }
}

function mapPaymentIntentStatus(status: Stripe.PaymentIntent.Status): "processing" | "succeeded" | "failed" {
  switch (status) {
    case "succeeded":
      return "succeeded";
    case "canceled":
      return "failed";
    case "requires_payment_method":
    case "requires_confirmation":
    case "requires_action":
    case "processing":
    case "requires_capture":
      return "processing";
    default:
      return "processing";
  }
}
