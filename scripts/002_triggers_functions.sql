-- ============================================================
-- TRIGGERS: auto-update patient profile on new user signup
-- ============================================================

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
    COALESCE(NEW.raw_user_meta_data ->> 'phone', '')
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

-- ============================================================
-- FUNCTION: approve comment and award points
-- ============================================================

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
  -- Get points setting
  SELECT points_per_comment INTO v_points_per_comment FROM public.point_settings LIMIT 1;
  IF v_points_per_comment IS NULL THEN v_points_per_comment := 100; END IF;

  -- Get patient from comment
  SELECT patient_id INTO v_patient_id FROM public.comments WHERE id = p_comment_id;

  -- Update comment status
  UPDATE public.comments
  SET status = 'approved', points_awarded = v_points_per_comment,
      reviewed_at = NOW(), reviewed_by = p_admin_id
  WHERE id = p_comment_id;

  -- Add points to patient
  UPDATE public.patients
  SET points = points + v_points_per_comment,
      total_points_earned = total_points_earned + v_points_per_comment,
      updated_at = NOW()
  WHERE id = v_patient_id;

  -- Record transaction
  INSERT INTO public.point_transactions (patient_id, type, points, description_fa, reference_id)
  VALUES (v_patient_id, 'earned_comment', v_points_per_comment, 'امتیاز دریافتی بابت نظر تایید شده', p_comment_id);
END;
$$;

-- ============================================================
-- FUNCTION: redeem points at appointment
-- ============================================================

CREATE OR REPLACE FUNCTION public.redeem_points(
  p_patient_id UUID,
  p_appointment_id UUID,
  p_points_to_redeem INTEGER
)
RETURNS INTEGER -- returns toman value
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
    -- Recalculate points from capped toman
  END IF;

  -- Deduct points
  UPDATE public.patients SET points = points - p_points_to_redeem, updated_at = NOW()
  WHERE id = p_patient_id;

  -- Update appointment
  UPDATE public.appointments
  SET points_redeemed = p_points_to_redeem, points_redeemed_value = v_toman_value
  WHERE id = p_appointment_id;

  -- Record transaction
  INSERT INTO public.point_transactions (patient_id, type, points, toman_value, description_fa, reference_id)
  VALUES (p_patient_id, 'redeemed', -p_points_to_redeem, v_toman_value, 'استفاده از امتیاز در ویزیت', p_appointment_id);

  RETURN v_toman_value;
END;
$$;
