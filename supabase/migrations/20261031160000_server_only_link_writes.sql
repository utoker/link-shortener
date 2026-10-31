-- Apply only after the app inserts links with the secret key (createLink).
--
-- insert_links let anyone holding the public anon key insert links straight
-- through the REST API, skipping createLink's rate limit and URL checks, and
-- update_own_links let owners swap a link's URL after creating it. The app
-- never updates links directly (increment_click is security definer), so
-- links are now written only by the server. Owners can still read and delete.

drop policy insert_links on public.links;
drop policy update_own_links on public.links;
revoke insert, update on public.links from anon, authenticated;

-- click_events is unused and had `with check (true)` for inserts.
drop policy insert_click_events on public.click_events;
revoke insert, update on public.click_events from anon, authenticated;
