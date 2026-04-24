'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import type { ApplicationWithProfiles, ApplicationStatus, AdminNote } from '@/lib/types'
import {
  ArrowLeft,
  Star,
  Heart,
  ExternalLink,
  Instagram,
  Music,
  Camera,
  Sparkles,
  MapPin,
  Phone,
  Mail,
  Users,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  Tag,
  Send,
  ChevronDown,
  TrendingUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  updateApplicationStatus,
  updateApplicationRating,
  updateApplicationFavorite,
  updateApplicationTags,
  addNote,
  deleteNote,
} from '@/app/admin/actions'

// ─── Constants ──────────────────────────────────────────────────────────────

const STATUS_OPTIONS: ApplicationStatus[] = [
  'new',
  'reviewed',
  'shortlisted',
  'approved',
  'rejected',
  'archived',
]

const STATUS_STYLES: Record<ApplicationStatus, string> = {
  new: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
  reviewed: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  shortlisted: 'bg-violet-500/15 text-violet-400 border-violet-500/30',
  approved: 'bg-green-500/15 text-green-400 border-green-500/30',
  rejected: 'bg-red-500/15 text-red-400 border-red-500/30',
  archived: 'bg-muted text-muted-foreground border-border',
}

const SUGGESTED_TAGS = [
  'high-priority',
  'chicago-local',
  'large-following',
  'will-promote',
  'experienced',
  'follow-up',
  'no-show',
  'booked',
]

// ─── Helpers ────────────────────────────────────────────────────────────────

function getInstagramUrl(input: string | null | undefined): string | null {
  if (!input) return null
  const trimmed = input.trim()
  if (!trimmed) return null
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed
  const handle = trimmed.startsWith('@') ? trimmed.slice(1) : trimmed
  return `https://www.instagram.com/${handle}`
}

function getTikTokUrl(input: string | null | undefined): string | null {
  if (!input) return null
  const trimmed = input.trim()
  if (!trimmed) return null
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed
  const handle = trimmed.startsWith('@') ? trimmed.slice(1) : trimmed
  return `https://www.tiktok.com/@${handle}`
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function InfoRow({ label, value, href }: { label: string; value: string | number | null | undefined; href?: string }) {
  if (value == null || value === '') return null
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-border/50 last:border-0">
      <span className="text-xs text-muted-foreground flex-shrink-0 w-36">{label}</span>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary hover:underline flex items-center gap-1 text-right break-all"
        >
          {String(value)} <ExternalLink className="w-3 h-3 flex-shrink-0" />
        </a>
      ) : (
        <span className="text-sm text-foreground text-right break-words">{String(value)}</span>
      )}
    </div>
  )
}

function BoolRow({ label, value }: { label: string; value: boolean | null | undefined }) {
  if (value == null) return null
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border/50 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      {value ? (
        <CheckCircle2 className="w-4 h-4 text-green-400" />
      ) : (
        <XCircle className="w-4 h-4 text-muted-foreground/40" />
      )}
    </div>
  )
}

function ArrayRow({ label, value }: { label: string; value: string[] | null | undefined }) {
  if (!value || value.length === 0) return null
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-border/50 last:border-0">
      <span className="text-xs text-muted-foreground flex-shrink-0 w-36">{label}</span>
      <div className="flex flex-wrap gap-1.5 justify-end">
        {value.map((v) => (
          <span key={v} className="text-xs bg-secondary/80 text-foreground px-2 py-0.5 rounded-full">
            {v}
          </span>
        ))}
      </div>
    </div>
  )
}

function SectionCard({ title, icon: Icon, children }: { title: string; icon: React.FC<{ className?: string }>; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-4 h-4 text-primary" />
        <h3 className="font-display font-semibold text-sm text-foreground">{title}</h3>
      </div>
      {children}
    </div>
  )
}

// ─── Star Rating ─────────────────────────────────────────────────────────────

function StarRating({ value, onChange }: { value: number | null; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState<number | null>(null)
  const display = hovered ?? value ?? 0
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(null)}
          onClick={() => onChange(n === value ? 0 : n)}
          className="p-0.5 transition-transform hover:scale-110"
          aria-label={`Rate ${n} star${n !== 1 ? 's' : ''}`}
        >
          <Star
            className={cn(
              'w-5 h-5 transition-colors',
              n <= display ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/30',
            )}
          />
        </button>
      ))}
    </div>
  )
}

// ─── Notes ───────────────────────────────────────────────────────────────────

