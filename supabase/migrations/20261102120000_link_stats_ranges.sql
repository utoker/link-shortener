-- Numbers for one link's stats page over a chosen range: the last 7, 30 or
-- 90 days, or all time. Replaces link_click_stats (dropped by the next
-- migration once the page uses this one).
--
-- Windows are exact and end today in the viewer's time zone (UTC if Postgres
-- doesn't know the name). "All time" starts when per-click details began
-- (2026-11-01) or when the link was made, whichever is later. Clicks are
-- grouped by calendar day, week (Monday to Sunday) or month; the first and
-- last groups are cut to the window, so they can cover fewer days, and
-- "partial" marks the current week or month so far.
--
-- Runs as the signed-in viewer (security invoker), so the owner-only policies
-- on links and click_events decide what it sees: someone else's link returns
-- null, exactly like a missing one.

create or replace function public.link_stats(
  p_slug text,
  p_time_zone text default 'UTC',
  p_range text default '30d'
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
  v_first date;
  v_since timestamptz;
  v_bucket text;
  v_step interval;
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

  if p_range is null or p_range not in ('7d', '30d', '90d', 'all') then
    p_range := '30d';
  end if;

  if p_range = 'all' then
    -- links.created_at is a UTC timestamp without time zone
    v_first := least(v_today, greatest(
      date '2026-11-01',
      ((v_link.created_at at time zone 'UTC') at time zone p_time_zone)::date
    ));
    v_bucket := case
      when v_today - v_first < 31 then 'day'
      when v_today - v_first < 182 then 'week'
      else 'month'
    end;
  else
    v_first := v_today - (left(p_range, -1)::integer - 1);
    v_bucket := case p_range when '90d' then 'week' else 'day' end;
  end if;

  -- midnight at the start of the first day, in the viewer's time zone
  v_since := v_first::timestamp at time zone p_time_zone;
  v_step := ('1 ' || v_bucket)::interval;

  return json_build_object(
    'slug', v_link.slug,
    'url', v_link.url,
    'click_count', v_link.click_count,
    'time_zone', p_time_zone,
    'range', p_range,
    'bucket', v_bucket,
    'first_day', v_first,
    'last_day', v_today,
    'detailed_clicks', (
      select count(*) from public.click_events where link_id = v_link.id
    ),
    'buckets', (
      select json_agg(
               json_build_object(
                 'start', greatest(b.start, v_first),
                 'end', least((b.start + v_step)::date - 1, v_today),
                 'partial', (b.start + v_step)::date - 1 > v_today,
                 'clicks', coalesce(c.clicks, 0))
               order by b.start)
        from (
          select g::date as start
            from generate_series(date_trunc(v_bucket, v_first::timestamp),
                                 date_trunc(v_bucket, v_today::timestamp),
                                 v_step) as g
        ) b
        left join (
          select date_trunc(v_bucket, clicked_at at time zone p_time_zone)::date
                   as start,
                 count(*) as clicks
            from public.click_events
           where link_id = v_link.id and clicked_at >= v_since
           group by 1
        ) c on c.start = b.start
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

revoke execute on function public.link_stats(text, text, text) from public, anon;
grant execute on function public.link_stats(text, text, text) to authenticated;
