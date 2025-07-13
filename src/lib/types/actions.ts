import { Link } from './database';

// src/types/action.ts
export type Provider = 'google' | 'github';

export interface ActionResult<FieldErrors = unknown> {
  success: boolean;
  fieldErrors?: FieldErrors; // object keyed by field name
  formError?: string; // banner / toast error
}

export type AuthResult =
  | { success: true }
  | {
      success: false;
      errors?: Record<string, string[]>;
      generalError?: string;
    };

export interface CreateLinkState {
  success: boolean;
  link?: Link;
  error?: string;
}

export type CreateLinkFormState = {
  success: boolean;
  message?: string;
  slug?: string;
};

export interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSigninRedirect: () => void;
}
