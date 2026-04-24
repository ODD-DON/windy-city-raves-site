export type ApplicantType = 'dj' | 'photo_video' | 'performer'

export type ApplicationStatus =
  | 'new'
  | 'reviewed'
  | 'shortlisted'
  | 'approved'
  | 'rejected'
  | 'archived'

export interface Application {
  id: string
  app_id: string
  applicant_type: ApplicantType
  full_name: string
  stage_name: string | null
  email: string
  phone: string | null
  city: string | null
  state: string | null
  instagram_link: string | null
  instagram_follower_count: number | null
  tiktok_link: string | null
  tiktok_follower_count: number | null
  total_audience_reach: number | null
  willing_to_promote_event: boolean | null
  willing_to_work_in_chicago: boolean | null
  willing_to_work_in_suburbs: boolean | null
  desired_pay: string | null
  status: ApplicationStatus
  internal_rating: number | null
  internal_notes: string | null
  tags: string[]
  is_favorite: boolean
  additional_notes: string | null
  created_at: string
  updated_at: string
}

export interface DJProfile {
  id: string
  app_id: string
  application_id: string
  genres: string[]
  dj_setup: string | null
  age: number | null
  mix_link: string | null
  soundcloud_link: string | null
  soundcloud_followers: number | null
  facebook_link: string | null
  has_sold_tickets_before: boolean | null
  can_sell_15_tickets: boolean | null
  desired_pay_for_1_hour_set: string | null
  biggest_show: string | null
  created_at: string
}

export interface PhotoProfile {
  id: string
  app_id: string
  application_id: string
  role_type: 'photographer' | 'videographer' | 'both' | null
  years_experience: number | null
  event_types_shot: string[]
  portfolio_link: string | null
  best_work_link: string | null
  available_for_5_hour_shift: boolean | null
  comfortable_low_light: boolean | null
  has_own_equipment: boolean | null
  equipment_list: string | null
  typical_turnaround_time: string | null
  deliverables: string[]
  open_to_posting_content: boolean | null
  desired_pay_for_5_hour_shift: string | null
  created_at: string
}

export interface PerformerProfile {
  id: string
  app_id: string
  application_id: string
  performer_type: string | null
  years_experience: number | null
  performance_styles: string[]
  portfolio_link: string | null
  best_work_link: string | null
  comfortable_in_nightlife_environment: boolean | null
  able_to_perform_multiple_sets: boolean | null
  provides_own_outfits: boolean | null
  solo_group_or_both: string | null
  uses_fire: boolean | null
  fire_experience_and_insurance: string | null
  open_to_promoting_event: boolean | null
  desired_pay: string | null
  created_at: string
}

export interface AdminNote {
  id: string
  application_id: string
  content: string
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface ApplicationWithProfiles extends Application {
  wcr_jobs_dj_profiles?: DJProfile[]
  wcr_jobs_photo_profiles?: PhotoProfile[]
  wcr_jobs_performer_profiles?: PerformerProfile[]
  wcr_jobs_notes?: AdminNote[]
}
