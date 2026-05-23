
-- Personal AI Assistant tables

CREATE TABLE public.assistant_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL DEFAULT 'New chat',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_assistant_conversations_user ON public.assistant_conversations(user_id, updated_at DESC);

ALTER TABLE public.assistant_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users select own conversations" ON public.assistant_conversations
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own conversations" ON public.assistant_conversations
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own conversations" ON public.assistant_conversations
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own conversations" ON public.assistant_conversations
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER trg_assistant_conv_updated
  BEFORE UPDATE ON public.assistant_conversations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


CREATE TABLE public.assistant_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.assistant_conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text NOT NULL CHECK (role IN ('user','assistant','system')),
  content text NOT NULL,
  prompt_tokens int NOT NULL DEFAULT 0,
  completion_tokens int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_assistant_messages_conv ON public.assistant_messages(conversation_id, created_at);
CREATE INDEX idx_assistant_messages_user_created ON public.assistant_messages(user_id, created_at DESC);

ALTER TABLE public.assistant_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users select own messages" ON public.assistant_messages
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own messages" ON public.assistant_messages
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own messages" ON public.assistant_messages
  FOR DELETE TO authenticated USING (auth.uid() = user_id);


CREATE TABLE public.assistant_quotas (
  user_id uuid PRIMARY KEY,
  tier text NOT NULL DEFAULT 'free' CHECK (tier IN ('free','pro')),
  monthly_token_limit int NOT NULL DEFAULT 50000,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.assistant_quotas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users select own quota" ON public.assistant_quotas
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER trg_assistant_quotas_updated
  BEFORE UPDATE ON public.assistant_quotas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- Returns month-to-date assistant usage for a user
CREATE OR REPLACE FUNCTION public.get_user_assistant_usage(_user_id uuid)
RETURNS TABLE(tokens_used bigint, tokens_limit int, period_start timestamptz, period_end timestamptz)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH bounds AS (
    SELECT date_trunc('month', now()) AS p_start,
           (date_trunc('month', now()) + interval '1 month') AS p_end
  ),
  q AS (
    SELECT COALESCE(
      (SELECT monthly_token_limit FROM public.assistant_quotas WHERE user_id = _user_id),
      50000
    )::int AS lim
  ),
  used AS (
    SELECT COALESCE(SUM(total_tokens), 0)::bigint AS tokens
    FROM public.ai_usage, bounds
    WHERE user_id = _user_id
      AND function_name = 'assistant-chat'
      AND created_at >= bounds.p_start
      AND created_at <  bounds.p_end
  )
  SELECT used.tokens, q.lim, bounds.p_start, bounds.p_end
  FROM used, q, bounds;
$$;
