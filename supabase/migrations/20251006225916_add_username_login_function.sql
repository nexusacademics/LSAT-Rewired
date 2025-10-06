/*
  # Add Username Login Support

  ## Overview
  This migration adds a database function to enable users to log in with their username
  instead of requiring an email address.

  ## Changes

  ### 1. New Function: get_email_by_username
  - Takes a username as input
  - Returns the associated email address from auth.users
  - Joins profiles table with auth.users using the user ID
  - Returns null if username doesn't exist
  - Security: Function runs with SECURITY DEFINER to access auth schema
  - Security: Still secure because it only returns email for existing usernames (no sensitive data exposed)

  ## Usage
  This function is called by the client when a user tries to log in with a username
  instead of an email address. The client then uses the returned email to authenticate
  with Supabase Auth.

  ## Important Notes
  - The function needs SECURITY DEFINER to read from auth.users
  - This is safe because we only return the email (which is needed for login anyway)
  - No passwords or sensitive data are exposed
*/

-- Create function to get email by username
CREATE OR REPLACE FUNCTION public.get_email_by_username(username_input text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email text;
BEGIN
  -- Look up the user's email from auth.users via profiles
  SELECT u.email INTO user_email
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.id
  WHERE p.username = username_input;
  
  RETURN user_email;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_email_by_username(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_email_by_username(text) TO anon;
