import "dotenv/config";
import db, { client } from "./index";
import { sql } from "drizzle-orm";

async function dropAll() {
  console.log("🗑️  Dropping all tables...");

  try {
    // ============================================================================
    // DROP ALL TABLES - Drop in reverse order of dependencies
    // ============================================================================
    console.log("📋 Dropping tables...");

    // Drop tables in reverse order of dependencies
    await db.execute(sql`DROP TABLE IF EXISTS "Review" CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS "Progress" CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS "Appointment" CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS "Payment" CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS "Payout_Method" CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS "Payment_Method_Person" CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS "Payment_Method" CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS "Doctor_Language" CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS "Doctor_Condition" CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS "Doctor_Service" CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS "Schedule" CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS "Age_Group" CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS "Education" CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS "Phone" CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS "Doctor" CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS "Person" CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS "Session" CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS "Account" CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS "Verification" CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS "User" CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS "Institution" CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS "Service" CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS "Language" CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS "Condition" CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS "Place" CASCADE`);

    console.log("✅ All tables dropped");

    // ============================================================================
    // DROP ENUMS
    // ============================================================================
    console.log("🔧 Dropping enums...");

    await db.execute(sql`DROP TYPE IF EXISTS "user_role" CASCADE`);
    await db.execute(sql`DROP TYPE IF EXISTS "appointment_status" CASCADE`);
    await db.execute(sql`DROP TYPE IF EXISTS "institution_type" CASCADE`);
    await db.execute(sql`DROP TYPE IF EXISTS "payment_method_type" CASCADE`);
    await db.execute(sql`DROP TYPE IF EXISTS "payout_type" CASCADE`);
    await db.execute(sql`DROP TYPE IF EXISTS "day_of_week" CASCADE`);
    await db.execute(sql`DROP TYPE IF EXISTS "condition_type" CASCADE`);
    await db.execute(sql`DROP TYPE IF EXISTS "language_type" CASCADE`);

    console.log("✅ All enums dropped");

    console.log("\n✨ Database drop completed successfully!");
  } catch (error) {
    console.error("❌ Error dropping database:", error);
    throw error;
  }
}

// Run drop function
dropAll()
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  })
  .finally(() => {
    console.log("🏁 Drop script finished");
    process.exit(0);
  });
