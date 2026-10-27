import { z } from 'zod';

export const signUpSchema = z
  .object({
    name: z.string().min(2, { error: 'Name is required' }),
    email: z.email({ error: 'Invalid email address' }),
    password: z
      .string()
      .min(6, { error: 'Password must be at least 6 characters' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    error: 'Passwords do not match',
  });
export type SignupFormValues = z.infer<typeof signUpSchema>;
