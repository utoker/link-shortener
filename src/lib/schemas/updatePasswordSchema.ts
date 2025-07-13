import { z } from 'zod';

export const updatePasswordSchema = z
  .object({
    password: z
      .string()
      .min(6, { message: 'Password must be at least 6 characters' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });
export type UpdatePasswordFormValues = z.infer<typeof updatePasswordSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
});
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
