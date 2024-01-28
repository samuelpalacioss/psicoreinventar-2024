import NextAuth, { User } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import prisma from '@/lib/db';
import authConfig from '@/lib/auth.config';

import { Role } from '@prisma/client';

type UserId = string;

declare module 'next-auth' {
  // Extend session to hold role
  interface Session {
    user: User & {
      id: UserId;
      role: Role;
      stripeCustomerId: string;
    };
  }
}

declare module 'next-auth/jwt' {
  /* Returned by the `jwt` callback and `auth` */
  interface JWT {
    id: UserId;
    role: Role;
    stripeCustomerId: string;
  }
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
} = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  secret: process.env.AUTH_SECRET,
  ...authConfig,
});
