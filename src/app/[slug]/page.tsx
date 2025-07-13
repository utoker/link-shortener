import NotFound from '../404/page';

// src/app/[slug]/page.tsx
export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export default function NotFoundPage() {
  return <NotFound />;
}
