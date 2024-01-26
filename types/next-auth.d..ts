import NextAuth, { DefaultSession } from 'next-auth';
import { DefaultJWT } from '@auth/core/jwt';

declare module 'next-auth' {
  // Extend session to hold the access_token
  interface Session {
    user: User & {
      id: UserId;
      role: Role;
      stripeCustomerId: string;
    };
  }

  // Extend token to hold the access_token before it gets put into session
  interface JWT {
    id: UserId;
    role: Role;
    stripeCustomerId: string;
  }
}
