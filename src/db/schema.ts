import {
  pgTable,
  pgEnum,
  serial,
  varchar,
  text,
  integer,
  boolean,
  date,
  timestamp,
  time,
  decimal,
  smallint,
  primaryKey,
  check,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

// ============================================================================
// ENUMS
// ============================================================================

export const userRoleEnum = pgEnum("user_role", ["patient", "doctor", "admin"]);

export const appointmentStatusEnum = pgEnum("appointment_status", [
  "scheduled",
  "confirmed",
  "completed",
  "cancelled",
]);

export const institutionTypeEnum = pgEnum("institution_type", [
  "university",
  "hospital",
  "clinic",
  "research_center",
  "other",
]);

export const paymentMethodTypeEnum = pgEnum("payment_method_type", ["card", "pago_movil"]);

export const payoutTypeEnum = pgEnum("payout_type", ["bank_transfer", "pago_movil"]);

export const payoutStatusEnum = pgEnum("payout_status", [
  "pending",
  "processing",
  "completed",
  "failed",
]);

export const dayOfWeekEnum = pgEnum("day_of_week", [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
]);

export const conditionTypeEnum = pgEnum("condition_type", ["primary", "other"]);

export const languageTypeEnum = pgEnum("language_type", ["native", "foreign"]);

// ============================================================================
// BASE TABLES
// ============================================================================

// User
export const users = pgTable("User", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(), // Encrypted
  role: userRoleEnum("role").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Place (Based on search API)
export const places = pgTable("Place", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 100 }).notNull(), // city, state, country, etc.
});

// Institution
export const institutions = pgTable("Institution", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: institutionTypeEnum("type").notNull(),
  placeId: integer("place_id")
    .notNull()
    .references(() => places.id),
  isVerified: boolean("is_verified").default(false),
});

// Person (Patient)
export const persons = pgTable("Person", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  ci: integer("ci").notNull().unique(), // Cédula
  firstName: varchar("first_name", { length: 100 }).notNull(),
  middleName: varchar("middle_name", { length: 100 }),
  firstLastName: varchar("first_last_name", { length: 100 }).notNull(),
  secondLastName: varchar("second_last_name", { length: 100 }),
  birthDate: date("birth_date").notNull(),
  address: varchar("address", { length: 500 }).notNull(),
  placeId: integer("place_id")
    .notNull()
    .references(() => places.id),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Doctor (Therapist)
export const doctors = pgTable("Doctor", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  ci: integer("ci").notNull().unique(), // Cédula
  firstName: varchar("first_name", { length: 100 }).notNull(),
  middleName: varchar("middle_name", { length: 100 }),
  firstLastName: varchar("first_last_name", { length: 100 }).notNull(),
  secondLastName: varchar("second_last_name", { length: 100 }),
  birthDate: date("birth_date").notNull(),
  address: varchar("address", { length: 500 }).notNull(),
  placeId: integer("place_id")
    .notNull()
    .references(() => places.id),
  biography: text("biography").notNull(),
  firstSessionExpectation: text("first_session_expectation").notNull(),
  biggestStrengths: text("biggest_strengths").notNull(),
  isActive: boolean("is_active").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Phone
export const phones = pgTable(
  "Phone",
  {
    id: serial("id").primaryKey(),
    personId: integer("person_id").references(() => persons.id, { onDelete: "cascade" }),
    doctorId: integer("doctor_id").references(() => doctors.id, { onDelete: "cascade" }),
    areaCode: integer("area_code").notNull(),
    number: integer("number").notNull(),
  },
  (table) => [
    // Ensure exactly one of personId or doctorId is set, not both
    check(
      "phone_owner_check",
      sql`(${table.personId} IS NOT NULL AND ${table.doctorId} IS NULL) OR (${table.personId} IS NULL AND ${table.doctorId} IS NOT NULL)`
    ),
  ]
);

// Condition
export const conditions = pgTable("Condition", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
});

// Language
export const languages = pgTable("Language", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
});

// ============================================================================
// SERVICE-RELATED TABLES
// ============================================================================

// Service
export const services = pgTable("Service", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: varchar("description", { length: 500 }).notNull(),
  duration: integer("duration").default(45).notNull(), // In minutes
});

// Treatment Method
export const treatmentMethods = pgTable("Treatment_Method", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
});

// Age Group
export const ageGroups = pgTable("Age_Group", {
  id: serial("id").primaryKey(),
  doctorId: integer("doctor_id")
    .notNull()
    .references(() => doctors.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 50 }).notNull(), // Children, Teenagers, Adults
  minAge: integer("min_age").notNull(),
  maxAge: integer("max_age").notNull(),
});

