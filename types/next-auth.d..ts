import NextAuth, { DefaultSession } from 'next-auth';
import { DefaultJWT } from '@auth/core/jwt';
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
  /** Returned by the `jwt` callback and `auth`, when using JWT sessions */
  interface JWT {
    id: UserId;
    role: Role;
    stripeCustomerId: string;
  }
}
