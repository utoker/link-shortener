'use server';

import { revalidatePath } from 'next/cache';
import { createServerClientSupabase } from '../../lib/supabase/server';
import { CreateShortlinkState, Shortlink } from '../../lib/types';

async function getCurrentUser() {
  const supabase = await createServerClientSupabase();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) {
    console.error('Error fetching user:', error.message);
    return null;
  }
  return user;
}

function isUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch (_) {
    return false;
  }
}

async function generateUniqueSlug(
  supabase: any,
  length: number = 6,
): Promise<string> {
  // Include letters, numbers
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let attempts = 0;
  const maxAttempts = 5;

  while (attempts < maxAttempts) {
    // Generate initial random characters
    let randomSlug = '';

    // Ensure first character is alphanumeric
    randomSlug += 'abcdefghijklmnopqrstuvwxyz0123456789'[
      Math.floor(Math.random() * 36)
    ];

    // Generate remaining characters
    randomSlug += Array.from(
      { length: length - 1 },
      () => chars[Math.floor(Math.random() * chars.length)],
    ).join('');

    const { data: existingSlug } = await supabase
      .from('shortlinks')
      .select('id')
      .eq('slug', randomSlug)
      .single();

    if (!existingSlug) return randomSlug;

    attempts++;
  }

  // Fallback: use timestamp with random prefix
  const timestamp = Date.now().toString(36).toLowerCase();
  const randomPrefix = 'abcdefghijklmnopqrstuvwxyz'[
    Math.floor(Math.random() * 26)
  ];

  return `${randomPrefix}${timestamp}`;
}

export async function createShortlinkAction(
  _state: CreateShortlinkState,
  formData: FormData,
): Promise<{ success: boolean; shortlink?: Shortlink; error?: string }> {
  const supabase = await createServerClientSupabase();
  const url = formData.get('url')?.toString();
  const slug = formData.get('slug')?.toString();
  const user = await getCurrentUser();

  if (!url) return { success: false, error: 'URL is required.' };

  if (!isUrl(url)) return { success: false, error: 'Invalid URL format.' };

  let finalSlug = slug;

  if (!finalSlug) {
    finalSlug = await generateUniqueSlug(supabase);
    console.log('Generated random slug:', finalSlug);
  } else {
    // Ensure the custom slug is consistent and unique
    finalSlug = finalSlug.toLowerCase();

    const { data: existingSlug, error: checkError } = await supabase
      .from('shortlinks')
      .select('id')
      .eq('slug', finalSlug)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking slug existence:', checkError);
      return {
        success: false,
        error: 'An unexpected error occurred while validating the slug.',
      };
    }

    if (existingSlug) {
      return {
        success: false,
        error: 'Slug already exists. Please choose a different one.',
      };
    }
  }

  console.log('Inserting shortlink with data:', {
    slug: finalSlug,
    url,
    userId: user?.id,
  });

  const { data, error } = await supabase
    .from('shortlinks')
    .insert([
      {
        slug: finalSlug,
        url,
        user_id: user?.id || null, // Ensure user_id is nullable
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error inserting shortlink:', error);
    return { success: false, error: 'Failed to create shortlink.' };
  }

  // Revalidate cache for real-time updates
  revalidatePath('/');

  return { success: true, shortlink: data as Shortlink };
}

export async function deleteShortlink(shortlinkId: string) {
  const supabase = await createServerClientSupabase();
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Authentication required to delete shortlinks.');
  }

  console.log('Server action: deleteShortlink called with ID:', shortlinkId);

  const { data: shortlink, error: fetchError } = await supabase
    .from('shortlinks')
    .select('id, user_id')
    .eq('id', shortlinkId)
    .single();

  if (fetchError) {
    console.error('Fetch error:', fetchError.message);
    throw new Error(`Failed to fetch shortlink: ${fetchError.message}`);
  }

  if (!shortlink) {
    throw new Error('Shortlink not found.');
  }

  if (shortlink.user_id !== user.id) {
    throw new Error('You can only delete your own shortlinks.');
  }

  console.log('Shortlink found:', shortlink);

  const { error: deleteError } = await supabase
    .from('shortlinks')
    .delete()
    .eq('id', shortlinkId);

  if (deleteError) {
    console.error('Delete error:', deleteError.message);
    throw new Error(`Failed to delete shortlink: ${deleteError.message}`);
  }

  console.log('Shortlink deleted successfully.');
  revalidatePath('/');
  return { success: true };
}

export async function getShortlinkBySlug(slug: string): Promise<Shortlink> {
  const supabase = await createServerClientSupabase();
  const { data, error } = await supabase
    .from('shortlinks')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching shortlink:', error.message);
    throw new Error('Failed to fetch shortlink.');
  }

  if (!data) {
    throw new Error('Shortlink not found.');
  }

  return data as Shortlink;
}

export async function incrementShortlinkClickCount(
  shortlinkId: string,
): Promise<void> {
  const supabase = await createServerClientSupabase();
  const { error } = await supabase
    .from('shortlinks')
    .update({ click_count: { '+': 1 } })
    .eq('id', shortlinkId);

  if (error) {
    console.error('Error incrementing click count:', error.message);
    throw new Error('Failed to increment click count.');
  }

  console.log('Click count incremented successfully.');
}

export async function updateShortlink(
  shortlinkId: string,
  data: Partial<Shortlink>,
): Promise<Shortlink> {
  const supabase = await createServerClientSupabase();
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Authentication required to update shortlinks.');
  }

  const { data: shortlink, error: fetchError } = await supabase
    .from('shortlinks')
    .select('*')
    .eq('id', shortlinkId)
    .single();

  if (fetchError) {
    console.error('Fetch error:', fetchError.message);
    throw new Error(`Failed to fetch shortlink: ${fetchError.message}`);
  }

  if (!shortlink) {
    throw new Error('Shortlink not found.');
  }

  if (shortlink.user_id !== user.id) {
    throw new Error('You can only update your own shortlinks.');
  }

  console.log('Shortlink found:', shortlink);

  const { data: updatedData, error: updateError } = await supabase
    .from('shortlinks')
    .update(data)
    .eq('id', shortlinkId)
    .single();

  if (updateError) {
    console.error('Update error:', updateError.message);
    throw new Error(`Failed to update shortlink: ${updateError.message}`);
  }

  console.log('Shortlink updated successfully.');
  revalidatePath('/');
  return updatedData as Shortlink;
}

// get current user shortlinks
export async function getUserShortlinks() {
  const supabase = await createServerClientSupabase();
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from('shortlinks')
    .select('*')
    .eq('user_id', user.id);

  if (error) {
    console.error('Error fetching shortlinks:', error.message);
    throw new Error('Failed to fetch shortlinks.');
  }

  return data as Shortlink[];
}

//get all shortlink
export async function getAllShortlinks() {
  const supabase = await createServerClientSupabase();
  const { data, error } = await supabase.from('shortlinks').select('*');

  if (error) {
    console.error('Error fetching shortlinks:', error.message);
    throw new Error('Failed to fetch shortlinks.');
  }

  return data as Shortlink[];
}

// get all slugs
export async function getAllSlugs() {
  const supabase = await createServerClientSupabase();
  const { data, error } = await supabase.from('shortlinks').select('slug');

  if (error) {
    console.error('Error fetching slugs:', error.message);
    throw new Error('Failed to fetch slugs.');
  }

  return data as { slug: string }[];
}
