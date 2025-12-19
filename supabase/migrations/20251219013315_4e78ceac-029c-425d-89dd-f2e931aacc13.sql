-- Create a secure function to update last login timestamp
-- This bypasses RLS since it's a SECURITY DEFINER function
CREATE OR REPLACE FUNCTION public.update_user_last_login(user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET last_login_at = now()
  WHERE id = user_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.update_user_last_login(uuid) TO authenticated;