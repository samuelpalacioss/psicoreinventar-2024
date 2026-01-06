import "dotenv/config";
import db from "./index";
import { payments, appointments } from "./schema";

/**
 * Mini seed: Add appointment for person 4 with doctor 2
 * Person 4: José López
 * Doctor 2: Dra. Laura Pérez (Individual Therapy service)
 */
async function seedMini() {
  console.log("🌱 Running mini seed...");

  try {
    // Create payment for the appointment
    console.log("💰 Creating payment...");
    const [payment] = await db
      .insert(payments)
      .values({
        personId: 4, // José López
        paymentMethodId: 3, // Carlos's Mastercard (from main seed)
        amount: "80.00", // Dra. Laura's rate for Individual Therapy
        date: "2026-01-07",
      })
      .returning();
    console.log(`✅ Created payment with ID: ${payment.id}`);

    // Create appointment
    console.log("📅 Creating appointment...");
    const [appointment] = await db
      .insert(appointments)
      .values({
        personId: 4, // José López
        doctorId: 2, // Dra. Laura Pérez
        doctorServiceDoctorId: 2, // Doctor 2
        doctorServiceServiceId: 1, // Individual Therapy (service ID 1)
        paymentId: payment.id,
        startDateTime: new Date("2026-01-07T14:00:00Z"),
        endDateTime: new Date("2026-01-07T14:45:00Z"),
        status: "scheduled",
        notes: "Primera sesión con nuevo paciente.",
      })
      .returning();
    console.log(`✅ Created appointment with ID: ${appointment.id}`);

    console.log("\n✨ Mini seed completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`   Payment ID: ${payment.id}`);
    console.log(`   Appointment ID: ${appointment.id}`);
    console.log(`   Person: José López (ID: 4)`);
    console.log(`   Doctor: Dra. Laura Pérez (ID: 2)`);
    console.log(`   Date: 2026-01-07 14:00 UTC`);
  } catch (error) {
    console.error("❌ Error running mini seed:", error);
    throw error;
  }
}

// Run mini seed
seedMini()
  .then(() => {
    console.log("🏁 Mini seed script finished");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
