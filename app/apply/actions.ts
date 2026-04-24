'use server'

import { createClient } from '@supabase/supabase-js'

// Server actions run server-side only — using the service role key bypasses RLS
// so any public applicant can insert without needing an auth session.
// This key is NEVER sent to the browser.
function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('Missing Supabase credentials')
  }
  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

export interface DJFormData {
  // General
  full_name: string
  stage_name: string
  email: string
  phone: string
  city: string
  state: string
  // DJ details
  genres: string[]
  dj_setup: string
  age: string
  mix_link: string
  // Social
  instagram_link: string
  instagram_follower_count: string
  tiktok_link: string
  tiktok_follower_count: string
  soundcloud_link: string
  soundcloud_followers: string
  facebook_link: string
  // Availability
  crowd_estimate: string
  willing_to_promote_event: boolean | null
  can_sell_15_tickets: boolean | null
  has_sold_tickets_before: boolean | null
  willing_to_work_in_chicago: boolean | null
  willing_to_work_in_suburbs: boolean | null
  // Compensation
  desired_pay_for_1_hour_set: string
  // Final
  additional_notes: string
  biggest_show: string
}

export interface PhotoVideoFormData {
  full_name: string
  email: string
  phone: string
  city: string
  state: string
  role_type: string
  years_experience: string
  event_types_shot: string[]
  portfolio_link: string
  best_work_link: string
  instagram_link: string
  instagram_follower_count: string
  tiktok_link: string
  tiktok_follower_count: string
  available_for_5_hour_shift: boolean | null
  comfortable_low_light: boolean | null
  has_own_equipment: boolean | null
  equipment_list: string
  typical_turnaround_time: string
  deliverables: string[]
  open_to_posting_content: boolean | null
  willing_to_promote_event: boolean | null
  willing_to_work_in_chicago: boolean | null
  willing_to_work_in_suburbs: boolean | null
  desired_pay_for_5_hour_shift: string
  additional_notes: string
}

export interface PerformerFormData {
  full_name: string
  stage_name: string
  email: string
  phone: string
  city: string
  state: string
  performer_type: string
  years_experience: string
  performance_styles: string[]
  portfolio_link: string
  best_work_link: string
  instagram_link: string
  instagram_follower_count: string
  tiktok_link: string
  tiktok_follower_count: string
  comfortable_in_nightlife_environment: boolean | null
  able_to_perform_multiple_sets: boolean | null
  provides_own_outfits: boolean | null
  solo_group_or_both: string
  uses_fire: boolean | null
  fire_experience_and_insurance: string
  open_to_promoting_event: boolean | null
  willing_to_work_in_chicago: boolean | null
  willing_to_work_in_suburbs: boolean | null
  desired_pay: string
  additional_notes: string
}

function safeInt(val: string | number | undefined | null): number | null {
  if (!val) return null
  const n = parseInt(String(val), 10)
  return isNaN(n) ? null : n
}

export async function submitDJApplication(data: DJFormData) {
  const supabase = createServiceClient()

  const totalReach =
    (safeInt(data.instagram_follower_count) ?? 0) +
    (safeInt(data.tiktok_follower_count) ?? 0) +
    (safeInt(data.soundcloud_followers) ?? 0)

  const { data: app, error: appError } = await supabase
    .from('wcr_jobs_applications')
    .insert({
      applicant_type: 'dj',
      full_name: data.full_name,
      stage_name: data.stage_name || null,
      email: data.email,
      phone: data.phone || null,
      city: data.city || null,
      state: data.state || null,
      instagram_link: data.instagram_link || null,
      instagram_follower_count: safeInt(data.instagram_follower_count),
      tiktok_link: data.tiktok_link || null,
      tiktok_follower_count: safeInt(data.tiktok_follower_count),
      total_audience_reach: totalReach || null,
      willing_to_promote_event: data.willing_to_promote_event,
      willing_to_work_in_chicago: data.willing_to_work_in_chicago,
      willing_to_work_in_suburbs: data.willing_to_work_in_suburbs,
      desired_pay: data.desired_pay_for_1_hour_set || null,
      additional_notes: data.additional_notes || null,
    })
    .select()
    .single()

  if (appError) throw new Error(appError.message)

  const { error: djError } = await supabase.from('wcr_jobs_dj_profiles').insert({
    application_id: app.id,
    genres: data.genres,
    dj_setup: data.dj_setup || null,
    age: safeInt(data.age),
    mix_link: data.mix_link || null,
    soundcloud_link: data.soundcloud_link || null,
    soundcloud_followers: safeInt(data.soundcloud_followers),
    facebook_link: data.facebook_link || null,
    has_sold_tickets_before: data.has_sold_tickets_before,
    can_sell_15_tickets: data.can_sell_15_tickets,
    crowd_estimate: data.crowd_estimate || null,
    desired_pay_for_1_hour_set: data.desired_pay_for_1_hour_set || null,
    biggest_show: data.biggest_show || null,
  })

  if (djError) throw new Error(djError.message)

  return { id: app.id }
}

