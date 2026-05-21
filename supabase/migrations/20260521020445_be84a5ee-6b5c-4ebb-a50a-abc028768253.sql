
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TABLE public.ad_impressions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id text NOT NULL,
  page_path text NOT NULL,
  session_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ad_impressions_created_idx ON public.ad_impressions (created_at DESC);
CREATE INDEX ad_impressions_page_idx ON public.ad_impressions (page_path);
ALTER TABLE public.ad_impressions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can record impressions"
  ON public.ad_impressions FOR INSERT TO anon, authenticated
  WITH CHECK (true);
CREATE POLICY "Authenticated users can view impressions"
  ON public.ad_impressions FOR SELECT TO authenticated
  USING (true);

CREATE TABLE public.ad_revenue_daily (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  date date NOT NULL,
  page_path text NOT NULL DEFAULT '*',
  slot_id text,
  revenue_cents integer NOT NULL DEFAULT 0,
  clicks integer NOT NULL DEFAULT 0,
  impressions_reported integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX ad_revenue_daily_uniq ON public.ad_revenue_daily (user_id, date, page_path, COALESCE(slot_id, ''));
CREATE INDEX ad_revenue_daily_user_date_idx ON public.ad_revenue_daily (user_id, date DESC);
ALTER TABLE public.ad_revenue_daily ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users select own revenue rows"
  ON public.ad_revenue_daily FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Users insert own revenue rows"
  ON public.ad_revenue_daily FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own revenue rows"
  ON public.ad_revenue_daily FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Users delete own revenue rows"
  ON public.ad_revenue_daily FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER ad_revenue_daily_updated_at
  BEFORE UPDATE ON public.ad_revenue_daily
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
