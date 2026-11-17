import { z } from 'zod';
import { isReservedSlug } from '@/lib/reservedSlugs';
import { isOwnUrl, isShortenerUrl } from '@/lib/blockedUrls';
import { ensureProtocol } from '@/lib/utils';

function hasCredentials(url: string): boolean {
  try {
    const { username, password } = new URL(url);
    return username !== '' || password !== '';
  } catch {
    return false; // not a URL: the check above has reported it
  }
}

/**
 * What to show under a URL box while it is being typed in: the first problem
 * with the text (the protocol may be left out), or '' when it is fine or empty.
 */
export function urlInputError(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';
  const parsed = CreateLinkFormSchema.shape.url.safeParse(
    ensureProtocol(trimmed),
  );
  return parsed.success ? '' : parsed.error.issues[0].message;
}

export const CreateLinkFormSchema = z.object({
  url: z
    .url({
      // Only characters a real host can have. Chrome's URL parser accepts
      // "exa mple.com" (as "exa%20mple.com") while the server's rejects it,
      // so without this the browser and the server disagree. A host needs a
      // dot too: a single word like "hello" becomes https://hello, which
      // leads nowhere. (A trailing dot and IPv6 in brackets are fine.)
      hostname: /^((?:[a-z0-9_-]+\.)+[a-z0-9_-]+\.?|\[[0-9a-f:.]+\])$/,
      error: 'Please enter a valid URL (e.g., https://example.com)',
    })
    .min(1, 'URL is required')
    // Google Safe Browsing refuses much longer URLs, and a link it can't
    // check would be created unchecked (see createLink).
    .max(2048, 'Links can be up to 2,048 characters long.')
    // "https://google.com@evil.example" reads like google.com but leads to
    // evil.example: the part before the @ is only a user name.
    .refine((url) => !hasCredentials(url), {
      error: 'Links with a user name or password in them are not allowed.',
    })
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
      error: 'Slug can only contain letters, numbers, dashes and underscores',
    })
    .refine((slug) => !isReservedSlug(slug), {
      error: 'This slug is reserved.',
    })
    .optional()
    .or(z.literal('')),
});
