import { z } from 'zod';

export const signUpSchema = z
  .object({
    name: z
      .string()
      .min(1, { message: 'Please provide name' })
      .max(50, { message: 'Full name must be less than 50 characters' }),
    email: z.string().email({ message: 'Please enter a valid email address' }),
    password: z.string().min(8, { message: 'Password must be at least 8 characters long' }),
    confirmPassword: z.string().min(8, { message: 'Password must be at least 8 characters long' }),
    role: z.enum(['patient', 'doctor', 'admin']).optional(),
  })
  .refine(
    (form) => {
      return form.confirmPassword === form.password;
    },
    {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    }
  );

export type signUpType = z.infer<typeof signUpSchema>;

export const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters long' }),
});

export type loginType = z.infer<typeof loginSchema>;
