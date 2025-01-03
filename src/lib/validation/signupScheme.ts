import { z } from 'zod';

export const signupSchema = z
  .object({
    name: z.string().min(2, { message: 'Name is required' }),
    email: z.string().email({ message: 'Invalid email address' }),
    password: z
      .string()
      .min(6, { message: 'Password must be at least 6 characters' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'], // This points to the error field
  });

export type SignUpFormData = z.infer<typeof signupSchema>;
