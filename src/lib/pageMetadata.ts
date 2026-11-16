import type { Metadata } from 'next';

// The site's share image (app/opengraph-image.png). A page that sets its own
// openGraph loses the inherited one, so it's named here.
const SHARE_IMAGE = {
  url: '/opengraph-image.png',
  width: 1200,
  height: 630,
  alt: 'reqq.cc: Shorten your links with ease. Free, fast and private.',
};

/**
 * Head tags for a page with its own title and description in search results
 * and link previews. `path` is the page's canonical path, like "/about".
 */
export function pageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    // Set in full: a page's openGraph replaces the layout's, it isn't merged.
    openGraph: {
      title,
      description,
      url: path,
      siteName: 'reqq.cc',
      type: 'website',
      images: [SHARE_IMAGE],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [SHARE_IMAGE],
    },
  };
}