function NotesPanel({ applicationId, notes }: { applicationId: string; notes: AdminNote[] }) {
  const [text, setText] = useState('')
  const [isPending, startTransition] = useTransition()

  const handleAdd = () => {
    if (!text.trim()) return
    const content = text.trim()
    setText('')
    startTransition(async () => {
      await addNote(applicationId, content)
    })
  }

  const handleDelete = (noteId: string) => {
    startTransition(async () => {
      await deleteNote(noteId, applicationId)
    })
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Add note */}
      <div className="flex gap-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleAdd()
          }}
          placeholder="Add a note... (Cmd+Enter to save)"
          rows={2}
          className="flex-1 bg-input border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring resize-none"
        />
        <button
          onClick={handleAdd}
          disabled={!text.trim() || isPending}
          className="flex-shrink-0 flex items-center justify-center w-10 h-10 mt-auto rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 transition-all"
          aria-label="Save note"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Existing notes */}
      {notes.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-4">No notes yet.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {[...notes].reverse().map((note) => (
            <div
              key={note.id}
              className="group flex items-start gap-3 bg-muted/30 rounded-xl p-3 border border-border/50"
            >
              <p className="flex-1 text-sm text-foreground leading-relaxed whitespace-pre-wrap break-words">
                {note.content}
              </p>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <span className="text-xs text-muted-foreground">
                  {new Date(note.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
                <button
                  onClick={() => handleDelete(note.id)}
                  disabled={isPending}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-red-500/10 hover:text-red-400 text-muted-foreground transition-all"
                  aria-label="Delete note"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Tags Panel ───────────────────────────────────────────────────────────────

function TagsPanel({ applicationId, tags }: { applicationId: string; tags: string[] }) {
  const [current, setCurrent] = useState<string[]>(tags)
  const [customInput, setCustomInput] = useState('')
  const [isPending, startTransition] = useTransition()

  const save = (next: string[]) => {
    setCurrent(next)
    startTransition(async () => {
      await updateApplicationTags(applicationId, next)
    })
  }

  const toggleTag = (tag: string) => {
    save(current.includes(tag) ? current.filter((t) => t !== tag) : [...current, tag])
  }

  const addCustom = () => {
    const t = customInput.trim().toLowerCase().replace(/\s+/g, '-')
    if (!t || current.includes(t)) return
    setCustomInput('')
    save([...current, t])
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Current tags */}
      {current.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {current.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className="inline-flex items-center gap-1 bg-primary/15 text-primary border border-primary/25 rounded-full px-2.5 py-1 text-xs font-medium hover:bg-red-500/15 hover:text-red-400 hover:border-red-500/25 transition-all"
            >
              <Tag className="w-2.5 h-2.5" />
              {tag}
              <XCircle className="w-3 h-3" />
            </button>
          ))}
        </div>
      )}

      {/* Suggested */}
      <div className="flex flex-wrap gap-1.5">
        {SUGGESTED_TAGS.filter((t) => !current.includes(t)).map((tag) => (
          <button
            key={tag}
            onClick={() => toggleTag(tag)}
            disabled={isPending}
            className="inline-flex items-center gap-1 bg-secondary text-muted-foreground rounded-full px-2.5 py-1 text-xs hover:bg-primary/10 hover:text-primary transition-all"
          >
            <Plus className="w-2.5 h-2.5" />
            {tag}
          </button>
        ))}
      </div>

      {/* Custom tag input */}
      <div className="flex gap-2">
        <input
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addCustom()}
          placeholder="Add custom tag..."
          className="flex-1 bg-input border border-border rounded-xl px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          onClick={addCustom}
          disabled={!customInput.trim() || isPending}
          className="flex items-center gap-1 rounded-xl border border-border px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:border-primary/40 disabled:opacity-40 transition-all"
        >
          <Plus className="w-3 h-3" />
          Add
        </button>
      </div>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────

interface ApplicantDetailProps {
  application: ApplicationWithProfiles
}

