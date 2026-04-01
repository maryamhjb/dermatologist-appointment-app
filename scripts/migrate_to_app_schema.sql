-- Align public schema with app code (dashboard, admin, init-db shape).
-- Safe to re-run: drops named policies before recreate; CREATE IF NOT EXISTS for tables.

BEGIN;

-- 1) Archive legacy "simple" appointments (first_name, clinic, …) so IF NOT EXISTS can create the real table.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'appointments'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'appointments' AND column_name = 'patient_id'
  ) THEN
    ALTER TABLE public.appointments RENAME TO appointments_legacy;
    RAISE NOTICE 'Renamed legacy public.appointments -> appointments_legacy';
  END IF;
END $$;

-- 2) Tables (matches scripts/setup_database.sql / app/api/init-db)
CREATE TABLE IF NOT EXISTS public.offices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT,
  available_days TEXT[] NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'assistant')),
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.patients (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  points INTEGER NOT NULL DEFAULT 0,
  total_points_earned INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.procedures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_fa TEXT NOT NULL,
  description_fa TEXT,
  category TEXT NOT NULL,
  price INTEGER NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.time_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  office_id UUID NOT NULL REFERENCES public.offices(id) ON DELETE CASCADE,
  slot_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  capacity INTEGER NOT NULL DEFAULT 1,
  booked_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  office_id UUID NOT NULL REFERENCES public.offices(id),
  time_slot_id UUID NOT NULL REFERENCES public.time_slots(id),
  procedure_id UUID REFERENCES public.procedures(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  notes TEXT,
  points_redeemed INTEGER NOT NULL DEFAULT 0,
  points_redeemed_value INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES public.appointments(id),
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  points_awarded INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES public.admin_users(id)
);

CREATE TABLE IF NOT EXISTS public.point_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('earned_comment', 'redeemed', 'bonus', 'expired')),
  points INTEGER NOT NULL,
  toman_value INTEGER NOT NULL DEFAULT 0,
  description_fa TEXT NOT NULL,
  reference_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.point_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  points_per_comment INTEGER NOT NULL DEFAULT 100,
  toman_per_point INTEGER NOT NULL DEFAULT 10,
  max_redeem_per_visit INTEGER NOT NULL DEFAULT 50000,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES public.admin_users(id)
);

ALTER TABLE public.offices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procedures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.point_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.point_settings ENABLE ROW LEVEL SECURITY;

-- 3) Policies (drop then create — idempotent)
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT policyname, tablename
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN (
        'offices', 'admin_users', 'patients', 'procedures', 'time_slots',
        'appointments', 'comments', 'point_transactions', 'point_settings'
      )
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
  END LOOP;
END $$;

CREATE POLICY "offices_public_read" ON public.offices FOR SELECT USING (true);
CREATE POLICY "offices_admin_all" ON public.offices FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
);

CREATE POLICY "admin_users_self_read" ON public.admin_users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "admin_users_super_admin_all" ON public.admin_users FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid() AND role = 'super_admin')
);

CREATE POLICY "patients_self_read" ON public.patients FOR SELECT USING (auth.uid() = id);
CREATE POLICY "patients_self_update" ON public.patients FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "patients_self_insert" ON public.patients FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "patients_admin_read" ON public.patients FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
);
CREATE POLICY "patients_admin_update" ON public.patients FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
);

CREATE POLICY "procedures_public_read" ON public.procedures FOR SELECT USING (is_active = true);
CREATE POLICY "procedures_admin_all" ON public.procedures FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
);

CREATE POLICY "time_slots_public_read" ON public.time_slots FOR SELECT USING (true);
CREATE POLICY "time_slots_admin_all" ON public.time_slots FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
);

CREATE POLICY "appointments_self_read" ON public.appointments FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "appointments_self_insert" ON public.appointments FOR INSERT WITH CHECK (auth.uid() = patient_id);
CREATE POLICY "appointments_self_update" ON public.appointments FOR UPDATE USING (auth.uid() = patient_id AND status = 'pending');
CREATE POLICY "appointments_admin_all" ON public.appointments FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
);

CREATE POLICY "comments_self_read" ON public.comments FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "comments_self_insert" ON public.comments FOR INSERT WITH CHECK (auth.uid() = patient_id);
CREATE POLICY "comments_approved_public" ON public.comments FOR SELECT USING (status = 'approved');
CREATE POLICY "comments_admin_all" ON public.comments FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
);

CREATE POLICY "point_tx_self_read" ON public.point_transactions FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "point_tx_admin_all" ON public.point_transactions FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
);

CREATE POLICY "point_settings_public_read" ON public.point_settings FOR SELECT USING (true);
CREATE POLICY "point_settings_super_admin_write" ON public.point_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid() AND role = 'super_admin')
);

-- 4) Seed offices (stable IDs match app/api/init-db/route.ts)
INSERT INTO public.offices (id, name, city, address, phone, available_days)
VALUES
  (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
    'کلینیک تهران',
    'تهران',
    'تهران، خیابان ولیعصر',
    '021-12345678',
    ARRAY['wednesday']::text[]
  ),
  (
    'b2c3d4e5-f6a7-8901-bcde-f12345678901'::uuid,
    'مطب کرج',
    'کرج',
    'کرج، خیابان طالقانی',
    '026-12345678',
    ARRAY['saturday', 'sunday', 'tuesday']::text[]
  )
ON CONFLICT (id) DO NOTHING;

