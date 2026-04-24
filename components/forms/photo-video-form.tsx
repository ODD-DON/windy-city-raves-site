'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { FormShell } from './form-shell'
import {
  Field,
  Input,
  Textarea,
  RadioGroup,
  CheckboxGroup,
  YesNo,
  LocationPicker,
  FormSection,
  FormNav,
} from './form-fields'
import { SuccessScreen } from './success-screen'
import { submitPhotoVideoApplication, type PhotoVideoFormData } from '@/app/apply/actions'

// v2
const US_STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY']

function StatePicker({ value, onChange, error }: { value: string; onChange: (v: string) => void; error?: boolean }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn('w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#E31837]/40 focus:border-[#E31837] transition-all min-h-[48px] appearance-none cursor-pointer pr-10', !value && 'text-gray-400', error && 'border-[#E31837] ring-1 ring-[#E31837]/30')}
      >
        <option value="" disabled>State</option>
        {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
        <svg className="w-4 h-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" /></svg>
      </div>
    </div>
  )
}

const STEPS = [
  { label: 'General Info' },
  { label: 'Creative Role' },
  { label: 'Portfolio' },
  { label: 'Social & Reach' },
  { label: 'Availability' },
  { label: 'Compensation' },
]

const EVENT_TYPE_OPTIONS = [
  { value: 'Raves / Electronic Events', label: 'Raves / Electronic' },
  { value: 'Club Nights', label: 'Club Nights' },
  { value: 'Music Festivals', label: 'Music Festivals' },
  { value: 'Concerts', label: 'Concerts' },
  { value: 'Private Events', label: 'Private Events' },
  { value: 'Corporate Events', label: 'Corporate Events' },
  { value: 'Outdoor Events', label: 'Outdoor Events' },
  { value: 'Other', label: 'Other' },
]

const DELIVERABLE_OPTIONS = [
  { value: 'edited_photos', label: 'Edited Photos' },
  { value: 'raw_photos', label: 'Raw Photos' },
  { value: 'recap_video', label: 'Recap Video' },
  { value: 'reels_tiktoks', label: 'Reels / TikToks' },
  { value: 'same_night_content', label: 'Same-Night Content' },
]

const ROLE_OPTIONS = [
  { value: 'photographer', label: 'Photographer' },
  { value: 'videographer', label: 'Videographer' },
  { value: 'both', label: 'Both' },
]

const TURNAROUND_OPTIONS = [
  { value: 'Same night', label: 'Same night' },
  { value: '24 hours', label: '24 hours' },
  { value: '24–48 hours', label: '24–48 hrs' },
  { value: '3–5 days', label: '3–5 days' },
  { value: '1 week', label: '1 week' },
  { value: '2 weeks', label: '2 weeks' },
]

const INITIAL: PhotoVideoFormData = {
  full_name: '',
  email: '',
  phone: '',
  city: '',
  state: '',
  role_type: '',
  years_experience: '',
  event_types_shot: [],
  portfolio_link: '',
  best_work_link: '',
  instagram_link: '',
  instagram_follower_count: '',
  tiktok_link: '',
  tiktok_follower_count: '',
  available_for_5_hour_shift: null,
  comfortable_low_light: null,
  has_own_equipment: null,
  equipment_list: '',
  typical_turnaround_time: '',
  deliverables: [],
  open_to_posting_content: null,
  willing_to_promote_event: null,

  willing_to_work_in_chicago: null,
  willing_to_work_in_suburbs: null,
  desired_pay_for_5_hour_shift: '',
  additional_notes: '',
}

