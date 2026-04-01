-- Run once if DB was migrated before email signup: fixes empty phone UNIQUE collisions for email-only users.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.patients (id, full_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'بیمار جدید'),
    COALESCE(
      NULLIF(TRIM(NEW.raw_user_meta_data ->> 'phone'), ''),
      NULLIF(TRIM(NEW.phone::text), ''),
      NEW.email
    )
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
