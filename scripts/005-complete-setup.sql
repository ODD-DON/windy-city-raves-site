-- ============================================================
-- WINDY CITY RAVES - COMPLETE DATABASE SETUP
-- This script runs all migrations in order
-- ============================================================

-- 1. EVENT ADMIN OVERRIDES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS wcr_event_calendar_event_admin_overrides (
  id SERIAL PRIMARY KEY,
  edmtrain_event_id INTEGER NOT NULL UNIQUE,
  featured BOOLEAN DEFAULT FALSE,
  featured_style TEXT,
  featured_rank INTEGER,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wcr_event_calendar_overrides_event_id 
ON wcr_event_calendar_event_admin_overrides(edmtrain_event_id);

CREATE INDEX IF NOT EXISTS idx_wcr_event_calendar_overrides_featured 
ON wcr_event_calendar_event_admin_overrides(featured) 
WHERE featured = TRUE;

CREATE OR REPLACE FUNCTION update_wcr_event_calendar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_wcr_event_calendar_updated_at ON wcr_event_calendar_event_admin_overrides;

CREATE TRIGGER trigger_wcr_event_calendar_updated_at
BEFORE UPDATE ON wcr_event_calendar_event_admin_overrides
FOR EACH ROW
EXECUTE FUNCTION update_wcr_event_calendar_updated_at();

-- 2. VENUE OVERRIDES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS wcr_event_calendar_venue_overrides (
  id SERIAL PRIMARY KEY,
  venue_id INTEGER NOT NULL UNIQUE,
  venue_name TEXT NOT NULL,
  custom_url TEXT,
  uses_google BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_venue_overrides_venue_id ON wcr_event_calendar_venue_overrides(venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_overrides_venue_name ON wcr_event_calendar_venue_overrides(venue_name);

COMMENT ON TABLE wcr_event_calendar_venue_overrides IS 'Stores custom ticket URL overrides for venues in the WCR event calendar';

-- 3. CUSTOM EVENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS wcr_event_calendar_custom_events (
  id SERIAL PRIMARY KEY,
  event_id INTEGER UNIQUE NOT NULL DEFAULT (-(nextval('wcr_event_calendar_custom_events_id_seq')::int)),
  
  name TEXT NOT NULL,
  headliner TEXT NOT NULL,
  date DATE NOT NULL,
  start_time TEXT,
  end_time TEXT,
  ages TEXT,
  
  venue_id INTEGER NOT NULL,
  venue_name TEXT NOT NULL,
  venue_location TEXT DEFAULT 'Chicago, IL',
  venue_address TEXT,
  
  artists JSONB NOT NULL DEFAULT '[]',
  
  is_festival BOOLEAN DEFAULT FALSE,
  is_electronic BOOLEAN DEFAULT TRUE,
  
  ticket_url TEXT,
  image_url TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

ALTER TABLE wcr_event_calendar_custom_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read access" ON wcr_event_calendar_custom_events;
CREATE POLICY "Allow read access" ON wcr_event_calendar_custom_events
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated insert" ON wcr_event_calendar_custom_events;
CREATE POLICY "Allow authenticated insert" ON wcr_event_calendar_custom_events
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated update" ON wcr_event_calendar_custom_events;
CREATE POLICY "Allow authenticated update" ON wcr_event_calendar_custom_events
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow authenticated delete" ON wcr_event_calendar_custom_events;
CREATE POLICY "Allow authenticated delete" ON wcr_event_calendar_custom_events
  FOR DELETE USING (true);

CREATE INDEX IF NOT EXISTS idx_custom_events_date ON wcr_event_calendar_custom_events(date);

-- 4. WCR JOBS APPLICATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.wcr_jobs_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id TEXT NOT NULL DEFAULT 'WCR_JOBS',

  applicant_type TEXT NOT NULL CHECK (applicant_type IN ('dj', 'photo_video', 'performer')),

  full_name TEXT NOT NULL,
  stage_name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  city TEXT,
  state TEXT,

  instagram_link TEXT,
  instagram_follower_count INTEGER,
  tiktok_link TEXT,
  tiktok_follower_count INTEGER,
  total_audience_reach INTEGER,

  willing_to_promote_event BOOLEAN,
  willing_to_work_in_chicago BOOLEAN,
  willing_to_work_in_suburbs BOOLEAN,

  desired_pay TEXT,

  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'shortlisted', 'approved', 'rejected', 'archived')),
  internal_rating INTEGER CHECK (internal_rating BETWEEN 1 AND 10),
  internal_notes TEXT,
  tags TEXT[] DEFAULT '{}',
  is_favorite BOOLEAN DEFAULT false,

  additional_notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. DJ PROFILES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.wcr_jobs_dj_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id TEXT NOT NULL DEFAULT 'WCR_JOBS',
  application_id UUID NOT NULL REFERENCES public.wcr_jobs_applications(id) ON DELETE CASCADE,

  genres TEXT[],
  dj_setup TEXT,
  age INTEGER,
  mix_link TEXT,
  soundcloud_link TEXT,
  soundcloud_followers INTEGER,
  facebook_link TEXT,
  has_sold_tickets_before BOOLEAN,
  can_sell_15_tickets BOOLEAN,
  desired_pay_for_1_hour_set TEXT,
  biggest_show TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. PHOTO PROFILES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.wcr_jobs_photo_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id TEXT NOT NULL DEFAULT 'WCR_JOBS',
  application_id UUID NOT NULL REFERENCES public.wcr_jobs_applications(id) ON DELETE CASCADE,

  role_type TEXT CHECK (role_type IN ('photographer', 'videographer', 'both')),
  years_experience INTEGER,
  event_types_shot TEXT[],
  portfolio_link TEXT,
  best_work_link TEXT,
  available_for_5_hour_shift BOOLEAN,
  comfortable_low_light BOOLEAN,
  has_own_equipment BOOLEAN,
  equipment_list TEXT,
  typical_turnaround_time TEXT,
  deliverables TEXT[],
  open_to_posting_content BOOLEAN,
  desired_pay_for_5_hour_shift TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. PERFORMER PROFILES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.wcr_jobs_performer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id TEXT NOT NULL DEFAULT 'WCR_JOBS',
  application_id UUID NOT NULL REFERENCES public.wcr_jobs_applications(id) ON DELETE CASCADE,

  performer_type TEXT,
  years_experience INTEGER,
  performance_styles TEXT[],
  portfolio_link TEXT,
  best_work_link TEXT,
  comfortable_in_nightlife_environment BOOLEAN,
  able_to_perform_multiple_sets BOOLEAN,
  provides_own_outfits BOOLEAN,
  solo_group_or_both TEXT,
  uses_fire BOOLEAN,
  fire_experience_and_insurance TEXT,
  open_to_promoting_event BOOLEAN,
  desired_pay TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. ADMIN NOTES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.wcr_jobs_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id TEXT NOT NULL DEFAULT 'WCR_JOBS',
  application_id UUID NOT NULL REFERENCES public.wcr_jobs_applications(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. ADMIN USERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.wcr_jobs_admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  app_id TEXT NOT NULL DEFAULT 'WCR_JOBS',
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES FOR WCR_JOBS TABLES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_wcr_jobs_applications_app_id ON public.wcr_jobs_applications(app_id);
CREATE INDEX IF NOT EXISTS idx_wcr_jobs_applications_applicant_type ON public.wcr_jobs_applications(applicant_type);
CREATE INDEX IF NOT EXISTS idx_wcr_jobs_applications_status ON public.wcr_jobs_applications(status);
CREATE INDEX IF NOT EXISTS idx_wcr_jobs_applications_city ON public.wcr_jobs_applications(city);
CREATE INDEX IF NOT EXISTS idx_wcr_jobs_applications_state ON public.wcr_jobs_applications(state);
CREATE INDEX IF NOT EXISTS idx_wcr_jobs_applications_instagram_followers ON public.wcr_jobs_applications(instagram_follower_count);
CREATE INDEX IF NOT EXISTS idx_wcr_jobs_applications_created_at ON public.wcr_jobs_applications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wcr_jobs_applications_email ON public.wcr_jobs_applications(email);

CREATE INDEX IF NOT EXISTS idx_wcr_jobs_dj_profiles_application_id ON public.wcr_jobs_dj_profiles(application_id);
CREATE INDEX IF NOT EXISTS idx_wcr_jobs_photo_profiles_application_id ON public.wcr_jobs_photo_profiles(application_id);
CREATE INDEX IF NOT EXISTS idx_wcr_jobs_performer_profiles_application_id ON public.wcr_jobs_performer_profiles(application_id);
CREATE INDEX IF NOT EXISTS idx_wcr_jobs_notes_application_id ON public.wcr_jobs_notes(application_id);

-- ============================================================
-- AUTO-UPDATE TRIGGERS
-- ============================================================
CREATE OR REPLACE FUNCTION public.wcr_jobs_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS wcr_jobs_applications_updated_at ON public.wcr_jobs_applications;
CREATE TRIGGER wcr_jobs_applications_updated_at
  BEFORE UPDATE ON public.wcr_jobs_applications
  FOR EACH ROW EXECUTE FUNCTION public.wcr_jobs_set_updated_at();

DROP TRIGGER IF EXISTS wcr_jobs_notes_updated_at ON public.wcr_jobs_notes;
CREATE TRIGGER wcr_jobs_notes_updated_at
  BEFORE UPDATE ON public.wcr_jobs_notes
  FOR EACH ROW EXECUTE FUNCTION public.wcr_jobs_set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY FOR WCR_JOBS
-- ============================================================
ALTER TABLE public.wcr_jobs_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wcr_jobs_dj_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wcr_jobs_photo_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wcr_jobs_performer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wcr_jobs_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wcr_jobs_admin_users ENABLE ROW LEVEL SECURITY;

-- Public INSERT for applications
DROP POLICY IF EXISTS "wcr_jobs_public_insert_applications" ON public.wcr_jobs_applications;
CREATE POLICY "wcr_jobs_public_insert_applications"
  ON public.wcr_jobs_applications FOR INSERT
  WITH CHECK (true);

-- Admins can SELECT/UPDATE/DELETE applications
DROP POLICY IF EXISTS "wcr_jobs_admins_select_applications" ON public.wcr_jobs_applications;
CREATE POLICY "wcr_jobs_admins_select_applications"
  ON public.wcr_jobs_applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.wcr_jobs_admin_users
      WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "wcr_jobs_admins_update_applications" ON public.wcr_jobs_applications;
CREATE POLICY "wcr_jobs_admins_update_applications"
  ON public.wcr_jobs_applications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.wcr_jobs_admin_users
      WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "wcr_jobs_admins_delete_applications" ON public.wcr_jobs_applications;
CREATE POLICY "wcr_jobs_admins_delete_applications"
  ON public.wcr_jobs_applications FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.wcr_jobs_admin_users
      WHERE id = auth.uid()
    )
  );

-- Public INSERT for role-specific profiles
DROP POLICY IF EXISTS "wcr_jobs_public_insert_dj_profiles" ON public.wcr_jobs_dj_profiles;
CREATE POLICY "wcr_jobs_public_insert_dj_profiles"
  ON public.wcr_jobs_dj_profiles FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "wcr_jobs_public_insert_photo_profiles" ON public.wcr_jobs_photo_profiles;
CREATE POLICY "wcr_jobs_public_insert_photo_profiles"
  ON public.wcr_jobs_photo_profiles FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "wcr_jobs_public_insert_performer_profiles" ON public.wcr_jobs_performer_profiles;
CREATE POLICY "wcr_jobs_public_insert_performer_profiles"
  ON public.wcr_jobs_performer_profiles FOR INSERT WITH CHECK (true);

-- Admins SELECT for role-specific profiles
DROP POLICY IF EXISTS "wcr_jobs_admins_select_dj_profiles" ON public.wcr_jobs_dj_profiles;
CREATE POLICY "wcr_jobs_admins_select_dj_profiles"
  ON public.wcr_jobs_dj_profiles FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.wcr_jobs_admin_users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "wcr_jobs_admins_select_photo_profiles" ON public.wcr_jobs_photo_profiles;
CREATE POLICY "wcr_jobs_admins_select_photo_profiles"
  ON public.wcr_jobs_photo_profiles FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.wcr_jobs_admin_users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "wcr_jobs_admins_select_performer_profiles" ON public.wcr_jobs_performer_profiles;
CREATE POLICY "wcr_jobs_admins_select_performer_profiles"
  ON public.wcr_jobs_performer_profiles FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.wcr_jobs_admin_users WHERE id = auth.uid()));

