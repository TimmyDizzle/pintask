
-- 1. waitlist_emails: restrict SELECT to admins
DROP POLICY IF EXISTS "Authenticated users can view emails" ON public.waitlist_emails;
CREATE POLICY "Admins can view waitlist emails"
  ON public.waitlist_emails FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 2. ad_impressions: restrict SELECT to admins
DROP POLICY IF EXISTS "Authenticated users can view impressions" ON public.ad_impressions;
CREATE POLICY "Admins can view ad impressions"
  ON public.ad_impressions FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 3. Make attachments bucket private
UPDATE storage.buckets SET public = false WHERE id = 'attachments';

-- Drop any public SELECT policy on attachments bucket; keep owner-only access
DROP POLICY IF EXISTS "Public can view attachments" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for attachments" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view attachments" ON storage.objects;

-- Ensure owner-scoped policies exist (users access files under their own user_id folder)
DROP POLICY IF EXISTS "Users can view own attachment files" ON storage.objects;
CREATE POLICY "Users can view own attachment files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can upload own attachment files" ON storage.objects;
CREATE POLICY "Users can upload own attachment files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can delete own attachment files" ON storage.objects;
CREATE POLICY "Users can delete own attachment files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 4. Revoke EXECUTE on internal SECURITY DEFINER functions that should not be callable from the API
REVOKE EXECUTE ON FUNCTION public.publish_due_blog_posts() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.enforce_subscription_price_lock() FROM anon, authenticated, public;
-- has_role and claim_first_admin remain executable (used in RLS / by signed-in users)
