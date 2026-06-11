-- ============================================
-- LearnHub: Create users table (if not exists)
-- Run this in the Supabase SQL Editor
-- ============================================

-- Create the users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'instructor', 'admin')),
  streak_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Grant permissions
GRANT ALL ON public.users TO service_role;
GRANT ALL ON public.users TO authenticated;
GRANT SELECT ON public.users TO anon;

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can read their own row
CREATE POLICY "Users can read own data"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

-- Service role bypasses RLS by default, but adding explicit policy
CREATE POLICY "Service role full access"
  ON public.users FOR ALL
  USING (true)
  WITH CHECK (true);
