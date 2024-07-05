import { type Session, type User } from 'next-auth';
import type { NextAuthConfig } from 'next-auth';
import bcrypt from 'bcryptjs';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import prisma from '@/lib/db';
import type { JWT } from 'next-auth/jwt';
import { getUserByEmail } from './hooks/user';
import { stripe } from './lib/stripe';
import { authRoutes, publicRoutes } from './config/routes';

export default {
  pages: {
    signIn: '/login',
  },
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: {
          label: 'Email',
          type: 'email',
          placeholder: 'jsmith@gmail.com',
        },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // If not credentials are provided, return null to indicate no user logged in
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        //* Check if user exists
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email as string,
          },
        });

        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password!
        );

        if (!isPasswordValid) {
          return null;
        }

        //* Create a customer in stripe for the user (if not already created). This works only for the (credentialsProvider)
        //* This is created before the user is logged in for the first time
        // Create a customer in Stripe
        if (user.name && user.email && !user.stripeCustomerId) {
          const customer = await stripe.customers.create({
            email: user.email,
            name: user.name,
          });

          // console.log('User created in stripe');

          // 2. Update the user in Prisma with the Stripe customer id
          await prisma.user.update({
            where: {
              id: user.id,
            },
            data: {
              stripeCustomerId: customer.id,
            },
          });
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
          stripeCustomerId: user.stripeCustomerId || 'lol',
        };
      },
    }),
  ],
  events: {
    //* Create a customer in stripe for the user. This works only for the google provider
    createUser: async ({ user }) => {
      // 1. Create a customer in Stripe
      if (user.name && user.email) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.name,
        });

        // console.log('User created in stripe');

        // 2. Update the user in Prisma with the Stripe customer id
        await prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            stripeCustomerId: customer.id,
          },
        });
      }
    },
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const { pathname, search } = nextUrl;
      const isLoggedIn = !!auth?.user;
      // Check if the user is on an auth page
      const isOnAuthPage = authRoutes.some((page) => pathname.startsWith(page));

      // Check if the user is on an public page
      const isOnUnprotectedPage =
        pathname === '/' || // The root page '/'
        publicRoutes.some((page) => pathname.startsWith(page));
      const isProtectedPage = !isOnUnprotectedPage;

      if (isOnAuthPage) {
        // Redirect to /dashboard, if logged in and is on an auth page
        if (isLoggedIn) return Response.redirect(new URL('/dashboard', nextUrl));
      } else if (isProtectedPage) {
        // Redirect to /login, if not logged in but is on a protected page
        if (!isLoggedIn) {
          const from = encodeURIComponent(pathname + search); // The /login page shall then use this `from` param as a `callbackUrl` upon successful sign in
          return Response.redirect(new URL(`/login?from=${from}`, nextUrl));
        }
      }

      // Don't redirect if on an unprotected page, or if logged in and is on a protected page
      return true;
    },
    async jwt({ token, user, session }) {
      const existingUser = await getUserByEmail(token?.email as string);

      // If no user exists
      if (!existingUser) return token;

      if (user) {
        return {
          ...token,
          role: user.role,
          // If it's null, set it to an empty string
          stripeCustomerId: user.stripeCustomerId!,
        };
      }

      return token;
    },
    async session({ session, token, user }: { session: Session; token?: JWT; user?: User }) {
      if (token) {
        return {
          ...session,
          user: {
            ...session.user,
            role: token.role,
            stripeCustomerId: token.stripeCustomerId,
          },
        };
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
