-- Seed initial data

-- Insert offices
INSERT INTO public.offices (id, name, city, address, phone, available_days) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'مطب تهران', 'تهران', 'تهران، خیابان ولیعصر', '021-12345678', ARRAY['wednesday']);

INSERT INTO public.offices (id, name, city, address, phone, available_days) VALUES
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'مطب کرج', 'کرج', 'کرج، خیابان طالقانی', '026-12345678', ARRAY['saturday', 'sunday', 'tuesday']);

-- Insert default point settings
INSERT INTO public.point_settings (points_per_comment, toman_per_point, max_redeem_per_visit) VALUES (100, 10, 50000);

-- Insert sample procedures
INSERT INTO public.procedures (name, name_fa, description_fa, category, price, duration_minutes, display_order) VALUES 
  ('Botox', 'بوتاکس', 'تزریق بوتاکس برای رفع چین و چروک صورت', 'تزریقی', 2500000, 45, 1);
INSERT INTO public.procedures (name, name_fa, description_fa, category, price, duration_minutes, display_order) VALUES 
  ('Filler', 'فیلر', 'تزریق فیلر برای حجم‌دهی و رفع افتادگی', 'تزریقی', 3500000, 60, 2);
INSERT INTO public.procedures (name, name_fa, description_fa, category, price, duration_minutes, display_order) VALUES 
  ('Chemical Peel', 'پیل شیمیایی', 'لایه‌برداری شیمیایی برای بهبود بافت پوست', 'لایه‌برداری', 1500000, 60, 3);
INSERT INTO public.procedures (name, name_fa, description_fa, category, price, duration_minutes, display_order) VALUES 
  ('Microneedling', 'میکرونیدلینگ', 'درمان جوان‌سازی پوست با میکرونیدلینگ', 'جوان‌سازی', 2000000, 90, 4);
INSERT INTO public.procedures (name, name_fa, description_fa, category, price, duration_minutes, display_order) VALUES 
  ('Laser Hair Removal', 'لیزر موهای زائد', 'حذف دائمی موهای زائد با لیزر', 'لیزر', 1800000, 60, 5);
INSERT INTO public.procedures (name, name_fa, description_fa, category, price, duration_minutes, display_order) VALUES 
  ('Carbon Laser', 'لیزر کربن', 'درمان جوش و بهبود بافت پوست با لیزر کربن', 'لیزر', 2200000, 45, 6);
INSERT INTO public.procedures (name, name_fa, description_fa, category, price, duration_minutes, display_order) VALUES 
  ('PRP', 'پی‌آر‌پی', 'جوان‌سازی پوست با پلاسمای غنی از پلاکت', 'جوان‌سازی', 2800000, 75, 7);
INSERT INTO public.procedures (name, name_fa, description_fa, category, price, duration_minutes, display_order) VALUES 
  ('Consultation', 'ویزیت و مشاوره', 'ویزیت تخصصی پوست، مو و زیبایی', 'مشاوره', 350000, 30, 8);
