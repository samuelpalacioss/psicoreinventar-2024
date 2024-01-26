import type { NextAuthConfig } from 'next-auth';

// import { stripe } from '@/lib/stripe';
import prisma from '@/lib/db';

export default {
  providers: [],
  // events: {
  //   createUser: async ({ user }) => {
  //     // Create a customer for the user in Stripe
  //     if (user.name && user.email) {
  //       const customer = await stripe.customers.create({
  //         email: user.email,
  //         name: user.name,
  //       });

  //       // Update prisma user with the stripe customer id
  //       await prisma.user.update({
  //         where: {
  //           id: user.id,
  //         },
  //         data: {
  //           stripeCustomerId: customer.id,
  //         },
  //       });
  //     }
  //   },
  // },
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture;
        session.user.role = token.role;
        session.user.id = token.id;
        // session.user.stripeCustomerId = token.stripeCustomerId;
      }
      return session;
    },
    async jwt({ token, user, account }) {
      const dbUser = await prisma.user.findFirst({
        where: {
          email: token.email,
        },
      });

      if (!dbUser) {
        if (user) {
          token.id = user?.id;
        }
        return token;
      }

      return {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        picture: dbUser.image,
        role: dbUser.role,
        // stripeCustomerId: dbUser.stripeCustomerId,
      };
    },
  },
} satisfies NextAuthConfig;
