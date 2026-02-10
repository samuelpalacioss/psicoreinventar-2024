import "dotenv/config";
import db, { client } from "./index";
import { sql } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";
import {
  users,
  places,
  institutions,
  persons,
  doctors,
  phones,
  conditions,
  languages,
  services,
  ageGroups,
  educations,
  schedules,
  doctorServices,
  doctorConditions,
  doctorLanguages,
  paymentMethods,
  paymentMethodPersons,
  payoutMethods,
  appointments,
  payments,
  reviews,
  progresses,
  accounts,
  verifications,
  sessions,
} from "./schema";

const POSTGRES_RELATION_NOT_EXIST = "42P01";

/** Safely delete from a table; skip if table doesn't exist (schema out of sync) */
async function safeDelete(table: PgTable, name: string): Promise<void> {
  try {
    await db.delete(table);
  } catch (err) {
    const cause = err as { cause?: { code?: string } };
    if (cause?.cause?.code === POSTGRES_RELATION_NOT_EXIST) {
      console.log(`   ⏭️  Skipping "${name}" (table does not exist)`);
      return;
    }
    throw err;
  }
}

async function deleteAll() {
  console.log("🗑️  Deleting all data...");

  try {
    // ============================================================================
    // 0. CLEANUP - Delete all existing data
    // ============================================================================
    console.log("🧹 Cleaning up existing data...");

    // Delete in reverse order of dependencies; skip tables that don't exist
    await safeDelete(reviews, "Review");
    await safeDelete(progresses, "Progress");
    await safeDelete(appointments, "Appointment");
    await safeDelete(payments, "Payment");
    await safeDelete(payoutMethods, "Payout_Method");
    await safeDelete(paymentMethodPersons, "Payment_Method_Person");
    await safeDelete(paymentMethods, "Payment_Method");
    await safeDelete(doctorLanguages, "Doctor_Language");
    await safeDelete(doctorConditions, "Doctor_Condition");
    await safeDelete(doctorServices, "Doctor_Service");
    await safeDelete(schedules, "Schedule");
    await safeDelete(ageGroups, "Age_Group");
    await safeDelete(educations, "Education");
    await safeDelete(phones, "Phone");
    await safeDelete(doctors, "Doctor");
    await safeDelete(persons, "Person");
    await safeDelete(users, "User");
    await safeDelete(accounts, "Account");
    await safeDelete(sessions, "Session");
    await safeDelete(verifications, "Verification");
    await safeDelete(institutions, "Institution");
    await safeDelete(services, "Service");
    await safeDelete(languages, "Language");
    await safeDelete(conditions, "Condition");
    await safeDelete(places, "Place");

    console.log("✅ Cleanup complete");

    // ============================================================================
    // RESET SEQUENCES - Reset all ID sequences to start from 1
    // ============================================================================
    console.log("🔄 Resetting sequences...");

    // Dynamically find and reset all sequences for serial columns
    const sequences = await client`
      SELECT sequence_name 
      FROM information_schema.sequences 
      WHERE sequence_schema = 'public'
      AND sequence_name LIKE '%_id_seq'
    `;

    // Reset each sequence
    for (const seq of sequences) {
      const sequenceName = seq.sequence_name;
      // Use sql.raw to execute raw SQL string
      await db.execute(sql.raw(`ALTER SEQUENCE "${sequenceName}" RESTART WITH 1`));
    }

    console.log(`✅ Reset ${sequences.length} sequences`);
  } catch (error) {
    console.error("❌ Error deleting all data:", error);
    throw error;
  }
}

// Run seed function
deleteAll()
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  })
  .finally(() => {
    console.log("🏁 Delete all data script finished");
    process.exit(0);
  });
