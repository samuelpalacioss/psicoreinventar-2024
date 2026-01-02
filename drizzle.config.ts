import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    // host: process.env.POSTGRES_HOST!,
    // port: parseInt(process.env.POSTGRES_PORT!),
    // user: process.env.POSTGRES_USER!,
    // password: process.env.POSTGRES_PASSWORD!,
    // database: process.env.POSTGRES_DB!,
    // ssl: true,
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
