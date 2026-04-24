-- Create storage bucket for event images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'wcr-event-calendar',
  'wcr-event-calendar',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- Drop existing policies if they exist and recreate
DROP POLICY IF EXISTS "Public read access for wcr-event-calendar" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload for wcr-event-calendar" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update for wcr-event-calendar" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete for wcr-event-calendar" ON storage.objects;

-- Allow public read access
CREATE POLICY "Public read access for wcr-event-calendar"
ON storage.objects FOR SELECT
USING (bucket_id = 'wcr-event-calendar');

-- Allow authenticated uploads
CREATE POLICY "Authenticated upload for wcr-event-calendar"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'wcr-event-calendar');

-- Allow authenticated updates
CREATE POLICY "Authenticated update for wcr-event-calendar"
ON storage.objects FOR UPDATE
USING (bucket_id = 'wcr-event-calendar');

-- Allow authenticated deletes
CREATE POLICY "Authenticated delete for wcr-event-calendar"
ON storage.objects FOR DELETE
USING (bucket_id = 'wcr-event-calendar');
