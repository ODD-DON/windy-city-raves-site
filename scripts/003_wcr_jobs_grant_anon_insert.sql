-- Grant INSERT privilege to the anon role so unauthenticated users
-- can submit applications. RLS WITH CHECK (true) allows it but the
-- table-level GRANT is also required for the anon role.
GRANT INSERT ON public.wcr_jobs_applications TO anon;
GRANT INSERT ON public.wcr_jobs_dj_profiles TO anon;
GRANT INSERT ON public.wcr_jobs_photo_profiles TO anon;
GRANT INSERT ON public.wcr_jobs_performer_profiles TO anon;

-- Also grant SELECT on wcr_jobs_applications to anon for .select().single()
-- after insert (needed to return the new row id)
GRANT SELECT ON public.wcr_jobs_applications TO anon;
