-- Per-click details for link stats, written only by the server.
--
-- click_events was empty and unused. It now keeps just the time, the referring
-- site's host name, the visitor's country code and a device type: no IP
-- address and no full user-agent, so a stored click can't be traced back to a
-- person. Rows stay until their link (or the owner's account) is deleted.

alter table public.click_events
  drop column ip_address,
  drop column user_agent,
  alter column link_id set not null,
  alter column clicked_at drop default,
  alter column clicked_at type timestamptz using clicked_at at time zone 'UTC',
  alter column clicked_at set default now(),
  alter column clicked_at set not null,
  add column referrer_host text
    check (char_length(referrer_host) between 1 and 253),
  add column country text check (country ~ '^[A-Z]{2}$'),
  add column device text check (device in ('phone', 'tablet', 'computer'));

-- Stats read one link's clicks by time; this also serves the cascade delete.
create index click_events_link_id_clicked_at_idx
  on public.click_events (link_id, clicked_at);
drop index public.idx_click_events_link_id;

-- Browsers only read click_events (owner-only policy); drop the leftover rights.
revoke delete, truncate, references, trigger on public.click_events
  from anon, authenticated;

-- Replaces increment_click. Counts the click and, for links with an owner
-- (the only ones with a stats page), stores its details. Only the server's
-- secret key may call it, so nobody can inflate counts through the public API.
create or replace function public.record_click(
  p_slug text,
  p_referrer_host text default null,
  p_country text default null,
  p_device text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_link_id uuid;
  v_user_id uuid;
begin
  update public.links
     set click_count = click_count + 1
   where slug = p_slug
   returning id, user_id into v_link_id, v_user_id;

  if not found then
    raise exception 'slug % not found', p_slug;
  end if;

  if v_user_id is not null then
    insert into public.click_events (link_id, referrer_host, country, device)
    values (v_link_id, p_referrer_host, p_country, p_device);
  end if;
end;
$$;

revoke execute on function public.record_click(text, text, text, text)
  from public, anon, authenticated;
grant execute on function public.record_click(text, text, text, text)
  to service_role;
