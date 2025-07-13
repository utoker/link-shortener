import { z } from 'zod';

export const CreateLinkFormSchema = z.object({
  url: z
    .string()
    .min(1, 'URL is required')
    .url('Please enter a valid URL (e.g., https://example.com)'),
  slug: z
    .string()
    .max(64, 'Slug must be 64 characters or fewer')
    .regex(/^[a-zA-Z0-9_-]*$/, {
      message:
        'Slug can only contain letters, numbers, dashes, and underscores',
    })
    .optional()
    .or(z.literal('')),
});