export async function submitPhotoVideoApplication(data: PhotoVideoFormData) {
  const supabase = createServiceClient()

  const totalReach =
    (safeInt(data.instagram_follower_count) ?? 0) + (safeInt(data.tiktok_follower_count) ?? 0)

  const { data: app, error: appError } = await supabase
    .from('wcr_jobs_applications')
    .insert({
      applicant_type: 'photo_video',
      full_name: data.full_name,
      email: data.email,
      phone: data.phone || null,
      city: data.city || null,
      state: data.state || null,
      instagram_link: data.instagram_link || null,
      instagram_follower_count: safeInt(data.instagram_follower_count),
      tiktok_link: data.tiktok_link || null,
      tiktok_follower_count: safeInt(data.tiktok_follower_count),
      total_audience_reach: totalReach || null,
      willing_to_promote_event: data.willing_to_promote_event,
      willing_to_work_in_chicago: data.willing_to_work_in_chicago,
      willing_to_work_in_suburbs: data.willing_to_work_in_suburbs,
      desired_pay: data.desired_pay_for_5_hour_shift || null,
      additional_notes: data.additional_notes || null,
    })
    .select()
    .single()

  if (appError) throw new Error(appError.message)

  const { error: pvError } = await supabase.from('wcr_jobs_photo_profiles').insert({
    application_id: app.id,
    role_type: data.role_type || null,
    years_experience: safeInt(data.years_experience),
    event_types_shot: data.event_types_shot,
    portfolio_link: data.portfolio_link || null,
    best_work_link: data.best_work_link || null,
    available_for_5_hour_shift: data.available_for_5_hour_shift,
    comfortable_low_light: data.comfortable_low_light,
    has_own_equipment: data.has_own_equipment,
    equipment_list: data.equipment_list || null,
    typical_turnaround_time: data.typical_turnaround_time || null,
    deliverables: data.deliverables,
    open_to_posting_content: data.open_to_posting_content,
    desired_pay_for_5_hour_shift: data.desired_pay_for_5_hour_shift || null,
  })

  if (pvError) throw new Error(pvError.message)

  return { id: app.id }
}

export async function submitPerformerApplication(data: PerformerFormData) {
  const supabase = createServiceClient()

  const totalReach =
    (safeInt(data.instagram_follower_count) ?? 0) + (safeInt(data.tiktok_follower_count) ?? 0)

  const { data: app, error: appError } = await supabase
    .from('wcr_jobs_applications')
    .insert({
      applicant_type: 'performer',
      full_name: data.full_name,
      stage_name: data.stage_name || null,
      email: data.email,
      phone: data.phone || null,
      city: data.city || null,
      state: data.state || null,
      instagram_link: data.instagram_link || null,
      instagram_follower_count: safeInt(data.instagram_follower_count),
      tiktok_link: data.tiktok_link || null,
      tiktok_follower_count: safeInt(data.tiktok_follower_count),
      total_audience_reach: totalReach || null,
      willing_to_promote_event: data.open_to_promoting_event,
      willing_to_work_in_chicago: data.willing_to_work_in_chicago,
      willing_to_work_in_suburbs: data.willing_to_work_in_suburbs,
      desired_pay: data.desired_pay || null,
      additional_notes: data.additional_notes || null,
    })
    .select()
    .single()

  if (appError) throw new Error(appError.message)

  const { error: perfError } = await supabase.from('wcr_jobs_performer_profiles').insert({
    application_id: app.id,
    performer_type: data.performer_type || null,
    years_experience: safeInt(data.years_experience),
    performance_styles: data.performance_styles,
    portfolio_link: data.portfolio_link || null,
    best_work_link: data.best_work_link || null,
    comfortable_in_nightlife_environment: data.comfortable_in_nightlife_environment,
    able_to_perform_multiple_sets: data.able_to_perform_multiple_sets,
    provides_own_outfits: data.provides_own_outfits,
    solo_group_or_both: data.solo_group_or_both || null,
    uses_fire: data.uses_fire,
    fire_experience_and_insurance: data.fire_experience_and_insurance || null,
    open_to_promoting_event: data.open_to_promoting_event,
    desired_pay: data.desired_pay || null,
  })

  if (perfError) throw new Error(perfError.message)

  return { id: app.id }
}
