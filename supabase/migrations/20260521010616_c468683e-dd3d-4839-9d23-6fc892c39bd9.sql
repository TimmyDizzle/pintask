-- Switch helper to SECURITY INVOKER (relies on RLS) and revoke public access
CREATE OR REPLACE FUNCTION public.get_current_subscription(_user_id UUID)
RETURNS TABLE (
  plan public.subscription_plan,
  price_cents INTEGER,
  currency TEXT,
  billing_interval public.billing_interval,
  status public.subscription_status,
  locked_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT plan, price_cents, currency, billing_interval, status, locked_at
  FROM public.subscriptions
  WHERE user_id = _user_id
    AND status IN ('active', 'past_due', 'pending')
  ORDER BY locked_at DESC
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_current_subscription(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_current_subscription(UUID) TO authenticated;