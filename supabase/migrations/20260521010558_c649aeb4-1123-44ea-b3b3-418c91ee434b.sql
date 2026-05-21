-- Plan and status enums
CREATE TYPE public.subscription_plan AS ENUM ('free', 'loyalty', 'cofounder');
CREATE TYPE public.subscription_status AS ENUM ('pending', 'active', 'past_due', 'canceled');
CREATE TYPE public.billing_interval AS ENUM ('once', 'monthly', 'yearly');

-- Subscriptions table — the locked price record
CREATE TABLE public.subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  plan public.subscription_plan NOT NULL,
  price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
  currency TEXT NOT NULL DEFAULT 'USD',
  billing_interval public.billing_interval NOT NULL,
  status public.subscription_status NOT NULL DEFAULT 'pending',
  locked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  current_period_end TIMESTAMP WITH TIME ZONE,
  provider TEXT,
  provider_subscription_id TEXT,
  canceled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Only one ACTIVE/PAST_DUE subscription per user at a time
CREATE UNIQUE INDEX subscriptions_one_active_per_user
  ON public.subscriptions (user_id)
  WHERE status IN ('active', 'past_due');

CREATE INDEX subscriptions_user_id_idx ON public.subscriptions (user_id);

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can VIEW their own subscription (read-only)
CREATE POLICY "Users can view own subscription"
  ON public.subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- No INSERT/UPDATE/DELETE policies for users —
-- only the service role (backend functions) can mutate subscriptions.
-- This prevents tampering with the locked price from the client.

-- Immutability trigger: block changes to price/plan/interval/locked_at after creation
CREATE OR REPLACE FUNCTION public.enforce_subscription_price_lock()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.plan IS DISTINCT FROM OLD.plan THEN
    RAISE EXCEPTION 'Subscription plan is locked and cannot be changed (was %, attempted %). Cancel and create a new subscription instead.', OLD.plan, NEW.plan;
  END IF;
  IF NEW.price_cents IS DISTINCT FROM OLD.price_cents THEN
    RAISE EXCEPTION 'Subscription price is locked at % cents and cannot be changed (attempted %). Grandfathered pricing is permanent.', OLD.price_cents, NEW.price_cents;
  END IF;
  IF NEW.currency IS DISTINCT FROM OLD.currency THEN
    RAISE EXCEPTION 'Subscription currency is locked and cannot be changed.';
  END IF;
  IF NEW.billing_interval IS DISTINCT FROM OLD.billing_interval THEN
    RAISE EXCEPTION 'Subscription billing interval is locked and cannot be changed.';
  END IF;
  IF NEW.locked_at IS DISTINCT FROM OLD.locked_at THEN
    RAISE EXCEPTION 'locked_at timestamp is immutable.';
  END IF;
  IF NEW.user_id IS DISTINCT FROM OLD.user_id THEN
    RAISE EXCEPTION 'Subscription user_id is immutable.';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER enforce_subscription_price_lock_trigger
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_subscription_price_lock();

-- updated_at auto-bump using existing helper
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Helper function: get a user's current effective price (for display in UI)
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
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT plan, price_cents, currency, billing_interval, status, locked_at
  FROM public.subscriptions
  WHERE user_id = _user_id
    AND status IN ('active', 'past_due', 'pending')
  ORDER BY locked_at DESC
  LIMIT 1;
$$;