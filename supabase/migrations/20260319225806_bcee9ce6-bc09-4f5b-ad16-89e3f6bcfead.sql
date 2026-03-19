
CREATE TABLE public.waitlist_emails (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.waitlist_emails ENABLE ROW LEVEL SECURITY;

-- Allow anyone (including anonymous/unauthenticated) to insert
CREATE POLICY "Anyone can submit email"
ON public.waitlist_emails
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Only authenticated users can view (for admin purposes)
CREATE POLICY "Authenticated users can view emails"
ON public.waitlist_emails
FOR SELECT
TO authenticated
USING (true);
