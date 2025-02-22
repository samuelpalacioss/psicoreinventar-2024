"use server";

import { stripe } from "@/lib/stripe";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { STRIPE_CACHE_KV } from "@/store/stripe";
import { syncStripeDataToKV } from "@/utilities/sync-stripe-to-kv";

interface CreateCheckoutSessionParams {
  productId: string;
  priceId: string;
  dateTime?: string;
  doctorId?: string;
  returnUrl?: string;
}

export async function triggerStripeSyncForUser() {
  const session = await auth();

  if (!session?.user || !session.user.email) {
    return;
  }

  const stripeCustomerId = (await STRIPE_CACHE_KV.CUSTOMER.get(session.user.id!)) as string;

  if (!stripeCustomerId) {
    return;
  }

  return await syncStripeDataToKV(stripeCustomerId);
}

export async function createCheckoutSession({
  productId,
  priceId,
  dateTime,
  doctorId,
  returnUrl,
}: CreateCheckoutSessionParams) {
  try {
    const session = await auth();

    if (!session?.user || !session.user.email) {
      throw new Error("You must be logged in to access this route");
    }

    // Validate required fields
    if (!productId || !priceId || !dateTime || !doctorId) {
      throw new Error("Please provide all required fields: productId, priceId, dateTime, and doctorId");
    }

    // Validate doctor exists
    const doctor = await prisma.user.findFirst({
      where: {
        id: doctorId,
        role: "doctor",
      },
    });

    if (!doctor) {
      throw new Error("Doctor not found");
    }

    // Validate dateTime format
    const appointmentDateTime = new Date(dateTime);
    if (isNaN(appointmentDateTime.getTime())) {
      throw new Error("Invalid date and time format");
    }

    // Validate product exists
    const product = await prisma.product.findUnique({
      where: {
        stripeId: productId,
      },
    });

    if (!product) {
      throw new Error("Product not found");
    }

    let stripeCustomerId = (await STRIPE_CACHE_KV.CUSTOMER.get(session.user.id!)) as string | undefined;

    console.log("[Stripe][CheckoutSession] Here's the stripe id we got from KV:", stripeCustomerId);

    if (!stripeCustomerId) {
      console.log("[Stripe][CheckoutSession] No stripe customer id found in KV, creating new customer");

      const newCustomer = await stripe.customers.create({
        email: session.user.email!,
        name: session.user.name!,
        metadata: {
          userId: session.user.id!,
        },
      });

      await STRIPE_CACHE_KV.CUSTOMER.set(session.user.id!, newCustomer.id);

      console.log("[Stripe][CheckoutSession] CUSTOMER CREATED", newCustomer);
      stripeCustomerId = newCustomer.id;
    }

    // Create Stripe checkout session
    const stripeSession = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: session.user.email,
      customer: stripeCustomerId,
      metadata: {
        dateTime: dateTime,
        doctorId: doctorId,
        patientId: stripeCustomerId, // CHECK THESE MAYBE NOT NEEDED 2 PATIENTID AND USERID
        userId: session.user.id!,
        stripePriceId: priceId,
        productId,
      },
      success_url: `${process.env.NEXT_PUBLIC_API_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_API_URL}`,
    });

    return { url: stripeSession.url };
  } catch (error) {
    console.error("[STRIPE_CREATE_CHECKOUT_SESSION]", error);
    throw error;
  }
}
