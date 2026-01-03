import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import db from "@/src/db";
import { users, sessions, accounts, verifications } from "@/src/db/schema";
import { env } from "../../utils/env";
import { nextCookies } from "better-auth/next-js";
import { Role } from "@/types/enums";
import { authContext } from "./auth-context";
import { hashPassword, verifyPassword } from "@/utils/bcrypt";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: users,
      session: sessions,
      account: accounts,
      verification: verifications,
    },
  }),
  user: {
    additionalFields: {
      role: {
        type: "string",
        input: false,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const ctx = authContext.getStore();
          return {
            data: {
              ...user,
              role: ctx?.role ?? Role.PATIENT,
            },
          };
        },
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    password: {
      hash: async (password) => {
        // the password after hashing e.g. const passwordHash = await hash(password);
        const passwordHash = await hashPassword(password);

        return passwordHash; // this is what will be stored as the password hash
      },
      verify: async ({ hash, password }) => {
        // verify that hash of password matches the stored hash
        const isCorrectPassword = await verifyPassword(password, hash);

        return isCorrectPassword;
      },
    },
  },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID as string,
      clientSecret: env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  plugins: [nextCookies()],
  //... the rest of your config
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
