ALTER TABLE public.ad_impressions
  ADD COLUMN IF NOT EXISTS consent_state text NOT NULL DEFAULT 'accepted';

CREATE INDEX IF NOT EXISTS ad_impressions_consent_state_idx
  ON public.ad_impressions (consent_state);