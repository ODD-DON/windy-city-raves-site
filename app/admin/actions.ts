'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

async function getAuthHeaders() {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get("sb-access-token")?.value
  return {
    "apikey": SUPABASE_ANON_KEY,
    "Authorization": `Bearer ${accessToken}`,
    "Content-Type": "application/json",
    "Prefer": "return=minimal"
  }
}

export async function deleteApplication(id: string) {
  const headers = await getAuthHeaders()

  // Delete related profile data first (due to foreign key constraints)
  await fetch(`${SUPABASE_URL}/rest/v1/wcr_jobs_dj_profiles?application_id=eq.${id}`, {
    method: 'DELETE',
    headers
  })
  await fetch(`${SUPABASE_URL}/rest/v1/wcr_jobs_photo_profiles?application_id=eq.${id}`, {
    method: 'DELETE',
    headers
  })
  await fetch(`${SUPABASE_URL}/rest/v1/wcr_jobs_performer_profiles?application_id=eq.${id}`, {
    method: 'DELETE',
    headers
  })
  await fetch(`${SUPABASE_URL}/rest/v1/wcr_jobs_notes?application_id=eq.${id}`, {
    method: 'DELETE',
    headers
  })

  // Delete the application
  const res = await fetch(`${SUPABASE_URL}/rest/v1/wcr_jobs_applications?id=eq.${id}`, {
    method: 'DELETE',
    headers
  })

  if (!res.ok) {
    console.error('Error deleting application')
    throw new Error('Failed to delete application')
  }

  revalidatePath('/admin/applicants')
}

export async function updateApplicationStatus(id: string, status: string) {
  const headers = await getAuthHeaders()

  const res = await fetch(`${SUPABASE_URL}/rest/v1/wcr_jobs_applications?id=eq.${id}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ status, updated_at: new Date().toISOString() })
  })

  if (!res.ok) {
    console.error('Error updating application status')
    throw new Error('Failed to update status')
  }

  revalidatePath('/admin/applicants')
  revalidatePath(`/admin/applicants/${id}`)
}

export async function updateApplicationRating(id: string, rating: number) {
  const headers = await getAuthHeaders()

  const res = await fetch(`${SUPABASE_URL}/rest/v1/wcr_jobs_applications?id=eq.${id}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ internal_rating: rating, updated_at: new Date().toISOString() })
  })

  if (!res.ok) {
    console.error('Error updating rating')
    throw new Error('Failed to update rating')
  }

  revalidatePath('/admin/applicants')
  revalidatePath(`/admin/applicants/${id}`)
}

export async function toggleFavorite(id: string, isFavorite: boolean) {
  const headers = await getAuthHeaders()

  const res = await fetch(`${SUPABASE_URL}/rest/v1/wcr_jobs_applications?id=eq.${id}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ is_favorite: isFavorite, updated_at: new Date().toISOString() })
  })

  if (!res.ok) {
    console.error('Error toggling favorite')
    throw new Error('Failed to update favorite')
  }

  revalidatePath('/admin/applicants')
  revalidatePath(`/admin/applicants/${id}`)
}

export async function addNote(applicationId: string, content: string, authorName: string = 'Admin') {
  const headers = await getAuthHeaders()

  const res = await fetch(`${SUPABASE_URL}/rest/v1/wcr_jobs_notes`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      application_id: applicationId,
      content,
      author_name: authorName,
    })
  })

  if (!res.ok) {
    console.error('Error adding note')
    throw new Error('Failed to add note')
  }

  revalidatePath(`/admin/applicants/${applicationId}`)
}
