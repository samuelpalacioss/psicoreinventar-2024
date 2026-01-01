import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { config } from "dotenv";
import * as schema from "./schema";

// Load environment variables
config();

// Create the postgres client
const client = postgres(process.env.DATABASE_URL!);

// Create the drizzle database instance
const db = drizzle(client, { schema, logger: true });

export default db;
