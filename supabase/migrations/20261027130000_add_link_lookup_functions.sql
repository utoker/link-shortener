-- Slug lookups that don't need direct SELECT access to public.links, so the
-- table's SELECT policy can be limited to each link's owner (next migration).

create or replace function public.resolve_slug(p_slug text)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select url from public.links where slug = p_slug;
$$;

create or replace function public.slug_exists(p_slug text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.links where slug = p_slug);
$$;

grant execute on function public.resolve_slug(text) to anon, authenticated;
grant execute on function public.slug_exists(text) to anon, authenticated;