// Education
export const educations = pgTable("Education", {
  id: serial("id").primaryKey(),
  doctorId: integer("doctor_id")
    .notNull()
    .references(() => doctors.id, { onDelete: "cascade" }),
  institutionId: integer("institution_id")
    .notNull()
    .references(() => institutions.id),
  degree: varchar("degree", { length: 100 }).notNull(), // MSc, PhD, Diploma, etc.
  specialization: varchar("specialization", { length: 255 }).notNull(), // Clinical Psychology, Psychiatry, etc.
  startYear: smallint("start_year").notNull(),
  endYear: smallint("end_year").notNull(),
});

// Progress
export const progresses = pgTable("Progress", {
  id: serial("id").primaryKey(),
  personId: integer("person_id")
    .notNull()
    .references(() => persons.id, { onDelete: "cascade" }),
  conditionId: integer("condition_id").references(() => conditions.id, { onDelete: "set null" }),
  title: varchar("title", { length: 255 }).notNull(),
  level: varchar("level", { length: 100 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Schedule
export const schedules = pgTable("Schedule", {
  id: serial("id").primaryKey(),
  doctorId: integer("doctor_id")
    .notNull()
    .references(() => doctors.id, { onDelete: "cascade" }),
  day: dayOfWeekEnum("day").notNull(),
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
});

// ============================================================================
// Many to Many TABLES
// ============================================================================

// Doctor - Service (Many-to-Many)
export const doctorServices = pgTable(
  "Doctor_Service",
  {
    doctorId: serial("doctor_id")
      .notNull()
      .references(() => doctors.id, { onDelete: "cascade" }),
    serviceId: integer("service_id")
      .notNull()
      .references(() => services.id, { onDelete: "cascade" }),
    amount: integer("amount").notNull(), // Price for this service
  },
  (table) => [primaryKey({ columns: [table.doctorId, table.serviceId] })]
);

// Doctor - Treatment Method (Many-to-Many)
export const doctorTreatmentMethods = pgTable(
  "Doctor_Treatment_Method",
  {
    doctorId: serial("doctor_id")
      .notNull()
      .references(() => doctors.id, { onDelete: "cascade" }),
    treatmentMethodId: integer("treatment_method_id")
      .notNull()
      .references(() => treatmentMethods.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.doctorId, table.treatmentMethodId] })]
);

// Doctor - Condition (Many-to-Many)
export const doctorConditions = pgTable(
  "Doctor_Condition",
  {
    doctorId: serial("doctor_id")
      .notNull()
      .references(() => doctors.id, { onDelete: "cascade" }),
    conditionId: integer("condition_id")
      .notNull()
      .references(() => conditions.id, { onDelete: "cascade" }),
    type: conditionTypeEnum("type").notNull(),
  },
  (table) => [primaryKey({ columns: [table.doctorId, table.conditionId] })]
);

// Doctor - Language (Many-to-Many)
export const doctorLanguages = pgTable(
  "Doctor_Language",
  {
    doctorId: serial("doctor_id")
      .notNull()
      .references(() => doctors.id, { onDelete: "cascade" }),
    languageId: integer("language_id")
      .notNull()
      .references(() => languages.id, { onDelete: "cascade" }),
    type: languageTypeEnum("type").notNull(),
  },
  (table) => [primaryKey({ columns: [table.doctorId, table.languageId] })]
);

// ============================================================================
// PAYMENT METHOD - SUPERTYPE WITH SUBTYPES (Single Table Inheritance)
// ============================================================================

export const paymentMethods = pgTable("Payment_Method", {
  id: serial("id").primaryKey(),
  type: paymentMethodTypeEnum("type").notNull(),

  // Card subtype fields (nullable for pago_movil)
  cardNumber: varchar("card_number", { length: 4 }), // Last 4 digits only
  cardHolderName: varchar("card_holder_name", { length: 255 }),
  cardBrand: varchar("card_brand", { length: 50 }), // Visa, Mastercard, etc.
  expirationMonth: smallint("expiration_month"),
  expirationYear: smallint("expiration_year"),

  // Pago Movil subtype fields (nullable for card)
  pagoMovilPhone: varchar("pago_movil_phone", { length: 20 }),
  pagoMovilBankCode: varchar("pago_movil_bank_code", { length: 10 }),
  pagoMovilCi: integer("pago_movil_ci"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Payment Method - Person (Association with preferences)
export const paymentMethodPersons = pgTable("Payment_Method_Person", {
  id: serial("id").primaryKey(),
  personId: integer("person_id")
    .notNull()
    .references(() => persons.id, { onDelete: "cascade" }),
  paymentMethodId: integer("payment_method_id")
    .notNull()
    .references(() => paymentMethods.id, { onDelete: "cascade" }),
  isPreferred: boolean("is_preferred").default(false),
  nickname: varchar("nickname", { length: 100 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================================================
// PAYOUT - SUPERTYPE (Single Table Inheritance)
// ============================================================================

export const payouts = pgTable("Payout", {
  id: serial("id").primaryKey(),
  doctorId: integer("doctor_id")
    .notNull()
    .references(() => doctors.id, { onDelete: "cascade" }),
  type: payoutTypeEnum("type").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: payoutStatusEnum("status").default("pending").notNull(),

  // Bank Transfer subtype fields
  bankName: varchar("bank_name", { length: 255 }),
  accountNumber: varchar("account_number", { length: 50 }),
  accountType: varchar("account_type", { length: 50 }), // checking, savings

  // Pago Movil subtype fields
  pagoMovilPhone: varchar("pago_movil_phone", { length: 20 }),
  pagoMovilBankCode: varchar("pago_movil_bank_code", { length: 10 }),
  pagoMovilCi: integer("pago_movil_ci"),

  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================================================
// APPOINTMENT & PAYMENT & RATING
// ============================================================================

// Appointment
export const appointments = pgTable("Appointment", {
  id: serial("id").primaryKey(),
  personId: integer("person_id")
    .notNull()
    .references(() => persons.id, { onDelete: "cascade" }),
  doctorId: integer("doctor_id")
    .notNull()
    .references(() => doctors.id, { onDelete: "cascade" }),
  doctorServiceDoctorId: integer("doctor_service_doctor_id").notNull(),
  doctorServiceServiceId: integer("doctor_service_service_id").notNull(),
  paymentId: integer("payment_id")
    .notNull()
    .unique()
    .references(() => payments.id),
  startDateTime: timestamp("start_date_time").notNull(),
  endDateTime: timestamp("end_date_time").notNull(),
  status: appointmentStatusEnum("status").notNull(),
  cancellationReason: text("cancellation_reason"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Payment
export const payments = pgTable("Payment", {
  id: serial("id").primaryKey(),
  personId: integer("person_id")
    .notNull()
    .references(() => persons.id, { onDelete: "cascade" }),
  paymentMethodId: serial("payment_method_id")
    .notNull()
    .references(() => paymentMethods.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  date: date("date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Review
export const reviews = pgTable("Review", {
  id: serial("id").primaryKey(),
  appointmentId: integer("appointment_id")
    .notNull()
    .unique()
    .references(() => appointments.id, { onDelete: "cascade" }),
  score: smallint("score").notNull(), // 1-5
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================================================
// RELATIONS
// ============================================================================

export const usersRelations = relations(users, ({ one }) => ({
  person: one(persons, {
    fields: [users.id],
    references: [persons.userId],
  }),
  doctor: one(doctors, {
    fields: [users.id],
    references: [doctors.userId],
  }),
}));

export const personsRelations = relations(persons, ({ one, many }) => ({
  user: one(users, {
    fields: [persons.userId],
    references: [users.id],
  }),
  place: one(places, {
    fields: [persons.placeId],
    references: [places.id],
  }),
  phones: many(phones),
  progresses: many(progresses),
  appointments: many(appointments),
  payments: many(payments),
  paymentMethodPersons: many(paymentMethodPersons),
}));

export const doctorsRelations = relations(doctors, ({ one, many }) => ({
  user: one(users, {
    fields: [doctors.userId],
    references: [users.id],
  }),
  place: one(places, {
    fields: [doctors.placeId],
    references: [places.id],
  }),
  phones: many(phones),
  educations: many(educations),
  schedules: many(schedules),
  doctorServices: many(doctorServices),
  doctorTreatmentMethods: many(doctorTreatmentMethods),
  doctorConditions: many(doctorConditions),
  doctorLanguages: many(doctorLanguages),
  ageGroups: many(ageGroups),
  appointments: many(appointments),
  payouts: many(payouts),
}));

export const phonesRelations = relations(phones, ({ one }) => ({
  person: one(persons, {
    fields: [phones.personId],
    references: [persons.id],
  }),
  doctor: one(doctors, {
    fields: [phones.doctorId],
    references: [doctors.id],
  }),
}));

export const placesRelations = relations(places, ({ many }) => ({
  persons: many(persons),
  doctors: many(doctors),
  institutions: many(institutions),
}));

export const institutionsRelations = relations(institutions, ({ one, many }) => ({
  place: one(places, {
    fields: [institutions.placeId],
    references: [places.id],
  }),
  educations: many(educations),
}));

export const servicesRelations = relations(services, ({ many }) => ({
  doctorServices: many(doctorServices),
}));

export const treatmentMethodsRelations = relations(treatmentMethods, ({ many }) => ({
  doctorTreatmentMethods: many(doctorTreatmentMethods),
}));

export const ageGroupsRelations = relations(ageGroups, ({ one }) => ({
  doctor: one(doctors, {
    fields: [ageGroups.doctorId],
    references: [doctors.id],
  }),
}));

export const educationsRelations = relations(educations, ({ one }) => ({
  doctor: one(doctors, {
    fields: [educations.doctorId],
    references: [doctors.id],
  }),
  institution: one(institutions, {
    fields: [educations.institutionId],
    references: [institutions.id],
  }),
}));

export const progressesRelations = relations(progresses, ({ one }) => ({
  person: one(persons, {
    fields: [progresses.personId],
    references: [persons.id],
  }),
  condition: one(conditions, {
    fields: [progresses.conditionId],
    references: [conditions.id],
  }),
}));

export const schedulesRelations = relations(schedules, ({ one }) => ({
  doctor: one(doctors, {
    fields: [schedules.doctorId],
    references: [doctors.id],
  }),
}));

export const doctorServicesRelations = relations(doctorServices, ({ one }) => ({
  doctor: one(doctors, {
    fields: [doctorServices.doctorId],
    references: [doctors.id],
  }),
  service: one(services, {
    fields: [doctorServices.serviceId],
    references: [services.id],
  }),
}));

export const doctorTreatmentMethodsRelations = relations(doctorTreatmentMethods, ({ one }) => ({
  doctor: one(doctors, {
    fields: [doctorTreatmentMethods.doctorId],
    references: [doctors.id],
  }),
  treatmentMethod: one(treatmentMethods, {
    fields: [doctorTreatmentMethods.treatmentMethodId],
    references: [treatmentMethods.id],
  }),
}));

export const paymentMethodsRelations = relations(paymentMethods, ({ many }) => ({
  paymentMethodPersons: many(paymentMethodPersons),
  payments: many(payments),
}));

export const paymentMethodPersonsRelations = relations(paymentMethodPersons, ({ one }) => ({
  person: one(persons, {
    fields: [paymentMethodPersons.personId],
    references: [persons.id],
  }),
  paymentMethod: one(paymentMethods, {
    fields: [paymentMethodPersons.paymentMethodId],
    references: [paymentMethods.id],
  }),
}));

export const payoutsRelations = relations(payouts, ({ one }) => ({
  doctor: one(doctors, {
    fields: [payouts.doctorId],
    references: [doctors.id],
  }),
}));

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  person: one(persons, {
    fields: [appointments.personId],
    references: [persons.id],
  }),
  doctor: one(doctors, {
    fields: [appointments.doctorId],
    references: [doctors.id],
  }),
  doctorService: one(doctorServices, {
    fields: [appointments.doctorServiceDoctorId, appointments.doctorServiceServiceId],
    references: [doctorServices.doctorId, doctorServices.serviceId],
  }),
  payment: one(payments, {
    fields: [appointments.paymentId],
    references: [payments.id],
  }),
  review: one(reviews, {
    fields: [appointments.id],
    references: [reviews.appointmentId],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  person: one(persons, {
    fields: [payments.personId],
    references: [persons.id],
  }),
  appointment: one(appointments),
  paymentMethod: one(paymentMethods, {
    fields: [payments.paymentMethodId],
    references: [paymentMethods.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  appointment: one(appointments, {
    fields: [reviews.appointmentId],
    references: [appointments.id],
  }),
}));

export const conditionsRelations = relations(conditions, ({ many }) => ({
  doctorConditions: many(doctorConditions),
  progresses: many(progresses),
}));

export const languagesRelations = relations(languages, ({ many }) => ({
  doctorLanguages: many(doctorLanguages),
}));

export const doctorConditionsRelations = relations(doctorConditions, ({ one }) => ({
  doctor: one(doctors, {
    fields: [doctorConditions.doctorId],
    references: [doctors.id],
  }),
  condition: one(conditions, {
    fields: [doctorConditions.conditionId],
    references: [conditions.id],
  }),
}));

export const doctorLanguagesRelations = relations(doctorLanguages, ({ one }) => ({
  doctor: one(doctors, {
    fields: [doctorLanguages.doctorId],
    references: [doctors.id],
  }),
  language: one(languages, {
    fields: [doctorLanguages.languageId],
    references: [languages.id],
  }),
}));
