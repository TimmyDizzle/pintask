CREATE TABLE public.labels (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  color text NOT NULL DEFAULT '#6366f1',
  user_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(name, user_id)
);

ALTER TABLE public.labels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own labels" ON public.labels FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own labels" ON public.labels FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own labels" ON public.labels FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own labels" ON public.labels FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.task_labels (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  label_id uuid NOT NULL REFERENCES public.labels(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(task_id, label_id)
);

ALTER TABLE public.task_labels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own task labels" ON public.task_labels FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own task labels" ON public.task_labels FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own task labels" ON public.task_labels FOR DELETE TO authenticated USING (auth.uid() = user_id);