-- ============================================================
-- WCR JOBS - Windy City Raves Talent Application Schema
-- Namespace: wcr_jobs_*
-- All tables include app_id for future project isolation
-- ============================================================

-- APPLICATIONS (unified table for all applicant types)
CREATE TABLE IF NOT EXISTS public.wcr_jobs_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id TEXT NOT NULL DEFAULT 'WCR_JOBS',

  -- Role
  applicant_type TEXT NOT NULL CHECK (applicant_type IN ('dj', 'photo_video', 'performer')),

  -- Personal Info
  full_name TEXT NOT NULL,
  stage_name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  city TEXT,
  state TEXT,

  -- Social Media
  instagram_link TEXT,
  instagram_follower_count INTEGER,
  tiktok_link TEXT,
  tiktok_follower_count INTEGER,
  total_audience_reach INTEGER,

  -- Availability / Promotion
  willing_to_promote_event BOOLEAN,
  willing_to_work_in_chicago BOOLEAN,
  willing_to_work_in_suburbs BOOLEAN,

  -- Compensation
  desired_pay TEXT,

  -- Admin Fields
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'shortlisted', 'approved', 'rejected', 'archived')),
  internal_rating INTEGER CHECK (internal_rating BETWEEN 1 AND 10),
  internal_notes TEXT,
  tags TEXT[] DEFAULT '{}',
  is_favorite BOOLEAN DEFAULT false,

  -- Additional
  additional_notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- DJ PROFILES
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

-- PHOTO / VIDEO PROFILES
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

-- PERFORMER PROFILES
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

-- ADMIN NOTES
CREATE TABLE IF NOT EXISTS public.wcr_jobs_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id TEXT NOT NULL DEFAULT 'WCR_JOBS',
  application_id UUID NOT NULL REFERENCES public.wcr_jobs_applications(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ADMIN USERS
CREATE TABLE IF NOT EXISTS public.wcr_jobs_admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  app_id TEXT NOT NULL DEFAULT 'WCR_JOBS',
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
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
-- AUTO-UPDATE updated_at TRIGGER
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
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.wcr_jobs_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wcr_jobs_dj_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wcr_jobs_photo_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wcr_jobs_performer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wcr_jobs_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wcr_jobs_admin_users ENABLE ROW LEVEL SECURITY;

-- Public can INSERT applications (submit forms)
CREATE POLICY "wcr_jobs_public_insert_applications"
  ON public.wcr_jobs_applications FOR INSERT
  WITH CHECK (true);

-- Admins can SELECT/UPDATE/DELETE all applications
CREATE POLICY "wcr_jobs_admins_select_applications"
  ON public.wcr_jobs_applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.wcr_jobs_admin_users
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "wcr_jobs_admins_update_applications"
  ON public.wcr_jobs_applications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.wcr_jobs_admin_users
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "wcr_jobs_admins_delete_applications"
  ON public.wcr_jobs_applications FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.wcr_jobs_admin_users
      WHERE id = auth.uid()
    )
  );

-- Public can INSERT role-specific profiles
CREATE POLICY "wcr_jobs_public_insert_dj_profiles"
  ON public.wcr_jobs_dj_profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "wcr_jobs_public_insert_photo_profiles"
  ON public.wcr_jobs_photo_profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "wcr_jobs_public_insert_performer_profiles"
  ON public.wcr_jobs_performer_profiles FOR INSERT WITH CHECK (true);

-- Admins can SELECT role-specific profiles
CREATE POLICY "wcr_jobs_admins_select_dj_profiles"
  ON public.wcr_jobs_dj_profiles FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.wcr_jobs_admin_users WHERE id = auth.uid()));
CREATE POLICY "wcr_jobs_admins_select_photo_profiles"
  ON public.wcr_jobs_photo_profiles FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.wcr_jobs_admin_users WHERE id = auth.uid()));
CREATE POLICY "wcr_jobs_admins_select_performer_profiles"
  ON public.wcr_jobs_performer_profiles FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.wcr_jobs_admin_users WHERE id = auth.uid()));

-- Admins only for notes
CREATE POLICY "wcr_jobs_admins_all_notes"
  ON public.wcr_jobs_notes FOR ALL
  USING (EXISTS (SELECT 1 FROM public.wcr_jobs_admin_users WHERE id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.wcr_jobs_admin_users WHERE id = auth.uid()));

-- Admin users table
CREATE POLICY "wcr_jobs_admins_select_admin_users"
  ON public.wcr_jobs_admin_users FOR SELECT
  USING (id = auth.uid());