-- Admins only for notes
DROP POLICY IF EXISTS "wcr_jobs_admins_all_notes" ON public.wcr_jobs_notes;
CREATE POLICY "wcr_jobs_admins_all_notes"
  ON public.wcr_jobs_notes FOR ALL
  USING (EXISTS (SELECT 1 FROM public.wcr_jobs_admin_users WHERE id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.wcr_jobs_admin_users WHERE id = auth.uid()));

-- Admin users table policy
DROP POLICY IF EXISTS "wcr_jobs_admins_select_admin_users" ON public.wcr_jobs_admin_users;
CREATE POLICY "wcr_jobs_admins_select_admin_users"
  ON public.wcr_jobs_admin_users FOR SELECT
  USING (id = auth.uid());

-- ============================================================
-- GRANT PERMISSIONS FOR ANON ROLE
-- ============================================================
GRANT INSERT ON public.wcr_jobs_applications TO anon;
GRANT INSERT ON public.wcr_jobs_dj_profiles TO anon;
GRANT INSERT ON public.wcr_jobs_photo_profiles TO anon;
GRANT INSERT ON public.wcr_jobs_performer_profiles TO anon;
GRANT SELECT ON public.wcr_jobs_applications TO anon;

-- ============================================================
-- STORAGE BUCKET FOR EVENT IMAGES
-- ============================================================
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

-- Storage policies
DROP POLICY IF EXISTS "Public read access for wcr-event-calendar" ON storage.objects;
CREATE POLICY "Public read access for wcr-event-calendar"
ON storage.objects FOR SELECT
USING (bucket_id = 'wcr-event-calendar');

DROP POLICY IF EXISTS "Authenticated upload for wcr-event-calendar" ON storage.objects;
CREATE POLICY "Authenticated upload for wcr-event-calendar"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'wcr-event-calendar');

DROP POLICY IF EXISTS "Authenticated update for wcr-event-calendar" ON storage.objects;
CREATE POLICY "Authenticated update for wcr-event-calendar"
ON storage.objects FOR UPDATE
USING (bucket_id = 'wcr-event-calendar');

DROP POLICY IF EXISTS "Authenticated delete for wcr-event-calendar" ON storage.objects;
CREATE POLICY "Authenticated delete for wcr-event-calendar"
ON storage.objects FOR DELETE
USING (bucket_id = 'wcr-event-calendar');
