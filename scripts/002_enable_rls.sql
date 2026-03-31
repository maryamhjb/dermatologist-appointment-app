-- Enable Row Level Security on all tables

ALTER TABLE public.offices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procedures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.point_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.point_settings ENABLE ROW LEVEL SECURITY;

-- OFFICES: anyone can read, admin can write
CREATE POLICY "offices_public_read" ON public.offices FOR SELECT USING (true);
CREATE POLICY "offices_admin_all" ON public.offices FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
);

-- ADMIN USERS: self read, super_admin can manage all
CREATE POLICY "admin_users_self_read" ON public.admin_users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "admin_users_super_admin_all" ON public.admin_users FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid() AND role = 'super_admin')
);

-- PATIENTS: self read/write, admin can read all
CREATE POLICY "patients_self_read" ON public.patients FOR SELECT USING (auth.uid() = id);
CREATE POLICY "patients_self_update" ON public.patients FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "patients_self_insert" ON public.patients FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "patients_admin_read" ON public.patients FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
);
CREATE POLICY "patients_admin_update" ON public.patients FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
);

-- PROCEDURES: anyone can read active, admin can write
CREATE POLICY "procedures_public_read" ON public.procedures FOR SELECT USING (is_active = true);
CREATE POLICY "procedures_admin_all" ON public.procedures FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
);

-- TIME SLOTS: anyone can read, admin can write
CREATE POLICY "time_slots_public_read" ON public.time_slots FOR SELECT USING (true);
CREATE POLICY "time_slots_admin_all" ON public.time_slots FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
);

-- APPOINTMENTS: self read, can insert own, admin can manage all
CREATE POLICY "appointments_self_read" ON public.appointments FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "appointments_self_insert" ON public.appointments FOR INSERT WITH CHECK (auth.uid() = patient_id);
CREATE POLICY "appointments_self_update" ON public.appointments FOR UPDATE USING (auth.uid() = patient_id AND status = 'pending');
CREATE POLICY "appointments_admin_all" ON public.appointments FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
);

-- COMMENTS: self read/insert, approved public read, admin can manage all
CREATE POLICY "comments_self_read" ON public.comments FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "comments_self_insert" ON public.comments FOR INSERT WITH CHECK (auth.uid() = patient_id);
CREATE POLICY "comments_approved_public" ON public.comments FOR SELECT USING (status = 'approved');
CREATE POLICY "comments_admin_all" ON public.comments FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
);

-- POINT TRANSACTIONS: self read, admin can manage all
CREATE POLICY "point_tx_self_read" ON public.point_transactions FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "point_tx_admin_all" ON public.point_transactions FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
);

-- POINT SETTINGS: anyone can read, super_admin can write
CREATE POLICY "point_settings_public_read" ON public.point_settings FOR SELECT USING (true);
CREATE POLICY "point_settings_super_admin_write" ON public.point_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid() AND role = 'super_admin')
);
