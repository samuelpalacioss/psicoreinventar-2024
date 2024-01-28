import { type Session, type User } from 'next-auth';
import type { NextAuthConfig } from 'next-auth';
import bcrypt from 'bcryptjs';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import prisma from '@/lib/db';
import type { JWT } from 'next-auth/jwt';

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

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
          // stripeCustomerId: user.stripeCustomerId,
        };
      },
    }),
  ],
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
    authorized({ auth, request: { nextUrl } }) {
      const { pathname, search } = nextUrl;
      const isLoggedIn = !!auth?.user;
      const isOnAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');

      const unProtectedPages = ['/terms', '/privacy-policy']; // Add more here if needed
      const isOnUnprotectedPage =
        pathname === '/' || // The root page '/' is also an unprotected page
        unProtectedPages.some((page) => pathname.startsWith(page));
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
    async session({ session, token }: { session: Session; user?: User; token?: JWT }) {
      if (token) {
        if (token.sub && session.user) {
          session.user.id = token.sub;
        }

        if (token.role && session.user) {
          session.user.role = token.role as UserRole;
        }

        if (session.user) {
          session.user.isTwoFactorEnabled = token.isTwoFactorEnabled as boolean;
        }

        if (session.user) {
          session.user.name = token.name;
          session.user.email = token.email;
          session.user.isOAuth = token.isOAuth as boolean;
        }

        return session;
      }
    },
    // async session({ session, token }: { session: Session; user?: User; token?: JWT }) {
    //   if (token) {
    //     session.user.name = token.name;
    //     session.user.email = token.email;
    //     session.user.image = token.picture;
    //     session.user.role = token.role;
    //     session.user.id = token.id;
    //     session.user.stripeCustomerId = token.stripeCustomerId;
    //   }
    //   return session as Session;
    // },
    // async jwt({ token, user }) {
    //   const dbUser = await prisma.user.findFirst({
    //     where: {
    //       email: token.email,
    //     },
    //   });

    //   if (!dbUser) {
    //     if (user) {
    //       token.id = user?.id as string;
    //     }
    //     return token;
    //   }

    //   return {
    //     id: dbUser.id,
    //     name: dbUser.name,
    //     email: dbUser.email,
    //     picture: dbUser.image,
    //     role: dbUser.role,
    //     stripeCustomerId: dbUser.stripeCustomerId,
    //   } as JWT;
    // },
  },
} satisfies NextAuthConfig;
