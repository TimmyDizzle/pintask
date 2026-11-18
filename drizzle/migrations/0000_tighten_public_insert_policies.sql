DROP POLICY IF EXISTS "Anyone can record impressions" ON public.ad_impressions;
CREATE POLICY "Anyone can record valid impressions" ON public.ad_impressions
FOR INSERT TO anon, authenticated
WITH CHECK (
  length(slot_id) BETWEEN 1 AND 100
  AND length(page_path) BETWEEN 1 AND 500
  AND (session_id IS NULL OR length(session_id) <= 200)
  AND length(consent_state) BETWEEN 1 AND 50
);

DROP POLICY IF EXISTS "Anyone can submit email" ON public.waitlist_emails;
CREATE POLICY "Anyone can submit a valid email" ON public.waitlist_emails
FOR INSERT TO anon, authenticated
WITH CHECK (
  length(email) BETWEEN 3 AND 255
  AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND length(source) BETWEEN 1 AND 100
);