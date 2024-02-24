import { stripe } from '@/lib/stripe';
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { auth } from '@/auth';

export async function POST(req: Request, res: Response) {
  try {
    const session = await auth();

    if (!session?.user || !session.user.email) {
      return NextResponse.json(
        {
          message: 'You must be logged in to access this route',
        },
        {
          status: 401,
        }
      );
    }

    const body = await req.json();

    //* Stripe product id
    const { stripeId, priceId } = body;

    //! Check if all fields are filled
    if (!stripeId || !priceId) {
      return NextResponse.json(
        {
          message: 'Please provide all fields',
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
          message: 'Product not found',
        },
        {
          status: 404,
        }
      );
    }

    //* Create a Stripe checkout Session.

    const stripeSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: session.user.email as string,
      metadata: {
        // dateTime: dateTime,
        // doctorId: doctorId,
        patientId: session.user.stripeCustomerId, // Stripe customer id
        stripePriceId: priceId,
        productId: stripeId, // Stripe product id
      },
      success_url: `http://localhost:3000/success`,
      cancel_url: `http://localhost:3000`,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: 'Something went wrong',
        error,
      },
      {
        status: 500,
      }
    );
  }
}
