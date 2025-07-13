// ────────────────────────────────────────────────────────────────
// src/app/actions/auth/updatePassword.ts
// ────────────────────────────────────────────────────────────────
'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import {
  updatePasswordSchema,
  type UpdatePasswordFormValues, // ← this *is* exported by your schema
} from '@/lib/schemas/updatePasswordSchema'; // adjust path if nested differently

/* ----------------------------------------------------------------
   Result-shape helpers
   ---------------------------------------------------------------- */
type UpdatePwFieldErrors = Partial<
  Record<keyof UpdatePasswordFormValues, string[]>
>;

export interface UpdatePwResult {
  success: boolean;
  fieldErrors?: UpdatePwFieldErrors;
  formError?: string;
}

/* ----------------------------------------------------------------
   Server Action
   ---------------------------------------------------------------- */
export async function updatePasswordAction(
  _prev: UpdatePwResult,
  formData: FormData,
): Promise<UpdatePwResult> {
  /* 1️⃣  gather inputs ------------------------------------------------- */
  const values: Partial<UpdatePasswordFormValues> = {
    password: formData.get('password') as string | undefined,
    confirmPassword: formData.get('confirmPassword') as string | undefined,
  };

  /* 2️⃣  validate ------------------------------------------------------ */
  const parsed = updatePasswordSchema.safeParse(values);
  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: parsed.error.flatten().fieldErrors as UpdatePwFieldErrors,
    };
  }

  /* 3️⃣  call Supabase -------------------------------------------------- */
  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.updateUser({
      password: parsed.data.password,
    });

    if (error) return { success: false, formError: error.message };
    return { success: true };
  } catch (err) {
    return {
      success: false,
      formError:
        err instanceof Error
          ? err.message
          : 'Unexpected error while updating password',
    };
  }
}
