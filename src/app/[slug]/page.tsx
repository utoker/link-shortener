import { createServerClientSupabase } from 'lib/supabase/server';
import { redirect } from 'next/navigation';

interface Props {
  params: { slug: string };
}

export default async function SlugPage({ params }: Props) {
  const { slug } = await params; // Destructure params asynchronously
  if (slug.startsWith('protected')) {
    return null;
  }
  if (slug === '404') return null; // Prevent redirection loop for 404

  // Supabase client
  const supabase = await createServerClientSupabase();

  // Fetch the shortlink
  const { data: shortlink, error } = await supabase
    .from('shortlinks')
    .select('url, click_count, id')
    .eq('slug', slug)
    .single();

  if (error || !shortlink) {
    // Redirect to 404 if slug is not found
    redirect('/404');
    return null;
  }

  const origin = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  // Prevent redirection loop for internal URLs
  const shortlinkUrl = new URL(shortlink.url);
  if (shortlinkUrl.origin === origin) {
    console.error(`Redirection loop detected for slug: ${slug}`);
    return redirect('/404'); // Redirect to 404 for redirection loops
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
