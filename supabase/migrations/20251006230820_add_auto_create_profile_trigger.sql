/*
  # Auto-Create User Profile on Sign Up

  ## Overview
  This migration adds a database trigger that automatically creates a profile
  and subscription entry when a new user signs up.

  ## Changes

  ### 1. New Function: handle_new_user
  - Automatically runs when a new user is created in auth.users
  - Creates a profile row in public.profiles
  - Creates a subscription row in public.subscriptions with 'free' tier
  - Returns the new user record

  ### 2. New Trigger: on_auth_user_created
  - Fires after INSERT on auth.users
  - Calls handle_new_user() function for each new row

  ## Important Notes
  - This ensures every new user automatically gets a profile and subscription
  - The function uses SECURITY DEFINER to have the necessary permissions
  - No manual profile creation needed after user registration
*/

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create profile for new user
  INSERT INTO public.profiles (id, created_at, updated_at)
  VALUES (NEW.id, now(), now());
  
  -- Create free subscription for new user
  INSERT INTO public.subscriptions (user_id, tier, status, created_at, updated_at)
  VALUES (NEW.id, 'free', 'active', now(), now());
  
  RETURN NEW;
END;
$$;

-- Create trigger to run function on new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
