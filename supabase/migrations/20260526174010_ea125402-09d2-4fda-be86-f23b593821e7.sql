
-- Drop duplicate storage policies on attachments bucket
DROP POLICY IF EXISTS "Users can delete own attachment files" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own attachment files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own attachment files" ON storage.objects;

-- Allow users to read their own AI usage rows (writes remain service-role only)
CREATE POLICY "Users can view own ai usage"
ON public.ai_usage
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
