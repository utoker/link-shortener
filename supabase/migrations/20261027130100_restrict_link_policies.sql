-- Apply only after the app uses resolve_slug() / slug_exists() for lookups.
--
-- select_links previously allowed `slug is not null OR owner`, and slug is never
-- null, so every row (including signed-in users' links) was public.
-- insert_links let anonymous requests set any user_id.

alter policy select_links on public.links
  using (public.current_user_uuid() = user_id);

alter policy insert_links on public.links
  with check (
    (public.current_user_uuid() is null and user_id is null)
    or public.current_user_uuid() = user_id
  );
