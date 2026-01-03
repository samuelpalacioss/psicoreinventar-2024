import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { env } from "@/utils/env";

async function runMigrations() {
  const migrationClient = postgres(env.DATABASE_URL!, { max: 1 });

  console.log("Running migrations...");

  await migrate(drizzle(migrationClient), {
    migrationsFolder: "./drizzle",
  });

  console.log("Migrations completed successfully!");

  await migrationClient.end();
}

runMigrations().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
