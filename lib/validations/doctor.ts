import { z } from 'zod';

export const doctorSignUpSchema = z
  .object({
    name: z
      .string()
      .min(1, { message: 'Please provide name' })
      .max(50, { message: 'Full name must be less than 50 characters' }),
    email: z.string().email({ message: 'Please provide email' }),
    password: z.string().min(8, { message: 'Password must have minimum 8 characters' }),
    confirmPassword: z.string().min(8, { message: 'Password must have minimum 8 characters' }),
    role: z.enum(['doctor']).optional(),
    phone: z.string().min(10, { message: 'Please provide phone number' }),
    doctorExperience: z.string().min(1, { message: 'Please provide experience' }),
    doctorSpecialties: z
      .array(z.string().min(1, { message: 'Please provide specialty' }))
      .nonempty({ message: 'Please provide at least one specialty' }),
    doctorEducation: z.string().min(5, { message: 'Please provide education' }),
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

export type doctorSignUpType = z.infer<typeof doctorSignUpSchema>;
