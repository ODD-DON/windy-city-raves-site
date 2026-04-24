import { createClient } from '@/lib/supabase/server'
import { AdminDashboard } from '@/components/admin-applicants/admin-dashboard'
import type { Application, ApplicationStatus, ApplicantType } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function ApplicantsPage() {
  const supabase = await createClient()

  // Fetch all applications
  const { data: applications, error } = await supabase
    .from('wcr_jobs_applications')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching applications:', error)
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
          <p className="text-red-400">Failed to load applications. Please try again.</p>
        </div>
      </div>
    )
  }

  const apps = (applications ?? []) as Application[]

  // Calculate stats
  const stats = {
    total: apps.length,
    new: apps.filter(a => a.status === 'new').length,
    reviewed: apps.filter(a => a.status === 'reviewed').length,
    shortlisted: apps.filter(a => a.status === 'shortlisted').length,
    approved: apps.filter(a => a.status === 'approved').length,
    rejected: apps.filter(a => a.status === 'rejected').length,
    archived: apps.filter(a => a.status === 'archived').length,
    by_type: {
      dj: apps.filter(a => a.applicant_type === 'dj').length,
      photo_video: apps.filter(a => a.applicant_type === 'photo_video').length,
      performer: apps.filter(a => a.applicant_type === 'performer').length,
    }
  }

  return <AdminDashboard applications={apps} stats={stats} />
}
