-- dr.maryam dermatology app - database schema

-- OFFICES table
CREATE TABLE IF NOT EXISTS public.offices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT,
  available_days TEXT[] NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ADMIN USERS table
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'assistant')),
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PATIENTS table
CREATE TABLE IF NOT EXISTS public.patients (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  points INTEGER NOT NULL DEFAULT 0,
  total_points_earned INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROCEDURES table
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

-- TIME SLOTS table
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

-- APPOINTMENTS table
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

-- COMMENTS table
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

-- POINT TRANSACTIONS table
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

-- POINT SETTINGS table
CREATE TABLE IF NOT EXISTS public.point_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  points_per_comment INTEGER NOT NULL DEFAULT 100,
  toman_per_point INTEGER NOT NULL DEFAULT 10,
  max_redeem_per_visit INTEGER NOT NULL DEFAULT 50000,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES public.admin_users(id)
);
