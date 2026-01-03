import "dotenv/config";
import db, { client } from "./index";
import { sql } from "drizzle-orm";
import {
  users,
  sessions,
  accounts,
  verifications,
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
} from "./schema";
import { randomUUID } from "crypto";
import { hashPassword } from "@/utils/bcrypt";

async function seed() {
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
    await db.delete(sessions);
    await db.delete(accounts);
    await db.delete(verifications);
    await db.delete(users);
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

    // ============================================================================
    // 1. PLACES (Venezuelan states and cities)
    // ============================================================================
    console.log("📍 Seeding places...");
    const placesData = await db
      .insert(places)
      .values([
        { name: "Distrito Capital", type: "state" },
        { name: "Miranda", type: "state" },
        { name: "Zulia", type: "state" },
        { name: "Carabobo", type: "state" },
        { name: "Lara", type: "state" },
      ])
      .returning();
    console.log(`✅ Created ${placesData.length} places`);

    // ============================================================================
    // 2. CONDITIONS (Mental health conditions - NO TYPE)
    // ============================================================================
    console.log("🧠 Seeding conditions...");
    const conditionsData = await db
      .insert(conditions)
      .values([
        { name: "Ansiedad" },
        { name: "Depresión" },
        { name: "Trastorno Bipolar" },
        { name: "TDAH" },
        { name: "Estrés Postraumático" },
      ])
      .returning();
    console.log(`✅ Created ${conditionsData.length} conditions`);

    // ============================================================================
    // 3. LANGUAGES (NO TYPE)
    // ============================================================================
    console.log("🗣️ Seeding languages...");
    const languagesData = await db
      .insert(languages)
      .values([
        { name: "Español" },
        { name: "Inglés" },
        { name: "Portugués" },
        { name: "Francés" },
        { name: "Italiano" },
      ])
      .returning();
    console.log(`✅ Created ${languagesData.length} languages`);

    // ============================================================================
    // 4. SERVICES (Only 3 services)
    // ============================================================================
    console.log("💼 Seeding services...");
    const servicesData = await db
      .insert(services)
      .values([
        {
          name: "Individual Therapy",
          description: "One-on-one therapy session",
          duration: 45,
        },
        {
          name: "Couples Therapy",
          description: "Therapy session for couples",
          duration: 60,
        },
        {
          name: "Teen Therapy",
          description: "Therapy session for teenagers",
          duration: 45,
        },
      ])
      .returning();
    console.log(`✅ Created ${servicesData.length} services`);

    // ============================================================================
    // 5. TREATMENT METHODS
    // ============================================================================
    console.log("🔬 Seeding treatment methods...");
    const treatmentMethodsData = await db
      .insert(treatmentMethods)
      .values([
        {
          name: "Terapia Cognitivo-Conductual (TCC)",
          description:
            "Enfoque terapéutico centrado en modificar patrones de pensamiento y comportamiento",
        },
        {
          name: "Terapia Psicodinámica",
          description: "Exploración de conflictos inconscientes y patrones relacionales",
        },
        {
          name: "Terapia Humanista",
          description: "Enfoque centrado en el crecimiento personal y la autorrealización",
        },
        {
          name: "Terapia Sistémica",
          description: "Trabajo terapéutico enfocado en sistemas familiares y relacionales",
        },
        {
          name: "EMDR",
          description: "Desensibilización y Reprocesamiento por Movimientos Oculares para trauma",
        },
      ])
      .returning();
    console.log(`✅ Created ${treatmentMethodsData.length} treatment methods`);

    // ============================================================================
    // 6. INSTITUTIONS
    // ============================================================================
    console.log("🏛️ Seeding institutions...");
    const institutionsData = await db
      .insert(institutions)
      .values([
        {
          name: "Universidad Central de Venezuela",
          type: "university",
          placeId: placesData[0].id,
          isVerified: true,
        },
        {
          name: "Universidad Católica Andrés Bello",
          type: "university",
          placeId: placesData[1].id,
          isVerified: true,
        },
        {
          name: "Universidad Metropolitana",
          type: "university",
          placeId: placesData[0].id,
          isVerified: true,
        },
      ])
      .returning();
    console.log(`✅ Created ${institutionsData.length} institutions`);

    // ============================================================================
    // 7. USERS (Patients)
    // ============================================================================
    console.log("👥 Seeding patient users...");
    const patientUsersData = await db
      .insert(users)
      .values([
        {
          id: randomUUID(),
          name: "Lua Martelli",
          email: "luamartelli@email.com",
          emailVerified: true,
          role: "patient",
        },
        {
          id: randomUUID(),
          name: "Carlos Martínez",
          email: "carlosmartinez@email.com",
          emailVerified: true,
          role: "patient",
        },
        {
          id: randomUUID(),
          name: "Ana García",
          email: "anagarcia@email.com",
          emailVerified: true,
          role: "patient",
        },
        {
          id: randomUUID(),
          name: "José López",
          email: "joselopez@email.com",
          emailVerified: true,
          role: "patient",
        },
        {
          id: randomUUID(),
          name: "Sofia Fernández",
          email: "sofiafernandez@email.com",
          emailVerified: true,
          role: "patient",
        },
      ])
      .returning();
    console.log(`✅ Created ${patientUsersData.length} patient users`);

    // Create accounts for patient users (email/password authentication)
    console.log("🔐 Creating patient accounts...");
    await db.insert(accounts).values(
      await Promise.all(
        patientUsersData.map(async (user) => ({
          id: randomUUID(),
          accountId: user.email,
          providerId: "credential",
          userId: user.id,
          password: await hashPassword("12345678"), // In production, use bcrypt
        }))
      )
    );
    console.log(`✅ Created ${patientUsersData.length} patient accounts`);

    // ============================================================================
    // 8. USERS (Doctors)
    // ============================================================================
    console.log("👨‍⚕️ Seeding doctor users...");
    const doctorUsersData = await db
      .insert(users)
      .values([
        {
          id: randomUUID(),
          name: "Dr. Roberto Sánchez",
          email: "drsanchez@psicoreinventar.com",
          emailVerified: true,
          role: "doctor",
        },
        {
          id: randomUUID(),
          name: "Dra. Laura Pérez",
          email: "draperez@psicoreinventar.com",
          emailVerified: true,
          role: "doctor",
        },
        {
          id: randomUUID(),
          name: "Dr. Miguel González",
          email: "drgonzalez@psicoreinventar.com",
          emailVerified: true,
          role: "doctor",
        },
        {
          id: randomUUID(),
          name: "Dra. Carmen Ramírez",
          email: "draramirez@psicoreinventar.com",
          emailVerified: true,
          role: "doctor",
        },
        {
          id: randomUUID(),
          name: "Dr. Fernando Torres",
          email: "drtorres@psicoreinventar.com",
          emailVerified: true,
          role: "doctor",
        },
      ])
      .returning();
    console.log(`✅ Created ${doctorUsersData.length} doctor users`);

    // Create accounts for doctor users (email/password authentication)
    console.log("🔐 Creating doctor accounts...");
    await db.insert(accounts).values(
      await Promise.all(
        doctorUsersData.map(async (user) => ({
          id: randomUUID(),
          accountId: user.email,
          providerId: "credential",
          userId: user.id,
          password: await hashPassword("12345678"), // In production, use bcrypt
        }))
      )
    );
    console.log(`✅ Created ${doctorUsersData.length} doctor accounts`);

    // ============================================================================
    // 9. USERS (Admin)
    // ============================================================================
    console.log("👑 Seeding admin user...");
    const adminUserData = await db
      .insert(users)
      .values([
        {
          id: randomUUID(),
          name: "Admin",
          email: "admin@psicoreinventar.com",
          emailVerified: true,
          role: "admin",
        },
      ])
      .returning();
    console.log(`✅ Created ${adminUserData.length} admin user`);

    // Create account for admin user (email/password authentication)
    console.log("🔐 Creating admin account...");
    await db.insert(accounts).values([
      {
        id: randomUUID(),
        accountId: adminUserData[0].email,
        providerId: "credential",
        userId: adminUserData[0].id,
        password: await hashPassword("12345678"), // In production, use bcrypt
      },
    ]);
    console.log(`✅ Created admin account`);

    // ============================================================================
    // 10. PERSONS (Patients)
    // ============================================================================
    console.log("🧑 Seeding persons (patients)...");
    const personsData = await db
      .insert(persons)
      .values([
        {
          userId: patientUsersData[0].id,
          ci: 25123456,
          firstName: "Lua",
          middleName: "Isabela",
          firstLastName: "Martelli",
          secondLastName: "Palacios",
          birthDate: "1995-03-15",
          address: "Av. Libertador, Edif. Caroni, Piso 5, Apto 5A",
          placeId: placesData[0].id,
          isActive: true,
        },
        {
          userId: patientUsersData[1].id,
          ci: 22987654,
          firstName: "Carlos",
          middleName: "Andrés",
          firstLastName: "Martínez",
          secondLastName: "Pérez",
          birthDate: "1990-07-22",
          address: "Calle Sucre, Residencias Altamira, Torre B, Piso 3",
          placeId: placesData[1].id,
          isActive: true,
        },
        {
          userId: patientUsersData[2].id,
          ci: 28456789,
          firstName: "Ana",
          middleName: "Sofía",
          firstLastName: "García",
          secondLastName: "López",
          birthDate: "1998-11-08",
          address: "Av. Principal de Las Mercedes, Edif. Empresarial, Piso 2",
          placeId: placesData[0].id,
          isActive: true,
        },
        {
          userId: patientUsersData[3].id,
          ci: 20345678,
          firstName: "José",
          middleName: "Luis",
          firstLastName: "López",
          secondLastName: "Martínez",
          birthDate: "1988-05-30",
          address: "Urbanización El Bosque, Calle 3, Casa 45",
          placeId: placesData[3].id,
          isActive: true,
        },
        {
          userId: patientUsersData[4].id,
          ci: 26789012,
          firstName: "Sofia",
          middleName: "Valentina",
          firstLastName: "Fernández",
          secondLastName: "Díaz",
          birthDate: "1996-09-12",
          address: "Av. Universidad, Residencias Santa Rosa, Apto 12C",
          placeId: placesData[4].id,
          isActive: true,
        },
      ])
      .returning();
    console.log(`✅ Created ${personsData.length} persons`);

    // ============================================================================
    // 11. DOCTORS (Therapists)
    // ============================================================================
    console.log("👨‍⚕️ Seeding doctors...");
    const doctorsData = await db
      .insert(doctors)
      .values([
        {
          userId: doctorUsersData[0].id,
          ci: 15123456,
          firstName: "Roberto",
          middleName: "José",
          firstLastName: "Sánchez",
          secondLastName: "Mora",
          birthDate: "1980-04-18",
          address: "Av. Francisco de Miranda, Torre Ejecutiva, Piso 15",
          placeId: placesData[0].id,
          biography:
            "Psicólogo clínico con más de 15 años de experiencia en el tratamiento de trastornos de ansiedad y depresión. Especializado en Terapia Cognitivo-Conductual.",
          firstSessionExpectation:
            "En nuestra primera sesión, estableceremos un espacio seguro donde podrás compartir tus preocupaciones. Hablaremos sobre tus objetivos terapéuticos y comenzaremos a trazar un plan de trabajo personalizado.",
          biggestStrengths:
            "Empatía, escucha activa y capacidad para crear un ambiente terapéutico cálido y acogedor. Experiencia sólida en técnicas cognitivo-conductuales.",
          isActive: true,
        },
        {
          userId: doctorUsersData[1].id,
          ci: 14987654,
          firstName: "Laura",
          middleName: "Patricia",
          firstLastName: "Pérez",
          secondLastName: "Castillo",
          birthDate: "1982-09-25",
          address: "Calle Real de Sabana Grande, Edif. Professional, Consultorio 8B",
          placeId: placesData[1].id,
          biography:
            "Psiquiatra especializada en trastornos del estado de ánimo y trauma. Formación en EMDR y terapia psicodinámica. Enfoque integrador y basado en evidencia.",
          firstSessionExpectation:
            "Dedicaremos tiempo a conocernos y a que me cuentes qué te trae a consulta. Realizaré una evaluación inicial comprensiva y discutiremos las opciones de tratamiento disponibles.",
          biggestStrengths:
            "Formación sólida en psicofarmacología, capacidad diagnóstica y enfoque holístico del bienestar mental.",
          isActive: true,
        },
        {
          userId: doctorUsersData[2].id,
          ci: 16345678,
          firstName: "Miguel",
          middleName: "Ángel",
          firstLastName: "González",
          secondLastName: "Ruiz",
          birthDate: "1978-12-10",
          address: "Av. Andrés Bello, Centro Médico Los Samanes, Piso 4",
          placeId: placesData[2].id,
          biography:
            "Psicólogo especializado en terapia familiar y de pareja. Más de 20 años ayudando a familias a mejorar su comunicación y resolver conflictos.",
          firstSessionExpectation:
            "En la primera sesión, todos los miembros de la familia/pareja tendrán espacio para expresar sus perspectivas. Identificaremos patrones de comunicación y estableceremos metas compartidas.",
          biggestStrengths:
            "Experiencia extensa en dinámicas familiares, neutralidad terapéutica y habilidad para facilitar conversaciones difíciles.",
          isActive: true,
        },
        {
          userId: doctorUsersData[3].id,
          ci: 17456789,
          firstName: "Carmen",
          middleName: "Elena",
          firstLastName: "Ramírez",
          secondLastName: "Silva",
          birthDate: "1985-06-03",
          address: "Urb. Las Acacias, Edif. Médico Santa Teresa, Piso 2",
          placeId: placesData[3].id,
          biography:
            "Psicóloga infantil y de adolescentes. Especializada en TDAH, ansiedad en niños y orientación a padres. Uso de técnicas lúdicas y creativas.",
          firstSessionExpectation:
            "La primera sesión incluirá una entrevista con los padres y un primer acercamiento con el niño/adolescente en un ambiente relajado. Utilizaremos juegos y actividades para establecer rapport.",
          biggestStrengths:
            "Conexión natural con niños y adolescentes, creatividad terapéutica y capacidad para involucrar a las familias en el proceso.",
          isActive: true,
        },
        {
          userId: doctorUsersData[4].id,
          ci: 18567890,
          firstName: "Fernando",
          middleName: "Alberto",
          firstLastName: "Torres",
          secondLastName: "Méndez",
          birthDate: "1983-02-14",
          address: "Av. Principal de La Castellana, Torre Profesional, Piso 10",
          placeId: placesData[4].id,
          biography:
            "Psicólogo clínico con formación en terapia humanista-existencial. Enfoque en el desarrollo personal, crisis existenciales y búsqueda de sentido.",
          firstSessionExpectation:
            "Exploraremos juntos qué te motiva a buscar terapia. Desde el primer momento, te invitaré a ser protagonista de tu proceso, con respeto profundo por tu experiencia única.",
          biggestStrengths:
            "Enfoque centrado en la persona, profundidad en la reflexión existencial y acompañamiento respetuoso en procesos de autoconocimiento.",
          isActive: true,
        },
      ])
      .returning();
    console.log(`✅ Created ${doctorsData.length} doctors`);

    // ============================================================================
    // 12. PHONES (Patient phones)
    // ============================================================================
    console.log("📞 Seeding patient phones...");
    const patientPhonesData = await db
      .insert(phones)
      .values([
        { personId: personsData[0].id, doctorId: null, areaCode: 424, number: 5551234 },
        { personId: personsData[1].id, doctorId: null, areaCode: 412, number: 5555678 },
        { personId: personsData[2].id, doctorId: null, areaCode: 414, number: 5559012 },
        { personId: personsData[3].id, doctorId: null, areaCode: 424, number: 5553456 },
        { personId: personsData[4].id, doctorId: null, areaCode: 412, number: 5557890 },
      ])
      .returning();
    console.log(`✅ Created ${patientPhonesData.length} patient phones`);

    // ============================================================================
    // 13. PHONES (Doctor phones)
    // ============================================================================
    console.log("📞 Seeding doctor phones...");
    const doctorPhonesData = await db
      .insert(phones)
      .values([
        { personId: null, doctorId: doctorsData[0].id, areaCode: 414, number: 9871234 },
        { personId: null, doctorId: doctorsData[1].id, areaCode: 424, number: 9875678 },
        { personId: null, doctorId: doctorsData[2].id, areaCode: 412, number: 9879012 },
        { personId: null, doctorId: doctorsData[3].id, areaCode: 424, number: 9873456 },
        { personId: null, doctorId: doctorsData[4].id, areaCode: 424, number: 9877890 },
      ])
      .returning();
    console.log(`✅ Created ${doctorPhonesData.length} doctor phones`);

    // ============================================================================
    // 14. EDUCATIONS
    // ============================================================================
    console.log("🎓 Seeding educations...");
    const educationsData = await db
      .insert(educations)
      .values([
        {
          doctorId: doctorsData[0].id,
          institutionId: institutionsData[0].id,
          degree: "Licenciatura",
          specialization: "Psicología Clínica",
          startYear: 1998,
          endYear: 2003,
        },
        {
          doctorId: doctorsData[0].id,
          institutionId: institutionsData[1].id,
          degree: "Maestría",
          specialization: "Terapia Cognitivo-Conductual",
          startYear: 2004,
          endYear: 2007,
        },
        {
          doctorId: doctorsData[1].id,
          institutionId: institutionsData[1].id,
          degree: "Doctorado",
          specialization: "Psiquiatría",
          startYear: 2000,
          endYear: 2008,
        },
        {
          doctorId: doctorsData[2].id,
          institutionId: institutionsData[0].id,
          degree: "Maestría",
          specialization: "Terapia Familiar",
          startYear: 1996,
          endYear: 2001,
        },
        {
          doctorId: doctorsData[3].id,
          institutionId: institutionsData[1].id,
          degree: "Especialización",
          specialization: "Psicología Infantil",
          startYear: 2003,
          endYear: 2008,
        },
        {
          doctorId: doctorsData[4].id,
          institutionId: institutionsData[2].id,
          degree: "Maestría",
          specialization: "Psicología Humanista",
          startYear: 2001,
          endYear: 2006,
        },
      ])
      .returning();
    console.log(`✅ Created ${educationsData.length} educations`);

    // ============================================================================
    // 15. SCHEDULES
    // ============================================================================
    console.log("📅 Seeding schedules...");
    const schedulesData = await db
      .insert(schedules)
      .values([
        {
          doctorId: doctorsData[0].id,
          day: "monday",
          startTime: "09:00:00",
          endTime: "13:00:00",
        },
        {
          doctorId: doctorsData[0].id,
          day: "wednesday",
          startTime: "14:00:00",
          endTime: "18:00:00",
        },
        {
          doctorId: doctorsData[1].id,
          day: "tuesday",
          startTime: "08:00:00",
          endTime: "12:00:00",
        },
        {
          doctorId: doctorsData[2].id,
          day: "friday",
          startTime: "15:00:00",
          endTime: "19:00:00",
        },
        {
          doctorId: doctorsData[3].id,
          day: "thursday",
          startTime: "10:00:00",
          endTime: "14:00:00",
        },
      ])
      .returning();
    console.log(`✅ Created ${schedulesData.length} schedules`);

    // ============================================================================
    // 16. AGE GROUPS
    // ============================================================================
    console.log("👶 Seeding age groups...");
    const ageGroupsData = await db
      .insert(ageGroups)
      .values([
        { doctorId: doctorsData[0].id, name: "Adultos", minAge: 18, maxAge: 65 },
        { doctorId: doctorsData[0].id, name: "Adolescentes", minAge: 13, maxAge: 17 },
        { doctorId: doctorsData[1].id, name: "Adultos", minAge: 25, maxAge: 45 },
        { doctorId: doctorsData[2].id, name: "Parejas", minAge: 15, maxAge: 60 },
        { doctorId: doctorsData[3].id, name: "Niños", minAge: 6, maxAge: 12 },
        {
          doctorId: doctorsData[3].id,
          name: "Adolescentes",
          minAge: 13,
          maxAge: 17,
        },
      ])
      .returning();
    console.log(`✅ Created ${ageGroupsData.length} age groups`);

    // ============================================================================
    // 17. DOCTOR SERVICES (Many-to-Many)
    // ============================================================================
    console.log("💼 Seeding doctor services...");
    const doctorServicesData = await db
      .insert(doctorServices)
      .values([
        {
          doctorId: doctorsData[0].id,
          serviceId: servicesData[0].id, // Individual Therapy
          amount: 50,
        },
        {
          doctorId: doctorsData[0].id,
          serviceId: servicesData[1].id, // Couples Therapy
          amount: 75,
        },
        {
          doctorId: doctorsData[0].id,
          serviceId: servicesData[2].id, // Teen Therapy
          amount: 50,
        },
        {
          doctorId: doctorsData[1].id,
          serviceId: servicesData[0].id, // Individual Therapy
          amount: 80,
        },
        {
          doctorId: doctorsData[2].id,
          serviceId: servicesData[1].id, // Couples Therapy
          amount: 100,
        },
        {
          doctorId: doctorsData[3].id,
          serviceId: servicesData[2].id, // Teen Therapy
          amount: 60,
        },
        {
          doctorId: doctorsData[4].id,
          serviceId: servicesData[0].id, // Individual Therapy
          amount: 70,
        },
      ])
      .returning();
    console.log(`✅ Created ${doctorServicesData.length} doctor services`);

    // ============================================================================
    // 18. DOCTOR TREATMENT METHODS (Many-to-Many)
    // ============================================================================
    console.log("🔬 Seeding doctor treatment methods...");
    await db.insert(doctorTreatmentMethods).values([
      {
        doctorId: doctorsData[0].id,
        treatmentMethodId: treatmentMethodsData[0].id, // TCC
      },
      {
        doctorId: doctorsData[0].id,
        treatmentMethodId: treatmentMethodsData[1].id, // Terapia Psicodinámica
      },
      {
        doctorId: doctorsData[0].id,
        treatmentMethodId: treatmentMethodsData[2].id, // Terapia Humanista
      },
      {
        doctorId: doctorsData[1].id,
        treatmentMethodId: treatmentMethodsData[4].id,
      },
      {
        doctorId: doctorsData[2].id,
        treatmentMethodId: treatmentMethodsData[3].id,
      },
      {
        doctorId: doctorsData[3].id,
        treatmentMethodId: treatmentMethodsData[0].id,
      },
      {
        doctorId: doctorsData[4].id,
        treatmentMethodId: treatmentMethodsData[2].id,
      },
    ]);
    console.log("✅ Created doctor treatment methods");

    // ============================================================================
    // 19. DOCTOR CONDITIONS (Many-to-Many with type: primary/other)
    // ============================================================================
    console.log("🧠 Seeding doctor conditions...");
    await db.insert(doctorConditions).values([
      // Doctor 0 (Roberto - TCC, anxiety/depression specialist) - 3 primary, 2 other
      { doctorId: doctorsData[0].id, conditionId: conditionsData[0].id, type: "primary" }, // Ansiedad
      { doctorId: doctorsData[0].id, conditionId: conditionsData[1].id, type: "primary" }, // Depresión
      { doctorId: doctorsData[0].id, conditionId: conditionsData[4].id, type: "primary" }, // Estrés Postraumático
      { doctorId: doctorsData[0].id, conditionId: conditionsData[2].id, type: "other" }, // Trastorno Bipolar
      { doctorId: doctorsData[0].id, conditionId: conditionsData[3].id, type: "other" }, // TDAH

      // Doctor 1 (Laura - Psychiatrist, EMDR, mood disorders) - 3 primary, 2 other
      { doctorId: doctorsData[1].id, conditionId: conditionsData[1].id, type: "primary" }, // Depresión
      { doctorId: doctorsData[1].id, conditionId: conditionsData[2].id, type: "primary" }, // Trastorno Bipolar
      { doctorId: doctorsData[1].id, conditionId: conditionsData[4].id, type: "primary" }, // Estrés Postraumático
      { doctorId: doctorsData[1].id, conditionId: conditionsData[0].id, type: "other" }, // Ansiedad
      { doctorId: doctorsData[1].id, conditionId: conditionsData[3].id, type: "other" }, // TDAH

      // Doctor 2 (Miguel - Family therapy) - 3 primary, 2 other
      { doctorId: doctorsData[2].id, conditionId: conditionsData[1].id, type: "primary" }, // Depresión
      { doctorId: doctorsData[2].id, conditionId: conditionsData[0].id, type: "primary" }, // Ansiedad
      { doctorId: doctorsData[2].id, conditionId: conditionsData[2].id, type: "primary" }, // Trastorno Bipolar
      { doctorId: doctorsData[2].id, conditionId: conditionsData[4].id, type: "other" }, // Estrés Postraumático
      { doctorId: doctorsData[2].id, conditionId: conditionsData[3].id, type: "other" }, // TDAH

      // Doctor 3 (Carmen - Child/adolescent, TDAH specialist) - 3 primary, 2 other
      { doctorId: doctorsData[3].id, conditionId: conditionsData[3].id, type: "primary" }, // TDAH
      { doctorId: doctorsData[3].id, conditionId: conditionsData[0].id, type: "primary" }, // Ansiedad
      { doctorId: doctorsData[3].id, conditionId: conditionsData[1].id, type: "primary" }, // Depresión
      { doctorId: doctorsData[3].id, conditionId: conditionsData[2].id, type: "other" }, // Trastorno Bipolar
      { doctorId: doctorsData[3].id, conditionId: conditionsData[4].id, type: "other" }, // Estrés Postraumático

      // Doctor 4 (Fernando - Humanist, existential) - 3 primary, 2 other
      { doctorId: doctorsData[4].id, conditionId: conditionsData[0].id, type: "primary" }, // Ansiedad
      { doctorId: doctorsData[4].id, conditionId: conditionsData[1].id, type: "primary" }, // Depresión
      { doctorId: doctorsData[4].id, conditionId: conditionsData[4].id, type: "primary" }, // Estrés Postraumático
      { doctorId: doctorsData[4].id, conditionId: conditionsData[2].id, type: "other" }, // Trastorno Bipolar
      { doctorId: doctorsData[4].id, conditionId: conditionsData[3].id, type: "other" }, // TDAH
    ]);
    console.log("✅ Created doctor conditions");

    // ============================================================================
    // 20. DOCTOR LANGUAGES (Many-to-Many with type: native/foreign)
    // ============================================================================
    console.log("🗣️ Seeding doctor languages...");
    await db.insert(doctorLanguages).values([
      { doctorId: doctorsData[0].id, languageId: languagesData[0].id, type: "native" },
      { doctorId: doctorsData[0].id, languageId: languagesData[1].id, type: "foreign" },
      { doctorId: doctorsData[1].id, languageId: languagesData[0].id, type: "native" },
      { doctorId: doctorsData[2].id, languageId: languagesData[0].id, type: "native" },
      { doctorId: doctorsData[3].id, languageId: languagesData[0].id, type: "native" },
      { doctorId: doctorsData[4].id, languageId: languagesData[0].id, type: "native" },
      { doctorId: doctorsData[4].id, languageId: languagesData[1].id, type: "foreign" },
    ]);
    console.log("✅ Created doctor languages");

    // ============================================================================
    // 21. PAYMENT METHODS
    // ============================================================================
    console.log("💳 Seeding payment methods...");
    const paymentMethodsData = await db
      .insert(paymentMethods)
      .values([
        {
          type: "card",
          cardNumber: "4242",
          cardHolderName: "Lua Martelli",
          cardBrand: "Visa",
          expirationMonth: 12,
          expirationYear: 2027,
          pagoMovilPhone: null,
          pagoMovilBankCode: null,
          pagoMovilCi: null,
        },
        {
          type: "pago_movil",
          cardNumber: null,
          cardHolderName: null,
          cardBrand: null,
          expirationMonth: null,
          expirationYear: null,
          pagoMovilPhone: "04125551234",
          pagoMovilBankCode: "0102",
          pagoMovilCi: 25123456,
        },
        {
          type: "card",
          cardNumber: "5555",
          cardHolderName: "Carlos Martínez",
          cardBrand: "Mastercard",
          expirationMonth: 6,
          expirationYear: 2027,
          pagoMovilPhone: null,
          pagoMovilBankCode: null,
          pagoMovilCi: null,
        },
        {
          type: "pago_movil",
          cardNumber: null,
          cardHolderName: null,
          cardBrand: null,
          expirationMonth: null,
          expirationYear: null,
          pagoMovilPhone: "04145555678",
          pagoMovilBankCode: "0108",
          pagoMovilCi: 22987654,
        },
        {
          type: "card",
          cardNumber: "3782",
          cardHolderName: "Ana García",
          cardBrand: "American Express",
          expirationMonth: 9,
          expirationYear: 2025,
          pagoMovilPhone: null,
          pagoMovilBankCode: null,
          pagoMovilCi: null,
        },
      ])
      .returning();
    console.log(`✅ Created ${paymentMethodsData.length} payment methods`);

    // ============================================================================
    // 22. PAYMENT METHOD PERSONS
    // ============================================================================
    console.log("🔗 Seeding payment method persons...");
    const paymentMethodPersonsData = await db
      .insert(paymentMethodPersons)
      .values([
        {
          personId: personsData[0].id,
          paymentMethodId: paymentMethodsData[0].id,
          isPreferred: true,
          nickname: "Visa Principal",
        },
        {
          personId: personsData[0].id,
          paymentMethodId: paymentMethodsData[1].id,
          isPreferred: false,
          nickname: "Pago Móvil Banesco",
        },
        {
          personId: personsData[1].id,
          paymentMethodId: paymentMethodsData[2].id,
          isPreferred: true,
          nickname: "Mastercard Personal",
        },
        {
          personId: personsData[1].id,
          paymentMethodId: paymentMethodsData[3].id,
          isPreferred: false,
          nickname: "Pago Móvil Provincial",
        },
        {
          personId: personsData[2].id,
          paymentMethodId: paymentMethodsData[4].id,
          isPreferred: true,
          nickname: "Amex",
        },
      ])
      .returning();
    console.log(`✅ Created ${paymentMethodPersonsData.length} payment method persons`);

    // ============================================================================
    // 23. PAYMENTS
    // ============================================================================
    console.log("💰 Seeding payments...");
    const paymentsData = await db
      .insert(payments)
      .values([
        {
          personId: personsData[0].id,
          paymentMethodId: paymentMethodsData[0].id,
          amount: "50.00",
          date: "2025-12-15",
        },
        {
          personId: personsData[1].id,
          paymentMethodId: paymentMethodsData[2].id,
          amount: "80.00",
          date: "2025-12-16",
        },
        {
          personId: personsData[2].id,
          paymentMethodId: paymentMethodsData[4].id,
          amount: "100.00",
          date: "2025-12-17",
        },
        {
          personId: personsData[0].id,
          paymentMethodId: paymentMethodsData[1].id,
          amount: "50.00",
          date: "2025-12-20",
        },
        {
          personId: personsData[3].id,
          paymentMethodId: paymentMethodsData[3].id,
          amount: "60.00",
          date: "2025-12-22",
        },
        {
          personId: personsData[0].id,
          paymentMethodId: paymentMethodsData[0].id,
          amount: "50.00",
          date: "2025-12-22",
        },
      ])
      .returning();
    console.log(`✅ Created ${paymentsData.length} payments`);

    // ============================================================================
    // 24. APPOINTMENTS
    // ============================================================================
    console.log("📅 Seeding appointments...");
    const appointmentsData = await db
      .insert(appointments)
      .values([
        {
          personId: personsData[0].id,
          doctorId: doctorsData[0].id,
          doctorServiceDoctorId: doctorServicesData[0].doctorId,
          doctorServiceServiceId: doctorServicesData[0].serviceId,
          paymentId: paymentsData[0].id,
          startDateTime: new Date("2025-12-15T09:00:00Z"),
          endDateTime: new Date("2025-12-15T09:45:00Z"),
          status: "completed",
          notes: "Primera sesión. Paciente se mostró receptivo.",
        },
        {
          personId: personsData[1].id,
          doctorId: doctorsData[1].id,
          doctorServiceDoctorId: doctorServicesData[1].doctorId,
          doctorServiceServiceId: doctorServicesData[1].serviceId,
          paymentId: paymentsData[1].id,
          startDateTime: new Date("2025-12-16T14:00:00Z"),
          endDateTime: new Date("2025-12-16T14:45:00Z"),
          status: "completed",
          notes: "Evaluación inicial completada.",
        },
        {
          personId: personsData[2].id,
          doctorId: doctorsData[2].id,
          doctorServiceDoctorId: doctorServicesData[2].doctorId,
          doctorServiceServiceId: doctorServicesData[2].serviceId,
          paymentId: paymentsData[2].id,
          startDateTime: new Date("2025-12-17T15:00:00Z"),
          endDateTime: new Date("2025-12-17T16:00:00Z"),
          status: "completed",
          notes: "Terapia de pareja. Buen avance en comunicación.",
        },
        {
          personId: personsData[0].id,
          doctorId: doctorsData[0].id,
          doctorServiceDoctorId: doctorServicesData[0].doctorId,
          doctorServiceServiceId: doctorServicesData[0].serviceId,
          paymentId: paymentsData[5].id,
          startDateTime: new Date("2025-12-22T10:00:00Z"),
          endDateTime: new Date("2025-12-22T10:45:00Z"),
          status: "completed",
          notes: "Segunda sesión. Buen progreso en manejo de ansiedad.",
        },
        {
          personId: personsData[0].id,
          doctorId: doctorsData[0].id,
          doctorServiceDoctorId: doctorServicesData[0].doctorId,
          doctorServiceServiceId: doctorServicesData[0].serviceId,
          paymentId: paymentsData[3].id,
          startDateTime: new Date("2026-01-05T10:00:00Z"),
          endDateTime: new Date("2026-01-05T10:45:00Z"),
          status: "scheduled",
        },
        {
          personId: personsData[3].id,
          doctorId: doctorsData[3].id,
          doctorServiceDoctorId: doctorServicesData[5].doctorId,
          doctorServiceServiceId: doctorServicesData[5].serviceId,
          paymentId: paymentsData[4].id,
          startDateTime: new Date("2026-01-10T11:00:00Z"),
          endDateTime: new Date("2026-01-10T11:45:00Z"),
          status: "cancelled",
          cancellationReason: "Hubo un problema a ultimo minuto",
        },
      ])
      .returning();
    console.log(`✅ Created ${appointmentsData.length} appointments`);

    // ============================================================================
    // 25. REVIEWS
    // ============================================================================
    console.log("⭐ Seeding reviews...");
    const reviewsData = await db
      .insert(reviews)
      .values([
        {
          appointmentId: appointmentsData[0].id,
          score: 5,
          description:
            "Excelente profesional. Me sentí escuchada y comprendida desde el primer momento.",
        },
        {
          appointmentId: appointmentsData[1].id,
          score: 5,
          description: "Muy profesional y empática. La evaluación fue exhaustiva y clara.",
        },
        {
          appointmentId: appointmentsData[2].id,
          score: 4,
          description: "Buena sesión. Nos ayudó a identificar patrones que no veíamos antes.",
        },
        {
          appointmentId: appointmentsData[3].id,
          score: 5,
          description:
            "Seguimiento excelente. El progreso ha sido notable gracias a las técnicas que me enseñó.",
        },
      ])
      .returning();
    console.log(`✅ Created ${reviewsData.length} reviews`);

    // ============================================================================
    // 26. PROGRESSES
    // ============================================================================
    console.log("📈 Seeding progresses...");
    const progressesData = await db
      .insert(progresses)
      .values([
        {
          personId: personsData[0].id,
          conditionId: conditionsData[0].id,
          title: "Manejo de ansiedad",
          level: "Mejora significativa",
          notes:
            "Ha aprendido técnicas de respiración y está implementándolas en situaciones de estrés.",
        },
        {
          personId: personsData[1].id,
          conditionId: conditionsData[1].id,
          title: "Estado de ánimo",
          level: "Estable",
          notes: "Mayor consistencia en el estado de ánimo. Continúa con rutina de ejercicio.",
        },
        {
          personId: personsData[2].id,
          conditionId: conditionsData[2].id,
          title: "Regulación emocional",
          level: "En progreso",
          notes: "Trabajando en identificación de triggers y patrones de sueño.",
        },
        {
          personId: personsData[0].id,
          conditionId: conditionsData[0].id,
          title: "Exposición gradual",
          level: "Iniciando",
          notes: "Comenzando ejercicios de exposición a situaciones que generan ansiedad.",
        },
        {
          personId: personsData[3].id,
          conditionId: conditionsData[3].id,
          title: "Atención y concentración",
          level: "Mejora moderada",
          notes: "Implementando estrategias de organización y técnicas de estudio adaptadas.",
        },
      ])
      .returning();
    console.log(`✅ Created ${progressesData.length} progresses`);

    // ============================================================================
    // 27. PAYOUTS
    // ============================================================================
    console.log("💸 Seeding payouts...");
    const payoutsData = await db
      .insert(payouts)
      .values([
        {
          doctorId: doctorsData[0].id,
          type: "bank_transfer",
          amount: "450.00",
          status: "completed",
          bankName: "Banco de Venezuela",
          accountNumber: "01020123456789012345",
          accountType: "checking",
          processedAt: new Date("2025-12-31T10:00:00Z"),
        },
        {
          doctorId: doctorsData[0].id,
          type: "pago_movil",
          amount: "350.00",
          status: "completed",
          pagoMovilPhone: "04149871234",
          pagoMovilBankCode: "0102",
          pagoMovilCi: 15123456,
          processedAt: new Date("2025-11-30T10:00:00Z"),
        },
        {
          doctorId: doctorsData[1].id,
          type: "pago_movil",
          amount: "720.00",
          status: "completed",
          pagoMovilPhone: "04129871234",
          pagoMovilBankCode: "0102",
          pagoMovilCi: 14987654,
          processedAt: new Date("2025-12-31T11:00:00Z"),
        },
        {
          doctorId: doctorsData[2].id,
          type: "bank_transfer",
          amount: "900.00",
          status: "processing",
          bankName: "Banesco",
          accountNumber: "01340987654321098765",
          accountType: "savings",
        },
        {
          doctorId: doctorsData[3].id,
          type: "pago_movil",
          amount: "540.00",
          status: "pending",
          pagoMovilPhone: "04149873456",
          pagoMovilBankCode: "0108",
          pagoMovilCi: 17456789,
        },
        {
          doctorId: doctorsData[4].id,
          type: "bank_transfer",
          amount: "630.00",
          status: "completed",
          bankName: "Mercantil",
          accountNumber: "01050123987654321098",
          accountType: "checking",
          processedAt: new Date("2025-12-30T15:00:00Z"),
        },
      ])
      .returning();
    console.log(`✅ Created ${payoutsData.length} payouts`);

    console.log("\n✨ Database seeding completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`   Places: ${placesData.length}`);
    console.log(`   Conditions: ${conditionsData.length}`);
    console.log(`   Languages: ${languagesData.length}`);
    console.log(`   Services: ${servicesData.length}`);
    console.log(`   Treatment Methods: ${treatmentMethodsData.length}`);
    console.log(`   Institutions: ${institutionsData.length}`);
    console.log(`   Users (Patients): ${patientUsersData.length}`);
    console.log(`   Users (Doctors): ${doctorUsersData.length}`);
    console.log(`   Users (Admin): ${adminUserData.length}`);
    console.log(`   Persons: ${personsData.length}`);
    console.log(`   Doctors: ${doctorsData.length}`);
    console.log(`   Phones: ${patientPhonesData.length + doctorPhonesData.length}`);
    console.log(`   Educations: ${educationsData.length}`);
    console.log(`   Schedules: ${schedulesData.length}`);
    console.log(`   Age Groups: ${ageGroupsData.length}`);
    console.log(`   Doctor Services: ${doctorServicesData.length}`);
    console.log(`   Payment Methods: ${paymentMethodsData.length}`);
    console.log(`   Payment Method Persons: ${paymentMethodPersonsData.length}`);
    console.log(`   Payments: ${paymentsData.length}`);
    console.log(`   Appointments: ${appointmentsData.length}`);
    console.log(`   Reviews: ${reviewsData.length}`);
    console.log(`   Progresses: ${progressesData.length}`);
    console.log(`   Payouts: ${payoutsData.length}`);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

// Run seed function
seed()
  .then(() => {
    console.log("🏁 Seed script finished");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
