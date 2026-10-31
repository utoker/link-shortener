import { z } from 'zod';
import { isReservedSlug } from '@/lib/reservedSlugs';
import { isOwnUrl, isShortenerUrl } from '@/lib/blockedUrls';

export const CreateLinkFormSchema = z.object({
  url: z
    .url({
      // Only characters a real host can have. Chrome's URL parser accepts
      // "exa mple.com" (as "exa%20mple.com") while the server's rejects it,
      // so without this the browser and the server disagree.
      hostname: /^([a-z0-9_.-]+|\[[0-9a-f:.]+\])$/,
      error: 'Please enter a valid URL (e.g., https://example.com)',
    })
    .min(1, 'URL is required')
    .refine((url) => !isOwnUrl(url), {
      error: 'That is already a reqq.cc link.',
    })
    .refine((url) => !isShortenerUrl(url), {
      error:
        'Links to other URL shorteners are not allowed. Use the full destination link.',
    }),
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
