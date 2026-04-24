'use client'
// form-fields v3 — force rebuild
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

// ─── US States ────────────────────────────────────────────────────────────────

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
]

// ─── Field wrapper ────────────────────────────────────────────────────────────

interface FieldProps {
  label: string
  required?: boolean
  hint?: string
  error?: string
  children: React.ReactNode
}

export function Field({ label, required, hint, error, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-gray-800">
        {label}
        {required && <span className="text-[#E31837] ml-1">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
      {error && <p className="text-xs text-[#E31837]">{error}</p>}
    </div>
  )
}

// ─── Text Input ───────────────────────────────────────────────────────────────

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

export function Input({ className, error, type, ...props }: InputProps) {
  const isNumeric = type === 'number'
  return (
    <input
      type={isNumeric ? 'tel' : type}
      inputMode={isNumeric ? 'numeric' : undefined}
      pattern={isNumeric ? '[0-9]*' : undefined}
      className={cn(
        'w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E31837]/40 focus:border-[#E31837] transition-all min-h-[48px]',
        error && 'border-[#E31837] ring-1 ring-[#E31837]/30',
        className,
      )}
      {...props}
    />
  )
}

// ─── Textarea ─────────────────────────────────────────────────────────────────

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
}

export function Textarea({ className, error, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        'w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E31837]/40 focus:border-[#E31837] transition-all resize-none min-h-[100px]',
        error && 'border-[#E31837] ring-1 ring-[#E31837]/30',
        className,
      )}
      {...props}
    />
  )
}

// ─── StateSelectField (exported for any consumer) ────────────────────────────

interface StateSelectProps {
  value: string
  onChange: (value: string) => void
  error?: boolean
}

export function StateSelectField({ value, onChange, error }: StateSelectProps) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#E31837]/40 focus:border-[#E31837] transition-all min-h-[48px] appearance-none cursor-pointer pr-10',
          !value && 'text-gray-400',
          error && 'border-[#E31837] ring-1 ring-[#E31837]/30',
        )}
      >
        <option value="" disabled>State</option>
        {US_STATES.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
        <svg className="w-4 h-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </div>
    </div>
  )
}

// ─── CheckboxGroup ───────────────────────────────────────────────────────────

interface CheckboxOption {
  value: string
  label: string
}

interface CheckboxGroupProps {
  options: CheckboxOption[]
  selected: string[]
  onChange: (values: string[]) => void
  columns?: 1 | 2 | 3
  otherValue?: string
  onOtherChange?: (text: string) => void
  otherPlaceholder?: string
}

