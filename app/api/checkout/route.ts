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

    const { productId } = body;

    //! Check if all fields are filled
    if (!productId) {
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
        productId: productId,
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

    const stripeSession = await stripe.checkout.sessions.create({});
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
