import NextAuth, { User } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import prisma from '@/lib/db';
import authConfig from '@/auth.config';
import { Role } from '@prisma/client';
import type { Adapter } from '@auth/core/adapters';

declare module 'next-auth' {
  interface Session {
    user: User & {
      role: Role;
      stripeCustomerId: string | null;
    };
    token: {
      role: Role;
      stripeCustomerId: string | null;
    };
  }
  interface User {
    role: Role;
    stripeCustomerId: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: Role;
    stripeCustomerId: string;
  }
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
} = NextAuth({
  adapter: PrismaAdapter(prisma) as Adapter,
  session: { strategy: 'jwt' },
  // secret: process.env.AUTH_SECRET,
  ...authConfig,
});
