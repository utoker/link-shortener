import { z } from 'zod';

export const updatePasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, { error: 'Password must be at least 8 characters' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    error: 'Passwords do not match',
  });
export type UpdatePasswordFormValues = z.infer<typeof updatePasswordSchema>;

export const forgotPasswordSchema = z.object({
  email: z.email({ error: 'Invalid email address' }),
});
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
