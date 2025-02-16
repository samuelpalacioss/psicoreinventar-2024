import { DefaultSession } from "next-auth";
import { Role } from "@prisma/client";

//Augment the default Session, User & JWT Towen to include extra properties;
declare module "next-auth" {
  interface User {
    role: Role;
    stripeCustomerId: string;
  }

  interface Session {
    user: {
      role: Role;
      stripeCustomerId: string;
    } & DefaultSession["user"];
    /*
    token: {
      role: Role;
      stripeCustomerId: string;
    }; */
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: Role;
    stripeCustomerId: string;
  }
}
