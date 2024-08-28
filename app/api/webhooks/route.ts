import { auth } from '@/auth';
import { stripe } from '@/lib/stripe';
import prisma from '@/lib/db';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { Resend } from 'resend';
import { ReceiptEmailHtml } from '@/components/emails/appointment-email';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request, res: Response) {
  const body = await req.text(); // raw body
  const sig = req.headers.get('stripe-signature')!;

  if (!sig) {
    return NextResponse.json(
      {
        message: 'Missing the stripe signature',
      },
      {
        status: 400,
      }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET as string);
  } catch (err) {
    return NextResponse.json(
      {
        message: 'Webhook error: ' + err,
      },
      {
        status: 400,
      }
    );
  }

  // Get the data from the event
  const checkoutSession = event.data.object as Stripe.Checkout.Session;

  if (!checkoutSession.metadata?.patientId) {
    return NextResponse.json(
      {
        message: 'Missing patient id',
      },
      {
        status: 400,
      }
    );
  }

  switch (event.type) {
    case 'checkout.session.completed':
      // Create an appointment on the db
      const appointment = await prisma.appointment.create({
        data: {
          status: 'pending',
          dateTime: checkoutSession.metadata?.dateTime || '',
          // doctorId: checkoutSession.metadata?.doctorId || '',
          patientId: checkoutSession.metadata?.patientId!,
          productId: checkoutSession.metadata?.productId!, // Stripe product id
          stripeSessionId: checkoutSession.id,
        },
      });

      const patient = await prisma.user.findUnique({
        where: {
          stripeCustomerId: checkoutSession.metadata?.patientId,
        },
      });

      if (!patient) {
        return NextResponse.json(
          {
            message: 'Patient not found',
          },
          {
            status: 400,
          }
        );
      }

      const therapy = await prisma.product.findUnique({
        where: {
          stripeId: checkoutSession.metadata?.productId,
        },
      });

      // Send an email to the patient
      try {
        const email = await resend.emails.send({
          from: 'Psicoreinventar <no-reply@psicoreinventar.com>',
          to: patient.email!,
          subject: 'Thanks for booking a session! This is your receipt',
          react: ReceiptEmailHtml({
            date: new Date(),
            email: patient.email!,
            appointmentId: appointment.id,
            patient: patient.name!,
            product: therapy!,
          }),
        });
        return NextResponse.json(
          {
            email,
          },
          {
            status: 200,
          }
        );
      } catch (error) {
        return NextResponse.json(
          {
            error,
          },
          {
            status: 400,
          }
        );
      }

      console.log('Checkout session was completed');
      return new Response(null, { status: 200 });
      break;
    default:
      console.log('Unhandled event type: ' + event.type);
  }
  return new Response(null, { status: 200 });
}