export function PhotoVideoForm() {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<PhotoVideoFormData>(INITIAL)
  const [otherEventType, setOtherEventType] = useState('')
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({})
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const set = (key: keyof PhotoVideoFormData, value: unknown) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const validate = (): boolean => {
    const e: Record<string, string> = {}
    if (step === 0) {
      if (!form.full_name.trim()) e.full_name = 'Full name is required'
      if (!form.email.trim()) e.email = 'Email is required'
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email'
      if (!form.phone.trim()) e.phone = 'Phone number is required'
      if (!form.city.trim()) e.city = 'City / town is required'
      if (!form.state) e.state = 'State is required'
    }
    if (step === 1) {
      if (!form.role_type) e.role_type = 'Please select a role'
      if (!form.years_experience) e.years_experience = 'Years of experience is required'
    }
    if (step === 2) {
      if (!form.portfolio_link.trim()) e.portfolio_link = 'Please provide a portfolio link'
    }
    if (step === 4) {
      if (form.available_for_5_hour_shift === null) e.shift = 'Please answer this question'
      if (form.comfortable_low_light === null) e.low_light = 'Please answer this question'
      if (form.has_own_equipment === null) e.equipment = 'Please answer this question'
      if (form.open_to_posting_content === null) e.posting = 'Please answer this question'
      if (form.willing_to_promote_event === null) e.promote = 'Please answer this question'

      if (form.willing_to_work_in_chicago === null && form.willing_to_work_in_suburbs === null)
        e.location = 'Please select a location preference'
    }
    if (step === 5) {
      if (!form.desired_pay_for_5_hour_shift.trim()) e.desired_pay_for_5_hour_shift = 'Please enter your desired pay'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleNext = () => { if (validate()) setStep((s) => s + 1) }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)
    setSubmitError(null)
    const finalEventTypes = form.event_types_shot.includes('Other') && otherEventType.trim()
      ? [...form.event_types_shot.filter((t) => t !== 'Other'), otherEventType.trim()]
      : form.event_types_shot
    try {
      await submitPhotoVideoApplication({ ...form, event_types_shot: finalEventTypes })
      setSubmitted(true)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Submission failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) return <SuccessScreen applicantType="photo_video" name={form.full_name} />

  return (
    <FormShell
      title="Photo / Video Application"
      subtitle="Tell us about your creative work and how you capture the nightlife experience."
      steps={STEPS}
      currentStep={step}
    >
      <div className="flex flex-col gap-6">

        {/* Step 0: General Info */}
        {step === 0 && (
          <FormSection title="General Info">
            <Field label="Full Name" required error={errors.full_name}>
              <Input value={form.full_name} onChange={(e) => set('full_name', e.target.value)} placeholder="Your full name" error={!!errors.full_name} />
            </Field>
            <Field label="Email Address" required error={errors.email}>
              <Input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="you@example.com" error={!!errors.email} />
            </Field>
            <Field label="Phone Number" required error={errors.phone}>
              <Input type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="(312) 555-0100" error={!!errors.phone} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="City / Town" required error={errors.city}>
                <Input value={form.city} onChange={(e) => set('city', e.target.value)} placeholder="Lemont, Chicago, etc." error={!!errors.city} />
              </Field>
              <Field label="State" required error={errors.state}>
                <StatePicker value={form.state} onChange={(v) => set('state', v)} error={!!errors.state} />
              </Field>
            </div>
          </FormSection>
        )}

        {/* Step 1: Creative Role */}
        {step === 1 && (
          <FormSection title="Creative Role">
            <Field label="What are you applying for?" required error={errors.role_type}>
              <RadioGroup options={ROLE_OPTIONS} value={form.role_type} onChange={(v) => set('role_type', v)} columns={1} />
            </Field>
            <Field label="Years of experience" required error={errors.years_experience}>
              <Input
                type="number"
                value={form.years_experience}
                onChange={(e) => set('years_experience', e.target.value)}
                placeholder="3"
                min={0}
                error={!!errors.years_experience}
              />
            </Field>
            <Field label="What type of events have you shot before?">
              <CheckboxGroup
                options={EVENT_TYPE_OPTIONS}
                selected={form.event_types_shot}
                onChange={(vals) => set('event_types_shot', vals)}
                otherValue={otherEventType}
                onOtherChange={setOtherEventType}
                otherPlaceholder="Describe the event type..."
              />
            </Field>
          </FormSection>
        )}

        {/* Step 2: Portfolio */}
        {step === 2 && (
          <FormSection title="Portfolio">
            <Field label="Portfolio Link" required error={errors.portfolio_link} hint="Website, Google Drive, Behance, Instagram, etc.">
              <Input
                value={form.portfolio_link}
                onChange={(e) => set('portfolio_link', e.target.value)}
                placeholder="https://yourportfolio.com"
                error={!!errors.portfolio_link}
              />
            </Field>
            <Field label="Best example of your work" hint="Optional — a single link to your strongest piece">
              <Input
                value={form.best_work_link}
                onChange={(e) => set('best_work_link', e.target.value)}
                placeholder="https://instagram.com/p/example"
              />
            </Field>
          </FormSection>
        )}

        {/* Step 3: Social */}
        {step === 3 && (
          <FormSection title="Social Media & Reach">
            <p className="text-xs text-gray-400 -mt-2">All social fields are optional — share what you have.</p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Instagram">
                <Input value={form.instagram_link} onChange={(e) => set('instagram_link', e.target.value)} placeholder="@you" />
              </Field>
              <Field label="Instagram Followers">
                <Input type="number" value={form.instagram_follower_count} onChange={(e) => set('instagram_follower_count', e.target.value)} placeholder="3000" min={0} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="TikTok">
                <Input value={form.tiktok_link} onChange={(e) => set('tiktok_link', e.target.value)} placeholder="@you" />
              </Field>
              <Field label="TikTok Followers">
                <Input type="number" value={form.tiktok_follower_count} onChange={(e) => set('tiktok_follower_count', e.target.value)} placeholder="5000" min={0} />
              </Field>
            </div>
          </FormSection>
        )}

        {/* Step 4: Availability */}
        {step === 4 && (
          <FormSection title="Event Availability & Workflow">
            <Field label="Are you available for a 5-hour event shift?" required error={errors.shift}>
              <YesNo value={form.available_for_5_hour_shift} onChange={(v) => { set('available_for_5_hour_shift', v); setErrors((p) => ({ ...p, shift: undefined })) }} />
            </Field>
            <Field label="Are you comfortable shooting in low-light / nightclub environments?" required error={errors.low_light}>
              <YesNo value={form.comfortable_low_light} onChange={(v) => { set('comfortable_low_light', v); setErrors((p) => ({ ...p, low_light: undefined })) }} />
            </Field>
            <Field label="Do you have your own equipment?" required error={errors.equipment}>
              <YesNo value={form.has_own_equipment} onChange={(v) => { set('has_own_equipment', v); setErrors((p) => ({ ...p, equipment: undefined })) }} />
            </Field>
            {form.has_own_equipment && (
              <Field label="What equipment do you use?">
                <Input
                  value={form.equipment_list}
                  onChange={(e) => set('equipment_list', e.target.value)}
                  placeholder="Sony A7IV, Canon R6, DJI Osmo Pocket, etc."
                />
              </Field>
            )}
            <Field label="Typical turnaround time for edited content">
              <RadioGroup
                options={TURNAROUND_OPTIONS}
                value={form.typical_turnaround_time}
                onChange={(v) => set('typical_turnaround_time', v)}
                columns={3}
              />
            </Field>
            <Field label="What type of content can you deliver?">
              <CheckboxGroup
                options={DELIVERABLE_OPTIONS}
                selected={form.deliverables}
                onChange={(vals) => set('deliverables', vals)}
                columns={1}
              />
            </Field>
            <Field label="Are you open to posting content from the event on your social media?" required error={errors.posting}>
              <YesNo value={form.open_to_posting_content} onChange={(v) => { set('open_to_posting_content', v); setErrors((p) => ({ ...p, posting: undefined })) }} />
            </Field>
            <Field label="Do you actively promote your work and events to your audience?" required error={errors.promote}>
              <YesNo value={form.willing_to_promote_event} onChange={(v) => { set('willing_to_promote_event', v); setErrors((p) => ({ ...p, promote: undefined })) }} />
            </Field>

            <Field label="Where are you willing to work?" required error={errors.location}>
              <LocationPicker
                chicago={form.willing_to_work_in_chicago}
                suburbs={form.willing_to_work_in_suburbs}
                onChicago={(v) => { set('willing_to_work_in_chicago', v); setErrors((p) => ({ ...p, location: undefined })) }}
                onSuburbs={(v) => { set('willing_to_work_in_suburbs', v); setErrors((p) => ({ ...p, location: undefined })) }}
              />
            </Field>
          </FormSection>
        )}

        {/* Step 5: Compensation */}
        {step === 5 && (
          <>
            <FormSection title="Compensation">
              <Field label="Desired pay for a 5-hour event shift ($)" required error={errors.desired_pay_for_5_hour_shift}>
                <Input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={form.desired_pay_for_5_hour_shift}
                  onChange={(e) => set('desired_pay_for_5_hour_shift', e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="0"
                  error={!!errors.desired_pay_for_5_hour_shift}
                />
              </Field>
            </FormSection>
            <FormSection title="Final Notes">
              <Field label="Anything else you want us to know?" hint="Optional">
                <Textarea
                  value={form.additional_notes}
                  onChange={(e) => set('additional_notes', e.target.value)}
                  placeholder="Awards, features, unique skills, past clients, etc."
                  rows={4}
                />
              </Field>
            </FormSection>
          </>
        )}

        {submitError && (
          <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3">
            {submitError}
          </p>
        )}

        <FormNav
          onBack={() => setStep((s) => s - 1)}
          onNext={handleNext}
          onSubmit={handleSubmit}
          isFirst={step === 0}
          isLast={step === STEPS.length - 1}
          loading={loading}
        />
      </div>
    </FormShell>
  )
}
