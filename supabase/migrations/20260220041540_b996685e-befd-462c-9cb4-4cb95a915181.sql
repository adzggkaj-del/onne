
-- Add bonus_krw column to profiles table
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS bonus_krw numeric NOT NULL DEFAULT 0;

-- Allow admins to update all profiles (including bonus_krw)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'profiles'
      AND policyname = 'Admins can update all profiles'
  ) THEN
    CREATE POLICY "Admins can update all profiles"
      ON public.profiles
      FOR UPDATE
      USING (has_role(auth.uid(), 'admin'::app_role));
  END IF;
END
$$;
