import { auth } from "@/auth";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";
import { ReceiptEmailHtml } from "@/components/emails/appointment-email";
import { syncStripeDataToKV } from "@/utilities/sync-stripe-to-kv";
import { waitUntil } from "@vercel/functions";
import { tryCatch } from "@/utilities/tryCatch";

const resend = new Resend(process.env.RESEND_API_KEY);

const allowedEvents: Stripe.Event.Type[] = [
  // Checkout completion - main event for successful payment
  "checkout.session.completed",

  // Payment intent events - for tracking payment status
  "payment_intent.succeeded",
  "payment_intent.payment_failed",
  "payment_intent.canceled",

  // Invoice events - for payment records and failures
  "invoice.paid",
  "invoice.payment_failed",
  "invoice.payment_action_required",
  "invoice.payment_succeeded",
];

async function processEvent(event: Stripe.Event) {
  // Skip processing if the event isn't one I'm tracking
  if (!allowedEvents.includes(event.type)) return;

  try {
    switch (event.type) {
      case "checkout.session.completed":
        const checkoutSession = event.data.object as Stripe.Checkout.Session;
        const appointmentDateTime = new Date(checkoutSession.metadata?.dateTime as string);

        // Create appointment
        const appointment = await prisma.appointment.create({
          data: {
            status: "pending",
            dateTime: appointmentDateTime.toISOString(),
            doctorId: checkoutSession.metadata?.doctorId!,
            patientId: checkoutSession.metadata?.patientId!,
            productId: checkoutSession.metadata?.productId!,
            stripeSessionId: checkoutSession.id,
            isPaid: true,
          },
        });

        // Get patient details
        const patient = await prisma.user.findUnique({
          where: {
            stripeCustomerId: checkoutSession.metadata?.patientId,
          },
        });

        if (!patient) {
          throw new Error("Patient not found");
        }

        // Get therapy details
        const therapy = await prisma.product.findUnique({
          where: {
            stripeId: checkoutSession.metadata?.productId,
          },
        });

        if (!therapy) {
          throw new Error("Therapy product not found");
        }

        // Send confirmation email
        await resend.emails.send({
          from: "Psicoreinventar <no-reply@psicoreinventar.com>",
          to: patient.email!,
          subject: "Thanks for booking a session! This is your receipt",
          react: ReceiptEmailHtml({
            date: new Date(),
            email: patient.email!,
            appointmentId: appointment.id,
            patient: patient.name!,
            product: therapy,
          }),
        });

        // Sync stripe data after successful appointment creation
        await syncStripeDataToKV(checkoutSession.customer as string);
        break;
      // Handle other event types
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    return new Response(null, { status: 200 });
  } catch (error) {
    console.error(`[STRIPE HOOK] Error processing ${event.type}:`, error);
    throw error; // Re-throw to be caught by the main error handler
  }
}

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  if (!sig) {
    return NextResponse.json(
      {
        message: "Missing the stripe signature",
      },
      {
        status: 400,
      }
    );
  }

  if (!sig) return NextResponse.json({}, { status: 400 });

  async function doEventProcessing() {
    if (typeof sig !== "string") {
      throw new Error("[STRIPE HOOK] Header isn't a string???");
    }

    const event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);

    waitUntil(processEvent(event));
  }

  const { error } = await tryCatch(doEventProcessing());

  if (error) {
    console.error("[STRIPE HOOK] Error processing event", error);
  }

  return NextResponse.json({ received: true });
}
