'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { ApplicationStatus } from '@/lib/types'

export async function updateApplicationStatus(id: string, status: ApplicationStatus) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('wcr_jobs_applications')
    .update({ status })
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin')
  revalidatePath(`/admin/applicants/${id}`)
}

export async function updateApplicationRating(id: string, rating: number) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('wcr_jobs_applications')
    .update({ internal_rating: rating })
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath(`/admin/applicants/${id}`)
}

export async function updateApplicationFavorite(id: string, is_favorite: boolean) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('wcr_jobs_applications')
    .update({ is_favorite })
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath(`/admin/applicants/${id}`)
  revalidatePath('/admin')
}

export async function updateApplicationTags(id: string, tags: string[]) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('wcr_jobs_applications')
    .update({ tags })
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath(`/admin/applicants/${id}`)
}

export async function addNote(application_id: string, content: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('wcr_jobs_notes').insert({
    application_id,
    content,
    created_by: 'admin',
  })
  if (error) throw new Error(error.message)
  revalidatePath(`/admin/applicants/${application_id}`)
}

export async function deleteNote(id: string, application_id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('wcr_jobs_notes').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath(`/admin/applicants/${application_id}`)
}

export async function deleteApplication(id: string) {
  const supabase = await createClient()
  // Delete related profile rows first (FK constraints)
  await supabase.from('wcr_jobs_notes').delete().eq('application_id', id)
  await supabase.from('wcr_jobs_dj_profiles').delete().eq('application_id', id)
  await supabase.from('wcr_jobs_photo_profiles').delete().eq('application_id', id)
  await supabase.from('wcr_jobs_performer_profiles').delete().eq('application_id', id)
  const { error } = await supabase.from('wcr_jobs_applications').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin')
}
