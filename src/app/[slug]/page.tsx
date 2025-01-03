import { redirect } from 'next/navigation';
import { createServerClientSupabase } from '../../lib/supabase/server';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<any>;
}

export default async function SlugPage({ params }: PageProps) {
  const resolvedParams = await params; // Await the promise for params
  const { slug } = resolvedParams; // Destructure slug after resolving params

  if (!slug) {
    console.error('Slug is undefined.');
    redirect('/404');
    return null;
  }

  if (typeof slug === 'string' && slug.startsWith('protected')) {
    return null;
  }
  if (slug === '404') {
    return null; // Prevent redirection loop for 404
  }

  // Initialize Supabase client
  const supabase = await createServerClientSupabase();

  // Fetch the shortlink
  const { data: shortlink, error } = await supabase
    .from('shortlinks')
    .select('url, click_count, id')
    .eq('slug', slug)
    .single();

  if (error || !shortlink) {
    console.error(`Error fetching shortlink for slug: ${slug}`, error);
    redirect('/404');
    return null;
  }

  const origin = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  // Prevent redirection loop for internal URLs
  const shortlinkUrl = new URL(shortlink.url);
  if (shortlinkUrl.origin === origin) {
    console.error(`Redirection loop detected for slug: ${slug}`);
    redirect('/404');
    return null;
  }

  // Increment click count
  const { error: updateError } = await supabase
    .from('shortlinks')
    .update({ click_count: (shortlink.click_count || 0) + 1 })
    .eq('id', shortlink.id);

  if (updateError) {
    console.error('Failed to update click count:', updateError.message);
  }

  // Redirect to the long URL
  redirect(shortlink.url);
  return null; // Suppress further rendering
}
