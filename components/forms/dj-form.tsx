'use client'
// DJ Application Form — v11
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { FormShell } from './form-shell'
import {
  Field,
  Input,
  CheckboxGroup,
  RadioGroup,
  YesNo,
  LocationPicker,
  FormSection,
  FormNav,
} from './form-fields'
import { SuccessScreen } from './success-screen'
import { submitDJApplication, type DJFormData } from '@/app/apply/actions'

const US_STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY']

function DJStatePicker({ value, onChange, error }: { value: string; onChange: (v: string) => void; error?: boolean }) {
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

const GENRE_OPTIONS = [
  { value: 'house', label: 'House' },
  { value: 'techno', label: 'Techno' },
  { value: 'hip-hop', label: 'Hip-Hop' },
  { value: 'afrobeats', label: 'Afrobeats' },
  { value: 'reggaeton', label: 'Reggaeton' },
  { value: 'latin', label: 'Latin' },
  { value: 'r&b', label: 'R&B' },
  { value: 'top-40', label: 'Top 40' },
  { value: 'open-format', label: 'Open Format' },
  { value: 'drum-bass', label: 'Drum & Bass' },
  { value: 'dubstep', label: 'Dubstep / Bass' },
  { value: 'other', label: 'Other' },
]

const CROWD_OPTIONS = [
  { value: '0-5', label: '0–5 people' },
  { value: '5-10', label: '5–10 people' },
  { value: '10-20', label: '10–20 people' },
  { value: '20+', label: '20+ people' },
]

const STEPS = [
  { label: 'General Info' },
  { label: 'DJ Details' },
  { label: 'Socials' },
  { label: 'Availability' },
  { label: 'Compensation' },
]

const INITIAL: DJFormData = {
  full_name: '',
  stage_name: '',
  email: '',
  phone: '',
  city: '',
  state: '',
  genres: [],
  dj_setup: '',
  age: '',
  mix_link: '',
  biggest_show: '',
  instagram_link: '',
  instagram_follower_count: '',
  tiktok_link: '',
  tiktok_follower_count: '',
  soundcloud_link: '',
  soundcloud_followers: '',
  facebook_link: '',
  crowd_estimate: '',
  willing_to_promote_event: null,
  can_sell_15_tickets: null,
  has_sold_tickets_before: null,
  willing_to_work_in_chicago: null,
  willing_to_work_in_suburbs: null,
  desired_pay_for_1_hour_set: '',
  additional_notes: '',
}

export function DJForm() {
  const [form, setForm] = useState<DJFormData>(INITIAL)
  const [step, setStep] = useState(0)
  const [errors, setErrors] = useState<Record<string, string | undefined>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [otherGenre, setOtherGenre] = useState('')

  function set<K extends keyof DJFormData>(key: K, value: DJFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function validate(): boolean {
    const e: Record<string, string> = {}
    if (step === 0) {
      if (!form.full_name.trim()) e.full_name = 'Required'
      if (!form.stage_name.trim()) e.stage_name = 'Required'
      if (!form.email.trim()) e.email = 'Required'
      if (!form.phone.trim()) e.phone = 'Required'
      if (!form.city.trim()) e.city = 'Required'
      if (!form.state) e.state = 'Required'
    }
    if (step === 1) {
      if ((form.genres ?? []).length === 0) e.genres = 'Select at least one genre'
      if (!form.dj_setup.trim()) e.dj_setup = 'Required'
      if (!form.age.trim()) e.age = 'Required'
      if (!form.mix_link.trim()) e.mix_link = 'Required'
    }
    if (step === 3) {
      if (form.willing_to_promote_event === null) e.promote = 'Please answer this question'
      if (form.willing_to_work_in_chicago === null && form.willing_to_work_in_suburbs === null) {
        e.location = 'Select at least one location'
      }
    }
    if (step === 4) {
      if (!form.desired_pay_for_1_hour_set.trim()) e.pay = 'Required'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function nextStep() {
    if (validate()) setStep((s) => s + 1)
  }

  function prevStep() {
    setStep((s) => s - 1)
    setErrors({})
  }

  async function handleSubmit() {
    if (!validate()) return
    setSubmitting(true)
    try {
      const submitData = { ...form }
      if (otherGenre && (form.genres ?? []).includes('other')) {
        submitData.genres = [...(form.genres ?? []).filter((g) => g !== 'other'), otherGenre]
      }
      await submitDJApplication(submitData)
      setSubmitted(true)
    } catch (err) {
      setErrors({ submit: err instanceof Error ? err.message : 'Submission failed. Please try again.' })
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return <SuccessScreen name={form.full_name} type="dj" />
  }

  const safeGenres: string[] = form.genres ?? []

  return (
    <FormShell title="DJ Application" subtitle="Apply to join the Windy City Raves DJ roster" steps={STEPS} currentStep={step}>
      {step === 0 && (
        <FormSection title="General Information">
          <Field label="Full Name" required error={errors.full_name}>
            <Input value={form.full_name} onChange={(e) => { set('full_name', e.target.value); setErrors((p) => ({ ...p, full_name: undefined })) }} placeholder="Jane Smith" error={!!errors.full_name} />
          </Field>
          <Field label="Stage / DJ Name" required error={errors.stage_name}>
            <Input value={form.stage_name} onChange={(e) => { set('stage_name', e.target.value); setErrors((p) => ({ ...p, stage_name: undefined })) }} placeholder="DJ Voltage" error={!!errors.stage_name} />
          </Field>
          <Field label="Email" required error={errors.email}>
            <Input type="email" value={form.email} onChange={(e) => { set('email', e.target.value); setErrors((p) => ({ ...p, email: undefined })) }} placeholder="you@email.com" error={!!errors.email} />
          </Field>
          <Field label="Phone" required error={errors.phone}>
            <Input type="tel" inputMode="numeric" value={form.phone} onChange={(e) => { set('phone', e.target.value); setErrors((p) => ({ ...p, phone: undefined })) }} placeholder="(312) 555-0100" error={!!errors.phone} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="City" required error={errors.city}>
              <Input value={form.city} onChange={(e) => { set('city', e.target.value); setErrors((p) => ({ ...p, city: undefined })) }} placeholder="Chicago" error={!!errors.city} />
            </Field>
            <Field label="State" required error={errors.state}>
              <DJStatePicker value={form.state} onChange={(v) => { set('state', v); setErrors((p) => ({ ...p, state: undefined })) }} error={!!errors.state} />
            </Field>
          </div>
        </FormSection>
      )}

      {step === 1 && (
        <FormSection title="DJ Details">
          <Field label="Genres" required error={errors.genres}>
            <CheckboxGroup
              options={GENRE_OPTIONS}
              selected={safeGenres}
              onChange={(vals) => { set('genres', vals); setErrors((p) => ({ ...p, genres: undefined })) }}
              otherValue={otherGenre}
              onOtherChange={setOtherGenre}
              otherPlaceholder="e.g. Drum & Bass"
            />
          </Field>
          <Field label="What gear do you use?" required error={errors.dj_setup} hint="e.g. CDJ3000s, Pioneer DDJ-1000, Traktor controller">
            <Input value={form.dj_setup} onChange={(e) => { set('dj_setup', e.target.value); setErrors((p) => ({ ...p, dj_setup: undefined })) }} placeholder="CDJ3000s, Pioneer DDJ-1000" error={!!errors.dj_setup} />
          </Field>
          <Field label="Age" required error={errors.age}>
            <Input type="number" inputMode="numeric" value={form.age} onChange={(e) => { set('age', e.target.value); setErrors((p) => ({ ...p, age: undefined })) }} placeholder="25" min={18} error={!!errors.age} />
          </Field>
          <Field label="Link to your best track, mix, or mashup" required error={errors.mix_link} hint="SoundCloud, Mixcloud, YouTube, Google Drive, etc.">
            <Input value={form.mix_link} onChange={(e) => { set('mix_link', e.target.value); setErrors((p) => ({ ...p, mix_link: undefined })) }} placeholder="https://soundcloud.com/yourset" error={!!errors.mix_link} />
          </Field>
          <Field label="Biggest show or venue you have played">
            <Input value={form.biggest_show} onChange={(e) => set('biggest_show', e.target.value)} placeholder="Spybar Chicago, Reaction Festival, etc." />
          </Field>
        </FormSection>
      )}

      {step === 2 && (
        <FormSection title="Social Media & Reach">
          <p className="text-xs text-gray-400 -mt-2">All social fields are optional.</p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Instagram"><Input value={form.instagram_link} onChange={(e) => set('instagram_link', e.target.value)} placeholder="@djyou" /></Field>
            <Field label="IG Followers"><Input type="number" value={form.instagram_follower_count} onChange={(e) => set('instagram_follower_count', e.target.value)} placeholder="3000" min={0} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="TikTok"><Input value={form.tiktok_link} onChange={(e) => set('tiktok_link', e.target.value)} placeholder="@djyou" /></Field>
            <Field label="TikTok Followers"><Input type="number" value={form.tiktok_follower_count} onChange={(e) => set('tiktok_follower_count', e.target.value)} placeholder="1000" min={0} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="SoundCloud"><Input value={form.soundcloud_link} onChange={(e) => set('soundcloud_link', e.target.value)} placeholder="soundcloud.com/djyou" /></Field>
            <Field label="SC Followers"><Input type="number" value={form.soundcloud_followers} onChange={(e) => set('soundcloud_followers', e.target.value)} placeholder="500" min={0} /></Field>
          </div>
          <Field label="Facebook"><Input value={form.facebook_link} onChange={(e) => set('facebook_link', e.target.value)} placeholder="facebook.com/djyou" /></Field>
        </FormSection>
      )}

      {step === 3 && (
        <FormSection title="Availability & Promotion">
          <Field label="Are you willing to actively promote events you play?" required error={errors.promote}>
            <YesNo value={form.willing_to_promote_event} onChange={(v) => { set('willing_to_promote_event', v); setErrors((p) => ({ ...p, promote: undefined })) }} />
          </Field>
          <Field label="On average, how many people could you bring out to a show?">
            <RadioGroup
              options={CROWD_OPTIONS}
              value={form.crowd_estimate}
              onChange={(v) => set('crowd_estimate', v)}
              columns={2}
            />
          </Field>
          <Field label="Where are you willing to play?" required error={errors.location}>
            <LocationPicker
              chicago={form.willing_to_work_in_chicago}
              suburbs={form.willing_to_work_in_suburbs}
              onChicago={(v) => { set('willing_to_work_in_chicago', v); setErrors((p) => ({ ...p, location: undefined })) }}
              onSuburbs={(v) => { set('willing_to_work_in_suburbs', v); setErrors((p) => ({ ...p, location: undefined })) }}
            />
          </Field>
        </FormSection>
      )}

      {step === 4 && (
        <FormSection title="Compensation">
          <Field label="Desired pay for a 1-hour set ($)" required error={errors.pay}>
            <Input
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              value={form.desired_pay_for_1_hour_set}
              onChange={(e) => { set('desired_pay_for_1_hour_set', e.target.value.replace(/[^0-9]/g, '')); setErrors((p) => ({ ...p, pay: undefined })) }}
              placeholder="0"
              error={!!errors.pay}
            />
          </Field>
          <Field label="Anything else you want us to know?">
            <Input value={form.additional_notes} onChange={(e) => set('additional_notes', e.target.value)} placeholder="Anything else..." />
          </Field>
          {errors.submit && (
            <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">{errors.submit}</p>
          )}
        </FormSection>
      )}

      <FormNav
        onBack={prevStep}
        onNext={nextStep}
        onSubmit={handleSubmit}
        isFirst={step === 0}
        isLast={step === STEPS.length - 1}
        loading={submitting}
      />
    </FormShell>
  )
}
