-- dr.maryam Dermatology Clinic - Full Database Setup
-- =====================================================

-- Create OFFICES table
CREATE TABLE IF NOT EXISTS public.offices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT,
  available_days TEXT[] NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create ADMIN_USERS table
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'assistant')),
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create PATIENTS table
CREATE TABLE IF NOT EXISTS public.patients (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  points INTEGER NOT NULL DEFAULT 0,
  total_points_earned INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create PROCEDURES table
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

-- Create TIME_SLOTS table
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

-- Create APPOINTMENTS table
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

-- Create COMMENTS table
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

-- Create POINT_TRANSACTIONS table
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

-- Create POINT_SETTINGS table
CREATE TABLE IF NOT EXISTS public.point_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  points_per_comment INTEGER NOT NULL DEFAULT 100,
  toman_per_point INTEGER NOT NULL DEFAULT 10,
  max_redeem_per_visit INTEGER NOT NULL DEFAULT 50000,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES public.admin_users(id)
);

-- =====================================================
-- Enable RLS on all tables
-- =====================================================

ALTER TABLE public.offices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procedures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.point_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.point_settings ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- OFFICES POLICIES
-- =====================================================

CREATE POLICY "offices_public_read" ON public.offices FOR SELECT USING (true);
CREATE POLICY "offices_admin_all" ON public.offices FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
);

-- =====================================================
-- ADMIN_USERS POLICIES
-- =====================================================

CREATE POLICY "admin_users_self_read" ON public.admin_users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "admin_users_super_admin_all" ON public.admin_users FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid() AND role = 'super_admin')
);

-- =====================================================
-- PATIENTS POLICIES
-- =====================================================

CREATE POLICY "patients_self_read" ON public.patients FOR SELECT USING (auth.uid() = id);
CREATE POLICY "patients_self_update" ON public.patients FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "patients_self_insert" ON public.patients FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "patients_admin_read" ON public.patients FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
);
CREATE POLICY "patients_admin_update" ON public.patients FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
);

-- =====================================================
-- PROCEDURES POLICIES
-- =====================================================

CREATE POLICY "procedures_public_read" ON public.procedures FOR SELECT USING (is_active = true);
CREATE POLICY "procedures_admin_all" ON public.procedures FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
);

-- =====================================================
-- TIME_SLOTS POLICIES
-- =====================================================

CREATE POLICY "time_slots_public_read" ON public.time_slots FOR SELECT USING (true);
CREATE POLICY "time_slots_admin_all" ON public.time_slots FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
);

-- =====================================================
-- APPOINTMENTS POLICIES
-- =====================================================

CREATE POLICY "appointments_self_read" ON public.appointments FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "appointments_self_insert" ON public.appointments FOR INSERT WITH CHECK (auth.uid() = patient_id);
CREATE POLICY "appointments_self_update" ON public.appointments FOR UPDATE USING (auth.uid() = patient_id AND status = 'pending');
CREATE POLICY "appointments_admin_all" ON public.appointments FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
);

-- =====================================================
-- COMMENTS POLICIES
-- =====================================================

CREATE POLICY "comments_self_read" ON public.comments FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "comments_self_insert" ON public.comments FOR INSERT WITH CHECK (auth.uid() = patient_id);
CREATE POLICY "comments_approved_public" ON public.comments FOR SELECT USING (status = 'approved');
CREATE POLICY "comments_admin_all" ON public.comments FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
);

-- =====================================================
-- POINT_TRANSACTIONS POLICIES
-- =====================================================

CREATE POLICY "point_tx_self_read" ON public.point_transactions FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "point_tx_admin_all" ON public.point_transactions FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
);

-- =====================================================
-- POINT_SETTINGS POLICIES
-- =====================================================

CREATE POLICY "point_settings_public_read" ON public.point_settings FOR SELECT USING (true);
CREATE POLICY "point_settings_super_admin_write" ON public.point_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid() AND role = 'super_admin')
);

-- =====================================================
-- SEED DATA
-- =====================================================

-- Insert offices (Tehran and Karaj)
INSERT INTO public.offices (name, city, address, phone, available_days) 
VALUES 
  ('مطب تهران', 'تهران', 'سعادت آباد - بلوار کوهستان - رو به روی ایال - پلاک ۱۱', '۰۹۳۰۳۰۱۹۱۰۹', ARRAY['Wednesday'])
ON CONFLICT DO NOTHING;

INSERT INTO public.offices (name, city, address, phone, available_days) 
VALUES 
  ('مطب کرج', 'کرج', 'چهاره طالقانی به سمت میدان شهدا - برج آراد - طبقه هشتم - واحد ۸۰۳', '۰۹۹۱۱۳۲۰۰۳۰', ARRAY['Saturday', 'Sunday', 'Tuesday'])
ON CONFLICT DO NOTHING;

-- Insert default point settings
INSERT INTO public.point_settings (points_per_comment, toman_per_point, max_redeem_per_visit) 
VALUES (100, 10, 50000)
ON CONFLICT DO NOTHING;

-- Insert procedures
INSERT INTO public.procedures (name, name_fa, description_fa, category, price, duration_minutes, display_order) 
VALUES 
  ('Botox', 'بوتاکس', 'تزریق بوتاکس برای رفع چین و چروک صورت', 'تزریقی', 2500000, 45, 1),
  ('Filler', 'فیلر', 'تزریق فیلر برای حجم‌دهی و رفع افتادگی', 'تزریقی', 3500000, 60, 2),
  ('Chemical Peel', 'پیل شیمیایی', 'لایه‌برداری شیمیایی برای بهبود بافت پوست', 'لایه‌برداری', 1500000, 60, 3),
  ('Microneedling', 'میکرونیدلینگ', 'درمان جوان‌سازی پوست با میکرونیدلینگ', 'جوان‌سازی', 2000000, 90, 4),
  ('Laser Hair Removal', 'لیزر موهای زائد', 'حذف دائمی موهای زائد با لیزر', 'لیزر', 1800000, 60, 5),
  ('Carbon Laser', 'لیزر کربن', 'درمان جوش و بهبود بافت پوست با لیزر کربن', 'لیزر', 2200000, 45, 6),
  ('PRP', 'پی‌آر‌پی', 'جوان‌سازی پوست با پلاسمای غنی از پلاکت', 'جوان‌سازی', 2800000, 75, 7),
  ('Consultation', 'ویزیت و مشاوره', 'ویزیت تخصصی پوست، مو و زیبایی', 'مشاوره', 350000, 30, 8)
ON CONFLICT DO NOTHING;
