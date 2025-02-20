import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

export async function POST(req: Request, res: Response) {
  try {
    const session = await auth();

    if (!session?.user || !session.user.email) {
      return NextResponse.json(
        {
          message: "You must be logged in to access this route",
        },
        {
          status: 401,
        }
      );
    }

    const body = await req.json();

    //* Stripe product id
    const { stripeId, priceId, dateTime, doctorId } = body;

    //! Check if all fields are filled
    if (!stripeId || !priceId || !dateTime || !doctorId) {
      return NextResponse.json(
        {
          message: "Please provide all required fields: stripeId, priceId, dateTime, and doctorId",
        },
        {
          status: 400,
        }
      );
    }

    // Validate doctor exists
    const doctor = await prisma.user.findFirst({
      where: {
        id: doctorId,
        role: "doctor",
      },
    });

    if (!doctor) {
      return NextResponse.json(
        {
          message: "Doctor not found",
        },
        {
          status: 404,
        }
      );
    }

    // Validate dateTime format
    const appointmentDateTime = new Date(dateTime);
    if (isNaN(appointmentDateTime.getTime())) {
      return NextResponse.json(
        {
          message: "Invalid date and time format",
        },
        {
          status: 400,
        }
      );
    }

    const product = await prisma.product.findUnique({
      where: {
        stripeId: stripeId,
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

    // Create Stripe customer
    let user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
    });

    if (!user?.stripeCustomerId) {
      // Create Stripe customer
      const customer = await stripe.customers.create({
        email: session.user.email,
        name: session.user.name || undefined,
      });

      // Update user with Stripe customer ID
      user = await prisma.user.update({
        where: {
          email: session.user.email,
        },
        data: {
          stripeCustomerId: customer.id,
        },
      });
    }

    if (!user?.stripeCustomerId) {
      return NextResponse.json(
        {
          message: "Failed to create Stripe customer",
        },
        {
          status: 500,
        }
      );
    }

    //* Create a Stripe checkout Session.
    const stripeSession = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: session.user.email as string,
      metadata: {
        dateTime: dateTime,
        doctorId: doctorId,
        // DELETED REFACTORING CREATING CUSTOMER ID ON CHECKOUT patientId: session.user.stripeCustomerId, // Stripe customer id
        patientId: user.stripeCustomerId,
        stripePriceId: priceId,
        productId: stripeId, // Stripe product id
      },
      success_url: `${process.env.NEXT_PUBLIC_API_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_API_URL}`,
    });
    return NextResponse.json(
      {
        message: "Checkout created",
        url: stripeSession.url,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Something went wrong",
        error,
      },
      {
        status: 500,
      }
    );
  }
}
