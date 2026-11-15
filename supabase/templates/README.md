# Email templates

The sign-up and password reset emails are sent by Supabase Auth, so their
HTML lives in the Supabase dashboard (Authentication → Emails → Templates).
These files are the source; paste them there after changing them.

| File                  | Dashboard template | Subject                          |
| --------------------- | ------------------ | -------------------------------- |
| `confirm-signup.html` | Confirm signup     | `Confirm your email for reqq.cc` |
| `reset-password.html` | Reset password     | `Reset your reqq.cc password`    |

- The button leads to `/auth/confirm?token_hash={{ .TokenHash }}&type=…`
  (`email` for sign-up, `recovery` for reset), the page that asks for a button press before the
  one-time link is spent. Only the types in `src/lib/emailLinks.ts` work.
- The logo (`public/email/logo.png`) and heading font (`public/fonts`) load from
  https://reqq.cc, so deploy before pasting a template that uses a new file.
- Gmail and Outlook don't load web fonts and show a rounded system font
  instead; Apple Mail shows Fredoka One.
- No name in the greeting on purpose: anyone can sign up with someone else's
  address, and the name field would let them put their own text in the email.
