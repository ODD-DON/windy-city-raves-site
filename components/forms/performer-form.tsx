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
import { submitPerformerApplication, type PerformerFormData } from '@/app/apply/actions'

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
  { label: 'Performance Type' },
  { label: 'Portfolio' },
  { label: 'Social & Reach' },
  { label: 'Details' },
  { label: 'Compensation' },
]

const PERFORMER_TYPE_OPTIONS = [
  { value: 'Dancer', label: 'Dancer' },
  { value: 'Go-Go Dancer', label: 'Go-Go Dancer' },
  { value: 'Flow Artist', label: 'Flow Artist' },
  { value: 'Aerialist', label: 'Aerialist' },
  { value: 'Contortionist', label: 'Contortionist' },
  { value: 'Specialty Performer', label: 'Specialty' },
  { value: 'Other', label: 'Other' },
]

const STYLE_OPTIONS = [
  { value: 'Breaking', label: 'Breaking' },
  { value: 'Popping & Locking', label: 'Popping & Locking' },
  { value: 'Waacking', label: 'Waacking' },
  { value: 'Vogue', label: 'Vogue' },
  { value: 'Contemporary', label: 'Contemporary' },
  { value: 'LED Flow', label: 'LED Flow' },
  { value: 'Fire Poi', label: 'Fire Poi' },
  { value: 'Hula Hoop', label: 'Hula Hoop' },
  { value: 'Aerial Silk', label: 'Aerial Silk' },
  { value: 'Aerial Hoop', label: 'Aerial Hoop' },
  { value: 'Acrobatics', label: 'Acrobatics' },
  { value: 'Other', label: 'Other' },
]

const SOLO_GROUP_OPTIONS = [
  { value: 'solo', label: 'Solo' },
  { value: 'group', label: 'Group' },
  { value: 'both', label: 'Both' },
]

const INITIAL: PerformerFormData = {
  full_name: '',
  stage_name: '',
  email: '',
  phone: '',
  city: '',
  state: '',
  performer_type: '',
  years_experience: '',
  performance_styles: [],
  portfolio_link: '',
  best_work_link: '',
  instagram_link: '',
  instagram_follower_count: '',
  tiktok_link: '',
  tiktok_follower_count: '',
  comfortable_in_nightlife_environment: null,
  able_to_perform_multiple_sets: null,
  provides_own_outfits: null,
  solo_group_or_both: '',
  uses_fire: null,
  fire_experience_and_insurance: '',
  open_to_promoting_event: null,

  willing_to_work_in_chicago: null,
  willing_to_work_in_suburbs: null,
  desired_pay: '',
  additional_notes: '',
}

