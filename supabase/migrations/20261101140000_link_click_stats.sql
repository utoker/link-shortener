-- Numbers for one link's stats page: clicks per day for the last p_days days
-- and that period's referring sites, countries and devices.
--
-- Runs as the signed-in viewer (security invoker), so the owner-only policies
-- on links and click_events decide what it sees: someone else's link returns
-- null, exactly like a missing one. Days are counted in the viewer's time zone
-- (UTC if Postgres doesn't know the name).

create or replace function public.link_click_stats(
  p_slug text,
  p_time_zone text default 'UTC',
  p_days integer default 30
)
returns json
language plpgsql
stable
security invoker
set search_path = ''
as $$
declare
  v_link public.links;
  v_today date;
  v_since timestamptz;
begin
  select * into v_link from public.links where slug = p_slug;
  if not found then
    return null;
  end if;

  begin
    v_today := (now() at time zone p_time_zone)::date;
  exception when invalid_parameter_value then
    p_time_zone := 'UTC';
    v_today := (now() at time zone p_time_zone)::date;
  end;
  -- midnight at the start of the first day, in the viewer's time zone
  v_since := (v_today - (p_days - 1))::timestamp at time zone p_time_zone;

  return json_build_object(
    'slug', v_link.slug,
    'url', v_link.url,
    'click_count', v_link.click_count,
    'time_zone', p_time_zone,
    'detailed_clicks', (
      select count(*) from public.click_events where link_id = v_link.id
    ),
    'days', (
      select json_agg(
               json_build_object('day', d.day, 'clicks', coalesce(c.clicks, 0))
               order by d.day)
        from (
          select g::date as day
            from generate_series((v_today - (p_days - 1))::timestamp,
                                 v_today::timestamp, interval '1 day') as g
        ) d
        left join (
          select (clicked_at at time zone p_time_zone)::date as day,
                 count(*) as clicks
            from public.click_events
           where link_id = v_link.id and clicked_at >= v_since
           group by 1
        ) c on c.day = d.day
    ),
    'referrers', (
      select coalesce(json_agg(json_build_object('name', name, 'clicks', clicks)
                               order by clicks desc, name), '[]')
        from (
          select referrer_host as name, count(*) as clicks
            from public.click_events
           where link_id = v_link.id and clicked_at >= v_since
           group by 1
        ) t
    ),
    'countries', (
      select coalesce(json_agg(json_build_object('name', name, 'clicks', clicks)
                               order by clicks desc, name), '[]')
        from (
          select country as name, count(*) as clicks
            from public.click_events
           where link_id = v_link.id and clicked_at >= v_since
           group by 1
        ) t
    ),
    'devices', (
      select coalesce(json_agg(json_build_object('name', name, 'clicks', clicks)
                               order by clicks desc, name), '[]')
        from (
          select device as name, count(*) as clicks
            from public.click_events
           where link_id = v_link.id and clicked_at >= v_since
           group by 1
        ) t
    )
  );
end;
$$;

revoke execute on function public.link_click_stats(text, text, integer)
  from public, anon;
grant execute on function public.link_click_stats(text, text, integer)
  to authenticated;
