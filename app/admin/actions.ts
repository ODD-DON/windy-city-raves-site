'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deleteApplication(id: string) {
  const supabase = await createClient()

  // Delete related profile data first (due to foreign key constraints)
  await supabase.from('wcr_jobs_dj_profiles').delete().eq('application_id', id)
  await supabase.from('wcr_jobs_photo_profiles').delete().eq('application_id', id)
  await supabase.from('wcr_jobs_performer_profiles').delete().eq('application_id', id)
  await supabase.from('wcr_jobs_notes').delete().eq('application_id', id)

  // Delete the application
  const { error } = await supabase
    .from('wcr_jobs_applications')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting application:', error)
    throw new Error('Failed to delete application')
  }

  revalidatePath('/admin/applicants')
}

export async function updateApplicationStatus(id: string, status: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('wcr_jobs_applications')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    console.error('Error updating application status:', error)
    throw new Error('Failed to update status')
  }

  revalidatePath('/admin/applicants')
  revalidatePath(`/admin/applicants/${id}`)
}

export async function updateApplicationRating(id: string, rating: number) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('wcr_jobs_applications')
    .update({ internal_rating: rating, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    console.error('Error updating rating:', error)
    throw new Error('Failed to update rating')
  }

  revalidatePath('/admin/applicants')
  revalidatePath(`/admin/applicants/${id}`)
}

export async function toggleFavorite(id: string, isFavorite: boolean) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('wcr_jobs_applications')
    .update({ is_favorite: isFavorite, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    console.error('Error toggling favorite:', error)
    throw new Error('Failed to update favorite')
  }

  revalidatePath('/admin/applicants')
  revalidatePath(`/admin/applicants/${id}`)
}

export async function addNote(applicationId: string, content: string, authorName: string = 'Admin') {
  const supabase = await createClient()

  const { error } = await supabase
    .from('wcr_jobs_notes')
    .insert({
      application_id: applicationId,
      content,
      author_name: authorName,
    })

  if (error) {
    console.error('Error adding note:', error)
    throw new Error('Failed to add note')
  }

  revalidatePath(`/admin/applicants/${applicationId}`)
}
