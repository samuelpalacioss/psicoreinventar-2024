import { z } from "zod";

const optionSchema = z.object({
  label: z.string(),
  value: z.string(),
});

export const doctorSignUpSchema = z
  .object({
    name: z
      .string()
      .min(1, { message: "Please provide name" })
      .max(50, { message: "Full name must be less than 50 characters" }),
    email: z.string().email({ message: "Please provide email" }),
    password: z.string().min(8, { message: "Password must have minimum 8 characters" }),
    confirmPassword: z.string().min(8, { message: "Password must have minimum 8 characters" }),
    role: z.enum(["doctor"]).optional(),
    phone: z.string().min(10, { message: "Please provide phone number" }),
    experience: z.string().min(1, { message: "Please provide experience" }),
    specialties: z.array(optionSchema).nonempty({ message: "Please provide at least one specialty" }),
    education: z.string().min(3, { message: "Please provide your university" }),
    licenseNumber: z
      .string()
      .min(4, { message: "Please provide license number" })
      .transform((val) => val.toUpperCase()),
    description: z
      .string()
      .min(400, { message: "Please provide more info about who you are" })
      .max(1000, { message: "Your description must be between 100 and 1000 characters" }),
    clientExpectations: z
      .string()
      .min(100, { message: "Please provide more info about your client expectations" })
      .max(400, { message: "Your description must be between 100 and 400 characters" }),
    treatmentMethods: z
      .string()
      .min(100, { message: "Please provide more info about your treatment methods" })
      .max(400, { message: "Your description must be between 100 and 400 characters" }),
    strengths: z
      .string()
      .min(100, { message: "Please provide more info about your main strengths" })
      .max(400, { message: "Your description must be between 100 and 400 characters" }),
    graduationYear: z
      .string()
      .min(4, { message: "Please provide graduation year" })
      .refine(
        (value) => {
          return !isNaN(parseInt(value));
        },
        {
          message: "Graduation year must be a valid integer",
        }
      )
      .refine(
        (value) => {
          return parseInt(value) >= 1950;
        },
        {
          message: "Graduation year must be 1950 or later",
        }
      )
      .refine(
        (value) => {
          return parseInt(value) <= new Date().getFullYear() - 1;
        },
        {
          message: `Graduation year must be ${new Date().getFullYear() - 1} or earlier`,
        }
      ),
  })
  .refine(
    (form) => {
      return form.confirmPassword === form.password;
    },
    {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }
  );

export type doctorSignUpType = z.infer<typeof doctorSignUpSchema>;
