-- Nombre de usuario único en profiles (registro + navbar)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS username TEXT;

COMMENT ON COLUMN public.profiles.username IS 'Identificador público único en minúsculas (letras, números, guion bajo)';

CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_lower_key
  ON public.profiles (lower(username))
  WHERE username IS NOT NULL;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_username text;
BEGIN
  v_username := NULLIF(lower(trim(NEW.raw_user_meta_data->>'username')), '');

  INSERT INTO public.profiles (id, display_name, avatar_url, username)
  VALUES (
    NEW.id,
    COALESCE(
      NULLIF(trim(NEW.raw_user_meta_data->>'full_name'), ''),
      NULLIF(trim(NEW.raw_user_meta_data->>'name'), ''),
      NULLIF(v_username, ''),
      split_part(NEW.email, '@', 1)
    ),
    NEW.raw_user_meta_data->>'avatar_url',
    v_username
  );
  RETURN NEW;
END;
$$;

-- Comprobar disponibilidad sin exponer filas ajenas por RLS
CREATE OR REPLACE FUNCTION public.username_available(p_username text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT NOT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE username IS NOT NULL
      AND lower(trim(username)) = lower(trim(p_username))
  );
$$;

REVOKE ALL ON FUNCTION public.username_available(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.username_available(text) TO anon, authenticated;
