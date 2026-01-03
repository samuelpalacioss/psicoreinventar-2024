import { z } from "zod";

export const intakeSchema = z.object({
  // Step 1 - Getting Started
  therapyType: z.enum(["individual", "couples", "teen", "family"], {
    message: "Please select a therapy type",
  }),
  concerns: z.array(z.string()).min(1, "Select at least one concern"),
  otherConcern: z.string().optional(),

  // Step 2 - How You Feel (PHQ-4)
  phq4: z.object({
    interest: z.number().min(0).max(3),
    depressed: z.number().min(0).max(3),
    anxious: z.number().min(0).max(3),
    worry: z.number().min(0).max(3),
  }),
  physicalHealth: z.enum(["excellent", "good", "fair", "poor"]),
  supportSystem: z.enum(["strong", "some", "limited", "isolated"]),
  previousTherapy: z.enum(["yes-helpful", "yes-not-helpful", "no"]),

  // Step 3 - Your Preferences
  gender: z.string().min(1, "Please select your gender"),
  therapistGender: z.string().optional(),
  religion: z
    .object({
      value: z.string(),
      importance: z.enum(["not", "somewhat", "very"]),
    })
    .optional(),
  lgbtqAffirming: z.enum(["yes", "preferred", "no-preference"]).optional(),
  culturalImportance: z.enum(["yes", "somewhat", "not"]).optional(),
  language: z.string().default("english"),

  // Step 4 - Logistics
  paymentMethod: z.enum(["insurance", "out-of-pocket", "sliding-scale"]),
  insuranceProvider: z.string().optional(),
  sessionFormat: z.enum(["virtual", "in-person", "either"]),
  zipCode: z.string().optional(),
  availability: z.array(z.string()).min(1, "Select at least one time slot"),
  timeline: z.enum(["asap", "2-3-weeks", "flexible", "exploring"]),

  // Step 5 - Contact Info & Registration
  fullName: z
    .string()
    .min(2, "Please enter your full name")
    .refine((name) => name.trim().includes(" "), {
      message: "Please enter your first and last name",
    }),
  email: z.string().email("Please enter a valid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8),
  consentResults: z.literal(true, {
    message: "You must consent to receive results",
  }),
  consentNewsletter: z.boolean().optional(),
  consentTerms: z.literal(true, {
    message: "You must agree to the terms",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type IntakeFormData = z.infer<typeof intakeSchema>;

// Fields per step for validation (14 micro-steps)
export const stepFields: Record<number, (keyof IntakeFormData)[]> = {
  0: ["therapyType"],                    // Therapy Type
  1: ["concerns"],                        // Concerns
  2: ["phq4"],                            // PHQ-4 Questions
  3: ["physicalHealth", "supportSystem"], // Health & Support
  4: ["previousTherapy"],                 // Previous Therapy
  5: ["gender"],                          // Your Gender
  6: [],                                  // Therapist Preferences (optional)
  7: [],                                  // Cultural (optional)
  8: ["paymentMethod"],                   // Payment
  9: ["sessionFormat"],                   // Session Format
  10: ["availability"],                   // Availability
  11: ["timeline"],                       // Timeline
  12: ["fullName", "email", "password", "confirmPassword"], // Registration
  13: ["consentResults", "consentTerms"], // Consents
};

// Helper to split full name into first/last
export function splitFullName(fullName: string): {
  firstName: string;
  lastName: string;
} {
  const parts = fullName.trim().split(/\s+/);
  const firstName = parts[0] || "";
  const lastName = parts.slice(1).join(" ") || "";
  return { firstName, lastName };
}
