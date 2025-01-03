// CreateLinkFormSchema.ts
import { z } from 'zod';

export const CreateLinkFormSchema = z.object({
  slug: z
    .string()
    .min(2, { message: 'Slug must be at least 2 characters long.' })
    .regex(/^[a-zA-Z0-9_-]+$/, {
      message:
        'Slug can only contain letters, numbers, dashes, and underscores.',
    }),
  url: z
    .string()
    .url({
      message: 'Please enter a valid URL starting with http:// or https://.',
    }),
});
