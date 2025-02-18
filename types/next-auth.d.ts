import { DefaultSession } from "next-auth";
import { Role } from "@prisma/client";

//Augment the default Session, User & JWT Towen to include extra properties;
declare module "next-auth" {
  interface User {
    role: Role;
  }

  interface Session {
    user: {
      role: Role;
    } & DefaultSession["user"];
    /*
    token: {
      role: Role;
    }; */
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: Role;
  }
}
