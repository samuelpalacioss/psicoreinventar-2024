import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET(req: NextRequest, res: Response) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const stripeSessionId = searchParams.get("session_id");

    //* Get the user's checkout (after checkout completed)
    const stripeSession = await stripe.checkout.sessions.retrieve(stripeSessionId as string, {
      expand: ["payment_intent.payment_method"],
    });

    //! Check if the session exists
    if (!stripeSession) {
      return NextResponse.json(
        {
          message: "Session not found",
        },
        {
          status: 404,
        }
      );
    }
    //@ts-ignore
    // For some reason it says that the property does not exist but it's not true.
    const lastFourDigits = stripeSession.payment_intent.payment_method.card.last4;

    //* Retrieve the metadata
    const total = stripeSession.amount_total;
    const metadata = stripeSession.metadata;

    //* Get the appointment created on the db
    const appointment = await prisma.appointment.findUnique({
      where: {
        stripeSessionId: stripeSession.id,
      },
    });

    // ! Check if the appointment exists
    if (!appointment) {
      return NextResponse.json(
        {
          message: "Appointment not found",
        },
        {
          status: 404,
        }
      );
    }

    const product = await prisma.product.findUnique({
      where: {
        stripeId: metadata?.productId,
      },
    });
    if (!product) {
      return NextResponse.json(
        {
          message: "Product not found",
        },
        {
          status: 404,
        }
      );
    }

    //* Return the appointment id, and the metadata
    return NextResponse.json(
      {
        appointmentId: appointment.id,
        total,
        metadata,
        product: product.name,
        lastFourDigits,
        // stripeSession,
        // stripe_sessionId: stripeSessionId,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Something went wrong",
        error: error,
      },
      {
        status: 500,
      }
    );
  }
}