-- 5) Default point settings (single row)
INSERT INTO public.point_settings (points_per_comment, toman_per_point, max_redeem_per_visit)
SELECT 100, 10, 50000
WHERE NOT EXISTS (SELECT 1 FROM public.point_settings LIMIT 1);

-- 6) Procedures sample data (only if table is empty)
INSERT INTO public.procedures (name, name_fa, description_fa, category, price, duration_minutes, display_order)
SELECT * FROM (VALUES
  ('Botox', 'بوتاکس', 'تزریق بوتاکس برای رفع چین و چروک صورت', 'تزریقی', 2500000, 45, 1),
  ('Filler', 'فیلر', 'تزریق فیلر برای حجم‌دهی و رفع افتادگی', 'تزریقی', 3500000, 60, 2),
  ('Chemical Peel', 'پیل شیمیایی', 'لایه‌برداری شیمیایی برای بهبود بافت پوست', 'لایه‌برداری', 1500000, 60, 3),
  ('Microneedling', 'میکرونیدلینگ', 'درمان جوان‌سازی پوست با میکرونیدلینگ', 'جوان‌سازی', 2000000, 90, 4),
  ('Laser Hair Removal', 'لیزر موهای زائد', 'حذف دائمی موهای زائد با لیزر', 'لیزر', 1800000, 60, 5),
  ('Carbon Laser', 'لیزر کربن', 'درمان جوش و بهبود بافت پوست با لیزر کربن', 'لیزر', 2200000, 45, 6),
  ('PRP', 'پی‌آر‌پی', 'جوان‌سازی پوست با پلاسمای غنی از پلاکت', 'جوان‌سازی', 2800000, 75, 7),
  ('Consultation', 'ویزیت و مشاوره', 'ویزیت تخصصی پوست، مو و زیبایی', 'مشاوره', 350000, 30, 8)
) AS v(name, name_fa, description_fa, category, price, duration_minutes, display_order)
WHERE NOT EXISTS (SELECT 1 FROM public.procedures LIMIT 1);

-- 6b) Demo time slots (first run only — enables FK tests / future booking inserts)
INSERT INTO public.time_slots (office_id, slot_date, start_time, end_time)
SELECT * FROM (
  VALUES
    ('a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid, (CURRENT_DATE + 1)::date, '14:30'::time, '15:00'::time),
    ('a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid, (CURRENT_DATE + 1)::date, '15:00'::time, '15:30'::time),
    ('b2c3d4e5-f6a7-8901-bcde-f12345678901'::uuid, (CURRENT_DATE + 2)::date, '09:00'::time, '09:30'::time),
    ('b2c3d4e5-f6a7-8901-bcde-f12345678901'::uuid, (CURRENT_DATE + 2)::date, '10:00'::time, '10:30'::time)
) AS v(office_id, slot_date, start_time, end_time)
WHERE NOT EXISTS (SELECT 1 FROM public.time_slots LIMIT 1);

-- 7) Auth trigger: auto-create patient row (from scripts/002_triggers_functions.sql)
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.approve_comment_and_award_points(
  p_comment_id UUID,
  p_admin_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_patient_id UUID;
  v_points_per_comment INTEGER;
BEGIN
  SELECT points_per_comment INTO v_points_per_comment FROM public.point_settings LIMIT 1;
  IF v_points_per_comment IS NULL THEN v_points_per_comment := 100; END IF;

  SELECT patient_id INTO v_patient_id FROM public.comments WHERE id = p_comment_id;

  UPDATE public.comments
  SET status = 'approved', points_awarded = v_points_per_comment,
      reviewed_at = NOW(), reviewed_by = p_admin_id
  WHERE id = p_comment_id;

  UPDATE public.patients
  SET points = points + v_points_per_comment,
      total_points_earned = total_points_earned + v_points_per_comment,
      updated_at = NOW()
  WHERE id = v_patient_id;

  INSERT INTO public.point_transactions (patient_id, type, points, description_fa, reference_id)
  VALUES (v_patient_id, 'earned_comment', v_points_per_comment, 'امتیاز دریافتی بابت نظر تایید شده', p_comment_id);
END;
$$;

CREATE OR REPLACE FUNCTION public.redeem_points(
  p_patient_id UUID,
  p_appointment_id UUID,
  p_points_to_redeem INTEGER
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_points INTEGER;
  v_toman_per_point INTEGER;
  v_max_redeem INTEGER;
  v_toman_value INTEGER;
BEGIN
  SELECT points INTO v_current_points FROM public.patients WHERE id = p_patient_id;
  SELECT toman_per_point, max_redeem_per_visit INTO v_toman_per_point, v_max_redeem FROM public.point_settings LIMIT 1;

  IF p_points_to_redeem > v_current_points THEN
    RAISE EXCEPTION 'امتیاز کافی ندارید';
  END IF;

  v_toman_value := p_points_to_redeem * v_toman_per_point;
  IF v_toman_value > v_max_redeem THEN
    v_toman_value := v_max_redeem;
  END IF;

  UPDATE public.patients SET points = points - p_points_to_redeem, updated_at = NOW()
  WHERE id = p_patient_id;

  UPDATE public.appointments
  SET points_redeemed = p_points_to_redeem, points_redeemed_value = v_toman_value
  WHERE id = p_appointment_id;

  INSERT INTO public.point_transactions (patient_id, type, points, toman_value, description_fa, reference_id)
  VALUES (p_patient_id, 'redeemed', -p_points_to_redeem, v_toman_value, 'استفاده از امتیاز در ویزیت', p_appointment_id);

  RETURN v_toman_value;
END;
$$;

COMMIT;
