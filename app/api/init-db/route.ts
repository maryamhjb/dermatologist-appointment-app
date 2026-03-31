import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const supabase = await createClient()

    // Create tables with RLS
    const { error: schemaError } = await supabase.rpc('exec', {
      sql: `
        -- OFFICES
        CREATE TABLE IF NOT EXISTS public.offices (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL,
          city TEXT NOT NULL,
          address TEXT NOT NULL,
          phone TEXT,
          available_days TEXT[] NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        ALTER TABLE public.offices ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "offices_public_read" ON public.offices FOR SELECT USING (true);

        -- ADMIN USERS
        CREATE TABLE IF NOT EXISTS public.admin_users (
          id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
          full_name TEXT NOT NULL,
          role TEXT NOT NULL CHECK (role IN ('super_admin', 'assistant')),
          email TEXT NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "admin_users_self_read" ON public.admin_users FOR SELECT USING (auth.uid() = id);

        -- PATIENTS
        CREATE TABLE IF NOT EXISTS public.patients (
          id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
          full_name TEXT NOT NULL,
          phone TEXT NOT NULL UNIQUE,
          points INTEGER NOT NULL DEFAULT 0,
          total_points_earned INTEGER NOT NULL DEFAULT 0,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "patients_self_read" ON public.patients FOR SELECT USING (auth.uid() = id);
        CREATE POLICY "patients_self_update" ON public.patients FOR UPDATE USING (auth.uid() = id);
        CREATE POLICY "patients_self_insert" ON public.patients FOR INSERT WITH CHECK (auth.uid() = id);

        -- PROCEDURES
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

        ALTER TABLE public.procedures ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "procedures_public_read" ON public.procedures FOR SELECT USING (is_active = true);

        -- TIME SLOTS
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

        ALTER TABLE public.time_slots ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "time_slots_public_read" ON public.time_slots FOR SELECT USING (true);

        -- APPOINTMENTS
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

        ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "appointments_self_read" ON public.appointments FOR SELECT USING (auth.uid() = patient_id);
        CREATE POLICY "appointments_self_insert" ON public.appointments FOR INSERT WITH CHECK (auth.uid() = patient_id);

        -- COMMENTS
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

        ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "comments_self_read" ON public.comments FOR SELECT USING (auth.uid() = patient_id);
        CREATE POLICY "comments_self_insert" ON public.comments FOR INSERT WITH CHECK (auth.uid() = patient_id);
        CREATE POLICY "comments_approved_public" ON public.comments FOR SELECT USING (status = 'approved');

        -- POINT TRANSACTIONS
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

        ALTER TABLE public.point_transactions ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "point_tx_self_read" ON public.point_transactions FOR SELECT USING (auth.uid() = patient_id);

        -- POINT SETTINGS
        CREATE TABLE IF NOT EXISTS public.point_settings (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          points_per_comment INTEGER NOT NULL DEFAULT 100,
          toman_per_point INTEGER NOT NULL DEFAULT 10,
          max_redeem_per_visit INTEGER NOT NULL DEFAULT 50000,
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          updated_by UUID REFERENCES public.admin_users(id)
        );

        ALTER TABLE public.point_settings ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "point_settings_public_read" ON public.point_settings FOR SELECT USING (true);
      `
    })

    if (schemaError) {
      console.error('Schema error:', schemaError)
      return NextResponse.json({ error: 'Failed to create schema' }, { status: 500 })
    }

    // Seed data
    const { error: seedError } = await supabase.from('offices').insert([
      {
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        name: 'کلینیک تهران',
        city: 'تهران',
        address: 'تهران، خیابان ولیعصر',
        phone: '021-12345678',
        available_days: ['wednesday']
      },
      {
        id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
        name: 'مطب کرج',
        city: 'کرج',
        address: 'کرج، خیابان طالقانی',
        phone: '026-12345678',
        available_days: ['saturday', 'sunday', 'tuesday']
      }
    ])

    if (seedError && !seedError.message.includes('duplicate')) {
      console.error('Seed error:', seedError)
    }

    return NextResponse.json({ message: 'Database initialized successfully' })
  } catch (error) {
    console.error('Init error:', error)
    return NextResponse.json({ error: 'Database initialization failed' }, { status: 500 })
  }
}
