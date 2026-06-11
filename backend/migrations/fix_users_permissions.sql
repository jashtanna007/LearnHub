-- ============================================
-- LearnHub: Fix users table permissions
-- Run this in the Supabase SQL Editor
-- ============================================

-- 1. Grant all permissions on the users table to service_role
GRANT ALL ON public.users TO service_role;
GRANT ALL ON public.users TO authenticated;
GRANT SELECT ON public.users TO anon;

-- 2. Enable RLS (good practice)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Users can read their own row
CREATE POLICY IF NOT EXISTS "Users can read own data"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

-- 4. Policy: Service role can do anything (bypasses RLS anyway, but explicit)
CREATE POLICY IF NOT EXISTS "Service role full access"
  ON public.users FOR ALL
  USING (true)
  WITH CHECK (true);

-- 5. Clean up any orphaned auth users that were created during testing
-- (Optional: run only if you had failed registrations)
-- DELETE FROM auth.users WHERE id NOT IN (SELECT id FROM public.users);
