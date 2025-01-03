export type Provider = 'google' | 'github';

export interface AuthResult {
  success?: string; // Success message for successful actions
  errors?: Record<string, string[]>; // Field-specific errors
  generalError?: string; // General error not tied to specific fields
}

export interface Shortlink {
  id: string;
  slug: string;
  url: string;
  click_count: number;
  user_id: string | null;
}

export interface CreateShortlinkState {
  success: boolean;
  shortlink?: Shortlink;
  error?: string;
}
