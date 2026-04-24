import { cookies } from 'next/headers'
import { AdminDashboard } from '@/components/admin-applicants/admin-dashboard'
import type { Application } from '@/lib/types'

export const dynamic = 'force-dynamic'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export default async function ApplicantsPage() {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get("sb-access-token")?.value

  // Fetch all applications
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/wcr_jobs_applications?select=*&order=created_at.desc`,
    {
      headers: {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${accessToken}`,
      },
      cache: 'no-store'
    }
  )

  if (!res.ok) {
    console.error('Error fetching applications:', res.status)
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
          <p className="text-red-400">Failed to load applications. Please try again.</p>
        </div>
      </div>
    )
  }

  const applications = await res.json()
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
