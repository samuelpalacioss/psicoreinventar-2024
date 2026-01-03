import "dotenv/config";
import db, { client } from "./index";
import { sql } from "drizzle-orm";
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
  treatmentMethods,
  ageGroups,
  educations,
  schedules,
  doctorServices,
  doctorTreatmentMethods,
  doctorConditions,
  doctorLanguages,
  paymentMethods,
  paymentMethodPersons,
  payouts,
  appointments,
  payments,
  reviews,
  progresses,
  accounts,
  verifications,
  sessions,
} from "./schema";

async function deleteAll() {
  console.log("🌱 Seeding database...");

  try {
    // ============================================================================
    // 0. CLEANUP - Delete all existing data
    // ============================================================================
    console.log("🧹 Cleaning up existing data...");

    // Delete in reverse order of dependencies
    await db.delete(reviews);
    await db.delete(progresses);
    await db.delete(appointments);
    await db.delete(payments);
    await db.delete(payouts);
    await db.delete(paymentMethodPersons);
    await db.delete(paymentMethods);
    await db.delete(doctorLanguages);
    await db.delete(doctorConditions);
    await db.delete(doctorTreatmentMethods);
    await db.delete(doctorServices);
    await db.delete(schedules);
    await db.delete(ageGroups);
    await db.delete(educations);
    await db.delete(phones);
    await db.delete(doctors);
    await db.delete(persons);
    await db.delete(users);
    await db.delete(accounts);
    await db.delete(sessions);
    await db.delete(verifications);
    await db.delete(institutions);
    await db.delete(treatmentMethods);
    await db.delete(services);
    await db.delete(languages);
    await db.delete(conditions);
    await db.delete(places);

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
