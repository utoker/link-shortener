-- links.click_count could be null. record_click adds 1 to it, and null + 1
-- stays null, so such a link never counted a click. createLink has always
-- inserted 0; this fixes any older rows and keeps it from happening again.

update public.links set click_count = 0 where click_count is null;

alter table public.links
  alter column click_count set default 0,
  alter column click_count set not null;