export function PerformerForm() {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<PerformerFormData>(INITIAL)
  const [otherPerformerType, setOtherPerformerType] = useState('')
  const [otherStyle, setOtherStyle] = useState('')
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({})
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const set = (key: keyof PerformerFormData, value: unknown) => {
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
      if (!form.performer_type) e.performer_type = 'Please select your performer type'
      if (!form.years_experience) e.years_experience = 'Years of experience is required'
    }
    if (step === 2) {
      if (!form.portfolio_link.trim()) e.portfolio_link = 'Please provide a portfolio link'
    }
    if (step === 4) {
      if (form.comfortable_in_nightlife_environment === null) e.comfort = 'Please answer this question'
      if (form.able_to_perform_multiple_sets === null) e.multi_sets = 'Please answer this question'
      if (form.provides_own_outfits === null) e.outfits = 'Please answer this question'
      if (!form.solo_group_or_both) e.solo_group = 'Please select an option'
      if (form.uses_fire === null) e.fire = 'Please answer this question'
      if (form.open_to_promoting_event === null) e.promote = 'Please answer this question'

      if (form.willing_to_work_in_chicago === null && form.willing_to_work_in_suburbs === null)
        e.location = 'Please select a location preference'
    }
    if (step === 5) {
      if (!form.desired_pay.trim()) e.desired_pay = 'Please enter your desired pay'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleNext = () => { if (validate()) setStep((s) => s + 1) }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)
    setSubmitError(null)
    const finalType = form.performer_type === 'Other' && otherPerformerType.trim()
      ? otherPerformerType.trim()
      : form.performer_type
    const finalStyles = form.performance_styles.includes('Other') && otherStyle.trim()
      ? [...form.performance_styles.filter((s) => s !== 'Other'), otherStyle.trim()]
      : form.performance_styles
    try {
      await submitPerformerApplication({ ...form, performer_type: finalType, performance_styles: finalStyles })
      setSubmitted(true)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Submission failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) return <SuccessScreen applicantType="performer" name={form.full_name} />

  return (
    <FormShell
      title="Performer Application"
      subtitle="Tell us what you do and how you electrify a room."
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
            <Field label="Stage Name / Performer Name" hint="Optional">
              <Input value={form.stage_name} onChange={(e) => set('stage_name', e.target.value)} placeholder="Solara, T-Motion, etc." />
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

        {/* Step 1: Performance Type */}
        {step === 1 && (
          <FormSection title="Performance Type">
            <Field label="What type of performer are you?" required error={errors.performer_type}>
              <RadioGroup
                options={PERFORMER_TYPE_OPTIONS}
                value={form.performer_type}
                onChange={(v) => set('performer_type', v)}
                columns={2}
                otherValue={otherPerformerType}
                onOtherChange={setOtherPerformerType}
                otherPlaceholder="Describe your performer type..."
              />
            </Field>
            <Field label="Years of experience" required error={errors.years_experience}>
              <Input
                type="number"
                value={form.years_experience}
                onChange={(e) => set('years_experience', e.target.value)}
                placeholder="4"
                min={0}
                error={!!errors.years_experience}
              />
            </Field>

          </FormSection>
        )}

        {/* Step 2: Portfolio */}
        {step === 2 && (
          <FormSection title="Portfolio / Media">
            <Field label="Link to photos or videos of your performances" required error={errors.portfolio_link} hint="Instagram, TikTok, YouTube, Google Drive, etc.">
              <Input
                value={form.portfolio_link}
                onChange={(e) => set('portfolio_link', e.target.value)}
                placeholder="https://instagram.com/yourperformer"
                error={!!errors.portfolio_link}
              />
            </Field>
            <Field label="Best example of your performance" hint="Optional — a single link to your strongest piece">
              <Input
                value={form.best_work_link}
                onChange={(e) => set('best_work_link', e.target.value)}
                placeholder="https://youtu.be/example"
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
                <Input type="number" value={form.instagram_follower_count} onChange={(e) => set('instagram_follower_count', e.target.value)} placeholder="5000" min={0} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="TikTok">
                <Input value={form.tiktok_link} onChange={(e) => set('tiktok_link', e.target.value)} placeholder="@you" />
              </Field>
              <Field label="TikTok Followers">
                <Input type="number" value={form.tiktok_follower_count} onChange={(e) => set('tiktok_follower_count', e.target.value)} placeholder="10000" min={0} />
              </Field>
            </div>
          </FormSection>
        )}

        {/* Step 4: Performance Details */}
        {step === 4 && (
          <FormSection title="Performance Details">
            <Field label="Are you comfortable performing in a high-energy nightlife / festival environment?" required error={errors.comfort}>
              <YesNo value={form.comfortable_in_nightlife_environment} onChange={(v) => { set('comfortable_in_nightlife_environment', v); setErrors((p) => ({ ...p, comfort: undefined })) }} />
            </Field>
            <Field label="Are you able to perform for extended periods / multiple sets?" required error={errors.multi_sets}>
              <YesNo value={form.able_to_perform_multiple_sets} onChange={(v) => { set('able_to_perform_multiple_sets', v); setErrors((p) => ({ ...p, multi_sets: undefined })) }} />
            </Field>
            <Field label="Do you provide your own outfits / costumes?" required error={errors.outfits}>
              <YesNo value={form.provides_own_outfits} onChange={(v) => { set('provides_own_outfits', v); setErrors((p) => ({ ...p, outfits: undefined })) }} />
            </Field>
            <Field label="Are your performances solo, group, or both?" required error={errors.solo_group}>
              <RadioGroup
                options={SOLO_GROUP_OPTIONS}
                value={form.solo_group_or_both}
                onChange={(v) => { set('solo_group_or_both', v); setErrors((p) => ({ ...p, solo_group: undefined })) }}
                columns={3}
              />
            </Field>
            <Field label="Do you use fire in your performances?" required error={errors.fire}>
              <YesNo value={form.uses_fire} onChange={(v) => { set('uses_fire', v); setErrors((p) => ({ ...p, fire: undefined })) }} />
            </Field>
            {form.uses_fire && (
              <Field label="Describe your fire experience and any insurance you carry" hint="Years of experience, insurance provider, etc.">
                <Textarea
                  value={form.fire_experience_and_insurance}
                  onChange={(e) => set('fire_experience_and_insurance', e.target.value)}
                  placeholder="5 years fire experience, insured through Performer Insurance Group..."
                  rows={3}
                />
              </Field>
            )}
            <Field label="Do you actively promote your performances and events to your audience?" required error={errors.promote}>
              <YesNo value={form.open_to_promoting_event} onChange={(v) => { set('open_to_promoting_event', v); setErrors((p) => ({ ...p, promote: undefined })) }} />
            </Field>

            <Field label="Where are you willing to perform?" required error={errors.location}>
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
              <Field label="Desired pay for event performance ($)" required error={errors.desired_pay}>
                <Input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={form.desired_pay}
                  onChange={(e) => set('desired_pay', e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="0"
                  error={!!errors.desired_pay}
                />
              </Field>
            </FormSection>
            <FormSection title="Final Notes">
              <Field label="Anything else you want us to know?" hint="Optional">
                <Textarea
                  value={form.additional_notes}
                  onChange={(e) => set('additional_notes', e.target.value)}
                  placeholder="Unique skills, past events, special requirements, collabs..."
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
