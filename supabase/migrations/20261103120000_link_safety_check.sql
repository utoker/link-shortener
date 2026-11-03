-- Weekly Google Safe Browsing re-check of every link (/api/cron/link-check).
--
--   safety_checked_at  when Google last answered for the link's current URL;
--                      null until then (e.g. Google couldn't be reached when
--                      the link was made)
--   safety_threats     what Google reported, e.g. {SOCIAL_ENGINEERING}; null
--                      when clean. A link with threats is blocked: visitors
--                      get a warning page instead of the redirect.
--   safety_flagged_at  when the current block started
--
-- Only the server writes them (anon and authenticated have no UPDATE on
-- links); owners can read them on their own links.

alter table public.links
  add column safety_checked_at timestamptz,
  add column safety_threats text[],
  add column safety_flagged_at timestamptz;

-- Replaces resolve_slug (dropped by the next migration once the middleware
-- uses this one): the destination and whether the link is blocked.
create function public.resolve_link(p_slug text)
returns table (url text, blocked boolean)
language sql
stable
security definer
set search_path = ''
as $$
  select l.url, l.safety_threats is not null
  from public.links l
  where l.slug = p_slug;
$$;

grant execute on function public.resolve_link(text) to anon, authenticated;
