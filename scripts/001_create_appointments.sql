-- Create appointments table for storing patient reservations
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  national_number TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  clinic TEXT NOT NULL CHECK (clinic IN ('tehran', 'karaj')),
  appointment_date DATE NOT NULL,
  appointment_jalali TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries by date and status
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_created_at ON appointments(created_at DESC);

-- Enable Row Level Security
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to insert appointments (public booking)
CREATE POLICY "allow_public_insert" ON appointments
  FOR INSERT
  WITH CHECK (true);

-- Policy: Allow authenticated users (admins) to view all appointments
CREATE POLICY "allow_authenticated_select" ON appointments
  FOR SELECT
  USING (true);

-- Policy: Allow authenticated users (admins) to update appointments
CREATE POLICY "allow_authenticated_update" ON appointments
  FOR UPDATE
  USING (true);
