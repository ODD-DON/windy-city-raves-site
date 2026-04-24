import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { ApplicationWithProfiles } from '@/lib/types'
import { ApplicantDetail } from '@/components/admin-applicants/applicant-detail'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ApplicantDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: application, error } = await supabase
    .from('wcr_jobs_applications')
    .select(
      `
      *,
      wcr_jobs_dj_profiles(*),
      wcr_jobs_photo_profiles(*),
      wcr_jobs_performer_profiles(*),
      wcr_jobs_notes(*)
    `,
    )
    .eq('id', id)
    .single()

  if (error || !application) {
    notFound()
  }

  return <ApplicantDetail application={application as ApplicationWithProfiles} />
}
