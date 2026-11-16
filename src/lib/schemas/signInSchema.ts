import { z } from 'zod';

export const signInSchema = z.object({
  email: z.email({ error: 'Invalid email address' }),
  password: z
    .string()
    .min(6, { error: 'Password must be at least 6 characters' }),
});
export type SigninFormValues = z.infer<typeof signInSchema>;
