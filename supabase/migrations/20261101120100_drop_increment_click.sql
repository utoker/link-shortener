-- Apply only after the middleware records clicks with record_click().
--
-- increment_click could be called by anyone holding the public anon key, so
-- any link's count could be inflated without going through the redirect rate
-- limit. Nothing calls it any more.

drop function public.increment_click(text);
