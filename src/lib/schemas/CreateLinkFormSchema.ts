import { z } from 'zod';
import { isReservedSlug } from '@/lib/reservedSlugs';

export const CreateLinkFormSchema = z.object({
  url: z
    .url('Please enter a valid URL (e.g., https://example.com)')
    .min(1, 'URL is required'),
  slug: z
    .string()
    .max(64, 'Slug must be 64 characters or fewer')
    .regex(/^[a-zA-Z0-9_-]*$/, {
      error:
        'Slug can only contain letters, numbers, dashes, and underscores',
    })
    .refine((slug) => !isReservedSlug(slug), {
      error: 'This slug is reserved.',
    })
    .optional()
    .or(z.literal('')),
});
