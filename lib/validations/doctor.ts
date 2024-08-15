import { z } from 'zod';

const optionSchema = z.object({
  label: z.string(),
  value: z.string(),
});

export const doctorSignUpSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Please provide name' })
    .max(50, { message: 'Full name must be less than 50 characters' }),
  // email: z.string().email({ message: 'Please provide email' }),
  // password: z.string().min(8, { message: 'Password must have minimum 8 characters' }),
  // confirmPassword: z.string().min(8, { message: 'Password must have minimum 8 characters' }),
  // role: z.enum(['doctor']).optional(),
  // phone: z.string().min(10, { message: 'Please provide phone number' }),
  doctorExperience: z.string().min(1, { message: 'Please provide experience' }),
  doctorSpecialties: z
    .array(optionSchema)
    .nonempty({ message: 'Please provide at least one specialty' }),
  doctorEducation: z.string().min(3, { message: 'Please provide your university' }),
  // doctorLicenseNumber: z
  //   .string()
  //   .min(4, { message: 'Please provide license number' })
  //   .transform((val) => val.toUpperCase()),
  doctorGraduationYear: z
    .string()
    .min(4, { message: 'Please provide graduation year' })
    .refine(
      (value) => {
        return !isNaN(parseInt(value));
      },
      {
        message: 'Graduation year must be a valid integer',
      }
    )
    .refine(
      (value) => {
        return parseInt(value) >= 1950;
      },
      {
        message: 'Graduation year must be 1950 or later',
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
});
// .refine(
//   (form) => {
//     return form.confirmPassword === form.password;
//   },
//   {
//     message: 'Passwords do not match',
//     path: ['confirmPassword'],
//   }
// );

export type doctorSignUpType = z.infer<typeof doctorSignUpSchema>;