export function ApplicantDetail({ application: initial }: ApplicantDetailProps) {
  const [app, setApp] = useState(initial)
  const [statusOpen, setStatusOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const dj = app.wcr_jobs_dj_profiles?.[0]
  const photo = app.wcr_jobs_photo_profiles?.[0]
  const performer = app.wcr_jobs_performer_profiles?.[0]
  const notes: AdminNote[] = app.wcr_jobs_notes ?? []

  const handleStatus = (status: ApplicationStatus) => {
    setApp((prev) => ({ ...prev, status }))
    setStatusOpen(false)
    startTransition(async () => {
      await updateApplicationStatus(app.id, status)
    })
  }

  const handleRating = (rating: number) => {
    setApp((prev) => ({ ...prev, internal_rating: rating }))
    startTransition(async () => {
      await updateApplicationRating(app.id, rating)
    })
  }

  const handleFavorite = () => {
    const next = !app.is_favorite
    setApp((prev) => ({ ...prev, is_favorite: next }))
    startTransition(async () => {
      await updateApplicationFavorite(app.id, next)
    })
  }

  const typeLabel =
    app.applicant_type === 'dj'
      ? 'DJ'
      : app.applicant_type === 'photo_video'
        ? 'Photo / Video'
        : 'Performer'

  const TypeIcon =
    app.applicant_type === 'dj' ? Music : app.applicant_type === 'photo_video' ? Camera : Sparkles

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col gap-6">
      {/* Back */}
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
      >
        <ArrowLeft className="w-4 h-4" />
        All Applicants
      </Link>

      {/* Header card */}
      <div className="bg-card border border-border rounded-2xl p-6 flex flex-col md:flex-row md:items-start gap-5">
        {/* Avatar placeholder */}
        <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
          <TypeIcon className="w-7 h-7 text-primary" />
        </div>

        {/* Name / meta */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h1 className="font-display text-2xl font-bold text-foreground">{app.full_name}</h1>
            {app.stage_name && (
              <span className="text-sm text-muted-foreground">({app.stage_name})</span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-3">
            <span className="inline-flex items-center gap-1">
              <TypeIcon className="w-3.5 h-3.5" />
              {typeLabel}
            </span>
            {app.city && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {[app.city, app.state].filter(Boolean).join(', ')}
              </span>
            )}
            <span className="text-xs">
              Applied{' '}
              {new Date(app.created_at).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>

          {/* Contact */}
          <div className="flex flex-wrap gap-3">
            <a
              href={`mailto:${app.email}`}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Mail className="w-3.5 h-3.5" />
              {app.email}
            </a>
            {app.phone && (
              <a
                href={`tel:${app.phone}`}
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                {app.phone}
              </a>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-3 md:flex-col md:items-end">
          {/* Status picker */}
          <div className="relative">
            <button
              onClick={() => setStatusOpen((v) => !v)}
              className={cn(
                'inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all',
                STATUS_STYLES[app.status],
              )}
            >
              {app.status}
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {statusOpen && (
              <div className="absolute right-0 top-full mt-1 bg-popover border border-border rounded-xl shadow-xl z-20 py-1 min-w-[140px]">
                {STATUS_OPTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleStatus(s)}
                    className={cn(
                      'w-full text-left px-4 py-2 text-sm transition-colors hover:bg-muted/50',
                      app.status === s ? 'text-primary font-medium' : 'text-foreground',
                    )}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Favorite */}
          <button
            onClick={handleFavorite}
            disabled={isPending}
            aria-label={app.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
            className={cn(
              'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-all',
              app.is_favorite
                ? 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                : 'border-border text-muted-foreground hover:border-amber-500/30 hover:text-amber-400',
            )}
          >
            <Heart className={cn('w-3.5 h-3.5', app.is_favorite && 'fill-amber-400')} />
            {app.is_favorite ? 'Favorited' : 'Favorite'}
          </button>
        </div>
      </div>

      {/* Main 2-col grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left col — profile details */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          {/* Social reach */}
          <SectionCard title="Audience & Social" icon={TrendingUp}>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { label: 'Instagram', value: app.instagram_follower_count },
                { label: 'TikTok', value: app.tiktok_follower_count },
                { label: 'Total Reach', value: app.total_audience_reach },
              ].map((s) => (
                <div key={s.label} className="bg-muted/30 rounded-xl p-3 text-center">
                  <p className="text-lg font-bold font-display text-foreground tabular-nums">
                    {s.value != null ? s.value.toLocaleString() : '—'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
            <InfoRow label="Instagram" value={app.instagram_link} href={getInstagramUrl(app.instagram_link) ?? undefined} />
            <InfoRow label="TikTok" value={app.tiktok_link} href={getTikTokUrl(app.tiktok_link) ?? undefined} />
            <BoolRow label="Will promote events" value={app.willing_to_promote_event} />
            <BoolRow label="Works in Chicago" value={app.willing_to_work_in_chicago} />
            <BoolRow label="Works in suburbs" value={app.willing_to_work_in_suburbs} />
          </SectionCard>

          {/* DJ Profile */}
          {dj && (
            <SectionCard title="DJ Profile" icon={Music}>
              <ArrayRow label="Genres" value={dj.genres} />
              <InfoRow label="Setup" value={dj.dj_setup} />
              <InfoRow label="Age" value={dj.age} />
              <InfoRow label="Biggest Show" value={dj.biggest_show} />
              <InfoRow label="Mix Link" value={dj.mix_link} href={dj.mix_link ?? undefined} />
              <InfoRow label="SoundCloud" value={dj.soundcloud_link} href={dj.soundcloud_link ?? undefined} />
              <InfoRow label="SC Followers" value={dj.soundcloud_followers} />
              <InfoRow label="Facebook" value={dj.facebook_link} href={dj.facebook_link ?? undefined} />
              <InfoRow label="Pay (1hr set)" value={dj.desired_pay_for_1_hour_set} />
              <BoolRow label="Sold tickets before" value={dj.has_sold_tickets_before} />
              <BoolRow label="Can sell 15 tickets" value={dj.can_sell_15_tickets} />
            </SectionCard>
          )}

          {/* Photo / Video Profile */}
          {photo && (
            <SectionCard title="Photo / Video Profile" icon={Camera}>
              <InfoRow label="Role" value={photo.role_type} />
              <InfoRow label="Experience" value={photo.years_experience != null ? `${photo.years_experience} yrs` : null} />
              <ArrayRow label="Event Types" value={photo.event_types_shot} />
              <ArrayRow label="Deliverables" value={photo.deliverables} />
              <InfoRow label="Turnaround" value={photo.typical_turnaround_time} />
              <InfoRow label="Equipment" value={photo.equipment_list} />
              <InfoRow label="Portfolio" value={photo.portfolio_link} href={photo.portfolio_link ?? undefined} />
              <InfoRow label="Best Work" value={photo.best_work_link} href={photo.best_work_link ?? undefined} />
              <InfoRow label="Pay (5hr shift)" value={photo.desired_pay_for_5_hour_shift} />
              <BoolRow label="Has own equipment" value={photo.has_own_equipment} />
              <BoolRow label="Comfortable low-light" value={photo.comfortable_low_light} />
              <BoolRow label="Available 5hr shift" value={photo.available_for_5_hour_shift} />
              <BoolRow label="Open to posting content" value={photo.open_to_posting_content} />
            </SectionCard>
          )}

          {/* Performer Profile */}
          {performer && (
            <SectionCard title="Performer Profile" icon={Sparkles}>
              <InfoRow label="Type" value={performer.performer_type} />
              <InfoRow label="Experience" value={performer.years_experience != null ? `${performer.years_experience} yrs` : null} />
              <ArrayRow label="Performance Styles" value={performer.performance_styles} />
              <InfoRow label="Solo / Group" value={performer.solo_group_or_both} />
              <InfoRow label="Desired Pay" value={performer.desired_pay} />
              <InfoRow label="Portfolio" value={performer.portfolio_link} href={performer.portfolio_link ?? undefined} />
              <InfoRow label="Best Work" value={performer.best_work_link} href={performer.best_work_link ?? undefined} />
              <BoolRow label="Comfortable in nightlife" value={performer.comfortable_in_nightlife_environment} />
              <BoolRow label="Multiple sets" value={performer.able_to_perform_multiple_sets} />
              <BoolRow label="Provides own outfits" value={performer.provides_own_outfits} />
              <BoolRow label="Uses fire" value={performer.uses_fire} />
              {performer.uses_fire && performer.fire_experience_and_insurance && (
                <InfoRow label="Fire details" value={performer.fire_experience_and_insurance} />
              )}
              <BoolRow label="Open to promoting" value={performer.open_to_promoting_event} />
            </SectionCard>
          )}

          {/* Additional notes from applicant */}
          {app.additional_notes && (
            <SectionCard title="Applicant Notes" icon={Users}>
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                {app.additional_notes}
              </p>
            </SectionCard>
          )}
        </div>

        {/* Right col — admin tools */}
        <div className="flex flex-col gap-5">
          {/* Rating */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="font-display font-semibold text-sm text-foreground mb-3">Rating</h3>
            <StarRating value={app.internal_rating} onChange={handleRating} />
            {app.internal_rating && (
              <p className="text-xs text-muted-foreground mt-2">{app.internal_rating}/5 stars</p>
            )}
          </div>

          {/* Tags */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="font-display font-semibold text-sm text-foreground mb-3">Tags</h3>
            <TagsPanel applicationId={app.id} tags={app.tags ?? []} />
          </div>

          {/* Internal notes */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="font-display font-semibold text-sm text-foreground mb-3">
              Internal Notes
              {notes.length > 0 && (
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  ({notes.length})
                </span>
              )}
            </h3>
            <NotesPanel applicationId={app.id} notes={notes} />
          </div>

          {/* Quick info */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="font-display font-semibold text-sm text-foreground mb-3">Quick Info</h3>
            <InfoRow label="Desired Pay" value={app.desired_pay} />
            <InfoRow label="App ID" value={app.app_id} />
          </div>
        </div>
      </div>
    </div>
  )
}
