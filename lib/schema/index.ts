import * as z from "zod";

const signUpBaseSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Full name must be at least 3 characters long" })
    .max(50, { message: "Full name must be less than 50 characters long" })
    .regex(/^[a-zA-Z\s]+$/, { message: "Can only contain letters and spaces" }),
  email: z.email({ message: "Invalid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters long" }),
});

// Client-side schema with confirmPassword validation
export const signUpSchema = signUpBaseSchema
  .extend({
    confirmPassword: z.string().min(8, { message: "Password must be at least 8 characters long" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Server-side schema without confirmPassword (only used in actions)
export const signUpActionSchema = signUpBaseSchema;

export type SignUpSchema = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
  email: z.email({ message: "Invalid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters long" }),
});

export type SignInSchema = z.infer<typeof signInSchema>;
