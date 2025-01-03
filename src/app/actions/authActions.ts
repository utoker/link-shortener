// /utils/auth.ts
'use server';

import { createServerClientSupabase } from '../../lib/supabase/server';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { AuthResult, Provider } from '@lib/types';

// Sign in with Github/Google
export async function signinWith(provider: Provider) {
  const supabase = await createServerClientSupabase();

  const authCallbackUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: authCallbackUrl,
    },
  });

  if (error) {
    console.error(error);
    return;
  }

  redirect(data.url);
}

// Sign in with password
export const signinWithPasswordAction = async (
  _state: AuthResult,
  formData: FormData,
): Promise<AuthResult> => {
  const supabase = await createServerClientSupabase();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  // Validate input
  const errors: Record<string, string[]> = {};
  if (!email) errors.email = ['Email is required'];
  if (!password) errors.password = ['Password is required'];

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  // Sign in with Supabase
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      generalError: error.message || 'Invalid credentials. Please try again.',
    };
  }

  return { success: 'Sign-in successful!' };
};

// Sign up with password
export const signupWithPasswordAction = async (
  _state: AuthResult,
  formData: FormData,
): Promise<AuthResult> => {
  const supabase = await createServerClientSupabase();

  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  // Validation
  const errors: Record<string, string[]> = {};
  if (!name) errors.name = ['Name is required'];
  if (!email) errors.email = ['Email is required'];
  if (!password) errors.password = ['Password is required'];
  if (!confirmPassword)
    errors.confirmPassword = ['Confirm password is required'];
  if (password && confirmPassword && password !== confirmPassword) {
    errors.confirmPassword = ['Passwords do not match'];
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  // Create user in Supabase
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        full_name: name,
      },
    },
  });

  if (error) {
    return { generalError: error.message || 'Failed to create account.' };
  }

  return { success: 'Account created successfully!' };
};

// Reset password email
export const resetPasswordAction = async (
  _state: AuthResult,
  formData: FormData,
): Promise<AuthResult> => {
  try {
    // Extract email from form data
    const email = formData.get('email') as string | null;

    // Initialize errors object
    const errors: Record<string, string[]> = {};

    // Validate email
    if (!email || typeof email !== 'string' || email.trim() === '') {
      errors.email = ['Email is required'];
      return { errors };
    }

    // Initialize Supabase client
    const supabase = await createServerClientSupabase();

    // Fetch the origin header
    const origin = (await headers()).get('origin') || '';

    // Fetch all users
    const { data, error: userError } = await supabase.auth.admin.listUsers();

    // Handle error while fetching user list
    if (userError || !data) {
      return { generalError: 'Failed to fetch user details.' };
    }

    // Find user by email
    const user = data.users.find((u) => u.email === email);

    if (!user) {
      return { errors: { email: ['No account found with this email.'] } };
    }

    // Check if account is linked to a provider
    if (user.app_metadata?.provider !== 'email') {
      return {
        errors: {
          email: [
            `This account is linked with a ${user.app_metadata?.provider} provider.`,
          ],
        },
      };
    }

    // Trigger password reset email
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/auth/callback?redirect_to=/protected/reset-password`,
    });

    if (error) {
      return {
        generalError: error.message || 'Failed to send password reset email.',
      };
    }

    // Return success
    return { success: 'Password reset email sent.' };
  } catch (err) {
    console.error('Unexpected error in resetPasswordAction:', err);
    return { generalError: 'An unexpected error occurred. Please try again.' };
  }
};

// Update password
export const updatePasswordAction = async (
  _state: AuthResult,
  formData: FormData,
): Promise<AuthResult> => {
  // Extract form data
  const password = formData.get('password')?.toString();
  const confirmPassword = formData.get('password')?.toString();

  // Initialize errors object
  const errors: Record<string, string[]> = {};

  // Validate inputs
  if (!password) {
    errors.password = ['Password is required'];
  }
  if (!confirmPassword) {
    errors.confirmPassword = ['Confirm password is required'];
  }
  if (password && confirmPassword && password !== confirmPassword) {
    errors.confirmPassword = ['Passwords do not match'];
  }
  if (password && password.length < 6) {
    errors.password = ['Password must be at least 6 characters long'];
  }

  // Return errors if any exist
  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  try {
    // Initialize Supabase client
    const supabase = await createServerClientSupabase();

    // Update password in Supabase
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      return { generalError: error.message || 'Password update failed' };
    }

    // Return success message
    return { success: 'Password updated successfully' };
  } catch (err) {
    console.error('Unexpected error in updatePasswordAction:', err);
    return { generalError: 'An unexpected error occurred. Please try again.' };
  }
};

// Sign out
export const signOutAction = async (): Promise<{
  success?: string;
  error?: string;
}> => {
  try {
    const supabase = await createServerClientSupabase();
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Error during sign out:', error.message);
      return { error: 'Failed to log out. Please try again.' };
    }

    return { success: 'Successfully logged out.' };
  } catch (err) {
    console.error('Unexpected error during sign out:', err);
    return { error: 'An unexpected error occurred. Please try again.' };
  }
};

// Get user
export async function getUserAction() {
  try {
    const supabase = await createServerClientSupabase();
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      console.log('Error fetching user:', error.message);
      return null;
    }
    return data || null;
  } catch (err) {
    console.error('Unexpected error fetching user:', err);
    return null;
  }
}