export function CheckboxGroup({
  options,
  selected,
  onChange,
  columns = 2,
  otherValue = '',
  onOtherChange,
  otherPlaceholder = 'Please specify...',
}: CheckboxGroupProps) {
  const safeSelected = selected ?? []
  const toggle = (value: string) => {
    onChange(safeSelected.includes(value) ? safeSelected.filter((v) => v !== value) : [...safeSelected, value])
  }

  const colClass =
    columns === 3 ? 'grid-cols-3' : columns === 2 ? 'grid-cols-2' : 'grid-cols-1'

  return (
    <div className="flex flex-col gap-2">
      <div className={cn('grid gap-2', colClass)}>
        {options.map((opt) => {
          const active = safeSelected.includes(opt.value)
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggle(opt.value)}
              className={cn(
                'rounded-xl border-2 px-3 py-3 text-sm font-medium text-center transition-all min-h-[48px] active:scale-[0.97] leading-snug',
                active
                  ? 'border-[#E31837] bg-[#E31837] text-white shadow-sm'
                  : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-[#E31837]/50 hover:bg-red-50',
              )}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
      {safeSelected.includes('Other') && onOtherChange && (
        <Input
          value={otherValue}
          onChange={(e) => onOtherChange(e.target.value)}
          placeholder={otherPlaceholder}
          className="mt-1"
        />
      )}
    </div>
  )
}

// ─── RadioGroup ──────────────────────────────────────────────────────────────

interface RadioOption {
  value: string
  label: string
  description?: string
}

interface RadioGroupProps {
  options: RadioOption[]
  value: string
  onChange: (value: string) => void
  columns?: 1 | 2 | 3
  otherValue?: string
  onOtherChange?: (text: string) => void
  otherPlaceholder?: string
}

export function RadioGroup({
  options,
  value,
  onChange,
  columns = 1,
  otherValue = '',
  onOtherChange,
  otherPlaceholder = 'Please specify...',
}: RadioGroupProps) {
  const colClass =
    columns === 3 ? 'grid-cols-3' : columns === 2 ? 'grid-cols-2' : 'grid-cols-1'

  return (
    <div className="flex flex-col gap-2">
      <div className={cn('grid gap-2', colClass)}>
        {options.map((opt) => {
          const active = value === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={cn(
                'rounded-xl border-2 px-3 py-3 text-sm font-medium text-center transition-all min-h-[48px] active:scale-[0.97] leading-snug',
                active
                  ? 'border-[#E31837] bg-[#E31837] text-white shadow-sm'
                  : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-[#E31837]/50 hover:bg-red-50',
              )}
            >
              <span className="block">{opt.label}</span>
              {opt.description && (
                <span className={cn('block text-xs mt-0.5', active ? 'text-white/80' : 'text-gray-400')}>
                  {opt.description}
                </span>
              )}
            </button>
          )
        })}
      </div>
      {value === 'Other' && onOtherChange && (
        <Input
          value={otherValue}
          onChange={(e) => onOtherChange(e.target.value)}
          placeholder={otherPlaceholder}
          className="mt-1"
        />
      )}
    </div>
  )
}

// ─── YesNo ────────────────────────────────────────────────────────────────────

interface YesNoProps {
  value: boolean | null
  onChange: (value: boolean) => void
}

export function YesNo({ value, onChange }: YesNoProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <button
        type="button"
        onClick={() => onChange(true)}
        className={cn(
          'rounded-xl border-2 px-4 py-3 text-sm font-semibold transition-all min-h-[52px] active:scale-[0.97]',
          value === true
            ? 'border-[#E31837] bg-[#E31837] text-white shadow-sm'
            : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-[#E31837]/50 hover:bg-red-50',
        )}
      >
        Yes
      </button>
      <button
        type="button"
        onClick={() => onChange(false)}
        className={cn(
          'rounded-xl border-2 px-4 py-3 text-sm font-semibold transition-all min-h-[52px] active:scale-[0.97]',
          value === false
            ? 'border-gray-700 bg-gray-700 text-white shadow-sm'
            : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-400 hover:bg-gray-100',
        )}
      >
        No
      </button>
    </div>
  )
}

// ─── LocationPicker ───────────────────────────────────────────────────────────

interface LocationPickerProps {
  chicago: boolean | null
  suburbs: boolean | null
  onChicago: (v: boolean) => void
  onSuburbs: (v: boolean) => void
}

export function LocationPicker({ chicago, suburbs, onChicago, onSuburbs }: LocationPickerProps) {
  const chicagoOnly = chicago === true && suburbs === false
  const suburbsOnly = chicago === false && suburbs === true
  const both = chicago === true && suburbs === true

  return (
    <div className="grid grid-cols-2 gap-3">
      <button
        type="button"
        onClick={() => { onChicago(true); onSuburbs(false) }}
        className={cn(
          'rounded-xl border-2 px-4 py-3 text-sm font-medium text-center transition-all min-h-[48px] active:scale-[0.97]',
          chicagoOnly
            ? 'border-[#E31837] bg-[#E31837] text-white shadow-sm'
            : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-[#E31837]/50 hover:bg-red-50',
        )}
      >
        Chicago Only
      </button>
      <button
        type="button"
        onClick={() => { onChicago(false); onSuburbs(true) }}
        className={cn(
          'rounded-xl border-2 px-4 py-3 text-sm font-medium text-center transition-all min-h-[48px] active:scale-[0.97]',
          suburbsOnly
            ? 'border-[#E31837] bg-[#E31837] text-white shadow-sm'
            : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-[#E31837]/50 hover:bg-red-50',
        )}
      >
        Suburbs Only
      </button>
      <button
        type="button"
        onClick={() => { onChicago(true); onSuburbs(true) }}
        className={cn(
          'col-span-2 rounded-xl border-2 px-4 py-3 text-sm font-medium text-center transition-all min-h-[48px] active:scale-[0.97]',
          both
            ? 'border-[#E31837] bg-[#E31837] text-white shadow-sm'
            : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-[#E31837]/50 hover:bg-red-50',
        )}
      >
        Both (Chicago + Suburbs)
      </button>
    </div>
  )
}

// ─── FormSection ─────────────────────────────────────────────────────────────

interface FormSectionProps {
  title: string
  children: React.ReactNode
}

export function FormSection({ title, children }: FormSectionProps) {
  return (
    <div className="flex flex-col gap-5">
      <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-2">
        {title}
      </h3>
      {children}
    </div>
  )
}

// ─── FormNav ─────────────────────────────────────────────────────────────────

interface FormNavProps {
  onBack?: () => void
  onNext?: () => void
  onSubmit?: () => void
  isFirst?: boolean
  isLast?: boolean
  loading?: boolean
  nextLabel?: string
}

export function FormNav({
  onBack,
  onNext,
  onSubmit,
  isFirst,
  isLast,
  loading,
  nextLabel = 'Continue',
}: FormNavProps) {
  const router = useRouter()

  const handleBack = () => {
    if (isFirst) {
      router.push('/')
    } else {
      onBack?.()
    }
  }

  return (
    <div className="flex gap-3 mt-10 pt-6 border-t border-gray-100">
      <button
        type="button"
        onClick={handleBack}
        className="flex-none w-28 rounded-xl border-2 border-gray-200 bg-white text-gray-700 px-5 py-3 text-sm font-semibold hover:bg-gray-50 transition-all min-h-[52px]"
      >
        Back
      </button>
      {!isLast ? (
        <button
          type="button"
          onClick={onNext}
          className="flex-1 rounded-xl bg-[#E31837] text-white px-5 py-3 text-sm font-bold hover:bg-[#c5152e] transition-all min-h-[52px] active:scale-[0.98]"
        >
          {nextLabel}
        </button>
      ) : (
        <button
          type="button"
          onClick={onSubmit}
          disabled={loading}
          className="flex-1 rounded-xl bg-[#E31837] text-white px-5 py-3 text-sm font-bold hover:bg-[#c5152e] transition-all min-h-[52px] disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]"
        >
          {loading ? 'Submitting...' : 'Submit Application'}
        </button>
      )}
    </div>
  )
}
