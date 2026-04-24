'use client'
// admin-dashboard v5
import { useState, useMemo, useTransition, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import type { Application, ApplicationStatus, ApplicantType } from '@/lib/types'
import {
  Search,
  Filter,
  Star,
  Music2,
  Camera,
  Sparkles,
  ChevronUp,
  ChevronDown,
  Download,
  ExternalLink,
  Trash2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { deleteApplication } from '@/app/admin/actions'

const STATUS_STYLES: Record<ApplicationStatus, string> = {
  new: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20',
  reviewed: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  shortlisted: 'bg-violet-500/15 text-violet-400 border-violet-500/20',
  approved: 'bg-green-500/15 text-green-400 border-green-500/20',
  rejected: 'bg-red-500/15 text-red-400 border-red-500/20',
  archived: 'bg-muted text-muted-foreground border-border',
}

const TYPE_ICONS: Record<ApplicantType, React.FC<{ className?: string }>> = {
  dj: Music2,
  photo_video: Camera,
  performer: Sparkles,
}

const TYPE_LABELS: Record<ApplicantType, string> = {
  dj: 'DJ',
  photo_video: 'Photo / Video',
  performer: 'Performer',
}

// Helper to build Instagram profile URL from handle or link
function getInstagramUrl(input: string | null | undefined): string | null {
  if (!input) return null
  const trimmed = input.trim()
  if (!trimmed) return null
  // If it's already a full URL, return as-is
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed
  }
  // Strip @ if present and build URL
  const handle = trimmed.startsWith('@') ? trimmed.slice(1) : trimmed
  return `https://www.instagram.com/${handle}`
}

type SortKey = 'created_at' | 'full_name' | 'instagram_follower_count' | 'status'
type SortDir = 'asc' | 'desc'

interface AdminDashboardProps {
  applications: Application[]
  stats: {
    total: number
    new: number
    reviewed: number
    shortlisted: number
    approved: number
    rejected: number
    archived: number
    by_type: { dj: number; photo_video: number; performer: number }
  }
}

export function AdminDashboard({ applications, stats }: AdminDashboardProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  // Initialize state from URL params
  const [search, setSearch] = useState(searchParams.get('q') ?? '')
  const [filterType, setFilterType] = useState<ApplicantType | 'all'>((searchParams.get('type') as ApplicantType) ?? 'all')
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [filterStatus, setFilterStatus] = useState<ApplicationStatus | 'all'>((searchParams.get('status') as ApplicationStatus) ?? 'all')
  const [filterChicago, setFilterChicago] = useState(searchParams.get('chicago') === '1')
  const [filterSuburbs, setFilterSuburbs] = useState(searchParams.get('suburbs') === '1')
  const [filterPromote, setFilterPromote] = useState(searchParams.get('promote') === '1')
  const [filterFavorites, setFilterFavorites] = useState(searchParams.get('favorites') === '1')
  const [minFollowers, setMinFollowers] = useState(searchParams.get('minFollowers') ?? '')
  const [sortKey, setSortKey] = useState<SortKey>((searchParams.get('sort') as SortKey) ?? 'created_at')
  const [sortDir, setSortDir] = useState<SortDir>((searchParams.get('dir') as SortDir) ?? 'desc')
  const [showFilters, setShowFilters] = useState(false)

  // Sync state to URL
  useEffect(() => {
    const params = new URLSearchParams()
    if (search) params.set('q', search)
    if (filterType !== 'all') params.set('type', filterType)
    if (filterStatus !== 'all') params.set('status', filterStatus)
    if (filterChicago) params.set('chicago', '1')
    if (filterSuburbs) params.set('suburbs', '1')
    if (filterPromote) params.set('promote', '1')
    if (filterFavorites) params.set('favorites', '1')
    if (minFollowers) params.set('minFollowers', minFollowers)
    if (sortKey !== 'created_at') params.set('sort', sortKey)
    if (sortDir !== 'desc') params.set('dir', sortDir)
    
    const queryString = params.toString()
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname
    router.replace(newUrl, { scroll: false })
  }, [search, filterType, filterStatus, filterChicago, filterSuburbs, filterPromote, filterFavorites, minFollowers, sortKey, sortDir, pathname, router])

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const filtered = useMemo(() => {
    let list = [...applications]

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (a) =>
          a.full_name.toLowerCase().includes(q) ||
          a.email.toLowerCase().includes(q) ||
          (a.stage_name ?? '').toLowerCase().includes(q) ||
          (a.city ?? '').toLowerCase().includes(q),
      )
    }
    if (filterType !== 'all') list = list.filter((a) => a.applicant_type === filterType)
    if (filterStatus !== 'all') list = list.filter((a) => a.status === filterStatus)
    if (filterChicago) list = list.filter((a) => a.willing_to_work_in_chicago)
    if (filterSuburbs) list = list.filter((a) => a.willing_to_work_in_suburbs)
    if (filterPromote) list = list.filter((a) => a.willing_to_promote_event)
    if (filterFavorites) list = list.filter((a) => a.is_favorite)
    if (minFollowers) {
      const min = parseInt(minFollowers, 10)
      if (!isNaN(min)) list = list.filter((a) => (a.instagram_follower_count ?? 0) >= min)
    }

    list.sort((a, b) => {
      let aVal: string | number = ''
      let bVal: string | number = ''
      if (sortKey === 'created_at') {
        aVal = a.created_at
        bVal = b.created_at
      } else if (sortKey === 'full_name') {
        aVal = a.full_name.toLowerCase()
        bVal = b.full_name.toLowerCase()
      } else if (sortKey === 'instagram_follower_count') {
        aVal = a.instagram_follower_count ?? 0
        bVal = b.instagram_follower_count ?? 0
      } else if (sortKey === 'status') {
        aVal = a.status
        bVal = b.status
      } else if (sortKey === 'desired_pay') {
        // Parse price as number, stripping $ and commas, default to 0
        aVal = parseFloat((a.desired_pay ?? '0').replace(/[$,]/g, '')) || 0
        bVal = parseFloat((b.desired_pay ?? '0').replace(/[$,]/g, '')) || 0
      }
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1
      return 0
    })

    return list
  }, [applications, search, filterType, filterStatus, filterChicago, filterSuburbs, filterPromote, filterFavorites, minFollowers, sortKey, sortDir])

  const exportCSV = () => {
    const headers = [
      'Name', 'Stage Name', 'Email', 'Phone', 'City', 'State', 'Type', 'Status',
      'Instagram', 'IG Followers', 'TikTok', 'TT Followers', 'Desired Pay',
      'Chicago', 'Suburbs', 'Promote', 'Rating', 'Submitted',
    ]
    const rows = filtered.map((a) => [
      a.full_name, a.stage_name ?? '', a.email, a.phone ?? '', a.city ?? '', a.state ?? '',
      a.applicant_type, a.status, a.instagram_link ?? '', a.instagram_follower_count ?? '',
      a.tiktok_link ?? '', a.tiktok_follower_count ?? '', a.desired_pay ?? '',
      a.willing_to_work_in_chicago ? 'Yes' : 'No',
      a.willing_to_work_in_suburbs ? 'Yes' : 'No',
      a.willing_to_promote_event ? 'Yes' : 'No',
      a.internal_rating ?? '', a.created_at,
    ])

    const csv = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `wcr-applications-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const SortIcon = ({ col }: { col: SortKey }) =>
    sortKey === col ? (
      sortDir === 'asc' ? (
        <ChevronUp className="w-3 h-3" />
      ) : (
        <ChevronDown className="w-3 h-3" />
      )
    ) : (
      <ChevronDown className="w-3 h-3 opacity-30" />
    )

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await deleteApplication(id)
      setConfirmDeleteId(null)
    })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Talent Applications</h1>
        <p className="text-muted-foreground mt-1">Review and manage DJ, photographer, and performer applications</p>
      </div>

      {/* Delete confirmation dialog */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl">
            <h2 className="text-base font-semibold text-foreground mb-1">Delete applicant?</h2>
            <p className="text-sm text-muted-foreground mb-5">
              This will permanently remove the applicant and all their data. This cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground transition-colors"
                disabled={isPending}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDeleteId)}
                disabled={isPending}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors disabled:opacity-50"
              >
                {isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-card border border-border rounded-xl px-4 py-3">
          <p className="text-xs text-muted-foreground mb-1">Total</p>
          <p className="text-2xl font-bold font-display text-foreground">{stats.total}</p>
        </div>
        <button
          onClick={() => setFilterStatus(filterStatus === 'new' ? 'all' : 'new')}
          className={cn(
            'bg-card border rounded-xl px-4 py-3 text-left transition-all',
            filterStatus === 'new' ? 'border-cyan-400 bg-cyan-400/5' : 'border-border hover:border-border/80'
          )}
        >
          <p className="text-xs text-muted-foreground mb-1">New</p>
          <p className="text-2xl font-bold font-display text-cyan-400">{stats.new}</p>
        </button>
        <button
          onClick={() => {
            // Toggle "pending" filter (new or reviewed)
            if (filterStatus === 'new' || filterStatus === 'reviewed') {
              setFilterStatus('all')
            } else {
              // Filter to show both new and reviewed - we'll use 'reviewed' and update filter logic
              setFilterStatus('reviewed')
            }
          }}
          className={cn(
            'bg-card border rounded-xl px-4 py-3 text-left transition-all',
            filterStatus === 'reviewed' ? 'border-violet-400 bg-violet-400/5' : 'border-border hover:border-border/80'
          )}
        >
          <p className="text-xs text-muted-foreground mb-1">Pending</p>
          <p className="text-2xl font-bold font-display text-violet-400">{stats.new + stats.reviewed}</p>
        </button>
        <button
          onClick={() => setFilterFavorites((f) => !f)}
          className={cn(
            'bg-card border rounded-xl px-4 py-3 text-left transition-all',
            filterFavorites ? 'border-amber-400 bg-amber-400/5' : 'border-border hover:border-border/80'
          )}
        >
          <p className="text-xs text-muted-foreground mb-1">Favorites</p>
          <p className="text-2xl font-bold font-display text-amber-400">{applications.filter((a) => a.is_favorite).length}</p>
        </button>
      </div>

      {/* Type breakdown */}
      <div className="grid grid-cols-3 gap-3">
        {([
          { type: 'dj', icon: Music2, label: 'DJs', count: stats.by_type.dj, color: 'text-cyan-400' },
          { type: 'photo_video', icon: Camera, label: 'Photo / Video', count: stats.by_type.photo_video, color: 'text-violet-400' },
          { type: 'performer', icon: Sparkles, label: 'Performers', count: stats.by_type.performer, color: 'text-amber-400' },
        ] as const).map((t) => {
          const Icon = t.icon
          return (
            <button
              key={t.type}
              onClick={() => setFilterType(filterType === t.type ? 'all' : t.type)}
              className={cn(
                'flex items-center gap-3 bg-card border rounded-xl px-4 py-3 transition-all text-left',
                filterType === t.type ? 'border-primary bg-primary/5' : 'border-border hover:border-border/80',
              )}
            >
              <Icon className={cn('w-5 h-5', t.color)} />
              <div>
                <p className="text-sm font-semibold text-foreground">{t.count}</p>
                <p className="text-xs text-muted-foreground">{t.label}</p>
              </div>
            </button>
          )
        })}
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col gap-3">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, city..."
              className="w-full rounded-xl bg-input border border-border pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent min-h-[44px]"
            />
          </div>
          <button
            onClick={() => setShowFilters((f) => !f)}
            className={cn(
              'flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all min-h-[44px]',
              showFilters ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-input text-muted-foreground hover:text-foreground',
            )}
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 rounded-xl border border-border bg-input px-4 py-3 text-sm text-muted-foreground hover:text-foreground transition-all min-h-[44px]"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>

        {/* Expanded filters */}
        {showFilters && (
          <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {/* Status filter */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as ApplicationStatus | 'all')}
                  className="w-full rounded-xl bg-input border border-border px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="all">All statuses</option>
                  {(['new', 'reviewed', 'shortlisted', 'approved', 'rejected', 'archived'] as ApplicationStatus[]).map((s) => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>
              {/* Min followers */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Min IG Followers</label>
                <input
                  type="number"
                  value={minFollowers}
                  onChange={(e) => setMinFollowers(e.target.value)}
                  placeholder="e.g. 1000"
                  min={0}
                  className="w-full rounded-xl bg-input border border-border px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
            {/* Boolean filters */}
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Chicago', active: filterChicago, toggle: () => setFilterChicago((v) => !v) },
                { label: 'Suburbs', active: filterSuburbs, toggle: () => setFilterSuburbs((v) => !v) },
                { label: 'Will Promote', active: filterPromote, toggle: () => setFilterPromote((v) => !v) },
                { label: 'Favorites', active: filterFavorites, toggle: () => setFilterFavorites((v) => !v) },
              ].map((f) => (
                <button
                  key={f.label}
                  onClick={f.toggle}
                  className={cn(
                    'rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all',
                    f.active
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-input text-muted-foreground hover:text-foreground',
                  )}
                >
                  {f.label}
                </button>
              ))}
              <button
                onClick={() => {
                  setFilterType('all')
                  setFilterStatus('all')
                  setFilterChicago(false)
                  setFilterSuburbs(false)
                  setFilterPromote(false)
                  setFilterFavorites(false)
                  setMinFollowers('')
                }}
                className="rounded-full border border-border px-3.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:border-border/80 transition-all ml-auto"
              >
                Clear all
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filtered.length} {filtered.length === 1 ? 'applicant' : 'applicants'}
        </p>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3">
                  <button
                    className="flex items-center gap-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground"
                    onClick={() => handleSort('full_name')}
                  >
                    Applicant <SortIcon col="full_name" />
                  </button>
                </th>
                <th className="text-left px-4 py-3 hidden md:table-cell">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Type
                  </span>
                </th>
                <th className="text-left px-4 py-3">
                  <button
                    className="flex items-center gap-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground"
                    onClick={() => handleSort('status')}
                  >
                    Status <SortIcon col="status" />
                  </button>
                </th>
                <th className="text-left px-4 py-3 hidden lg:table-cell">
                  <button
                    className="flex items-center gap-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground"
                    onClick={() => handleSort('instagram_follower_count')}
                  >
                    IG Followers <SortIcon col="instagram_follower_count" />
                  </button>
                </th>
                <th className="text-left px-4 py-3 hidden lg:table-cell">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Location</span>
                </th>
                <th className="text-left px-4 py-3 hidden lg:table-cell">
                  <button
                    className="flex items-center gap-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground"
                    onClick={() => handleSort('desired_pay')}
                  >
                    Price <SortIcon col="desired_pay" />
                  </button>
                </th>
                <th className="text-left px-4 py-3 hidden xl:table-cell">
                  <button
                    className="flex items-center gap-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground"
                    onClick={() => handleSort('created_at')}
                  >
                    Submitted <SortIcon col="created_at" />
                  </button>
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground text-sm">
                    No applications match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((app) => {
                  const TypeIcon = TYPE_ICONS[app.applicant_type]
                  return (
                    <tr
                      key={app.id}
                      className="hover:bg-muted/20 transition-colors group"
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          {app.is_favorite && (
                            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 flex-shrink-0" />
                          )}
                          <div>
                            <p className="text-sm font-medium text-foreground">{app.full_name}</p>
                            {app.stage_name && (
                              <p className="text-xs text-muted-foreground">{app.stage_name}</p>
                            )}
                            <p className="text-xs text-muted-foreground md:hidden">{app.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 hidden md:table-cell">
                        <div className="flex items-center gap-1.5">
                          <TypeIcon className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{TYPE_LABELS[app.applicant_type]}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium', STATUS_STYLES[app.status])}>
                          {app.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 hidden lg:table-cell">
                        {(() => {
                          const igUrl = getInstagramUrl(app.instagram_link)
                          const count = app.instagram_follower_count?.toLocaleString() ?? '—'
                          return igUrl ? (
                            <a
                              href={igUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-foreground tabular-nums hover:text-primary hover:underline transition-colors"
                            >
                              {count}
                            </a>
                          ) : (
                            <span className="text-sm text-foreground tabular-nums">{count}</span>
                          )
                        })()}
                      </td>
                      <td className="px-4 py-3.5 hidden lg:table-cell">
                        <span className="text-xs text-muted-foreground">
                          {[app.city, app.state].filter(Boolean).join(', ') || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 hidden lg:table-cell">
                        <span className="text-xs text-muted-foreground">
                          {app.desired_pay || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 hidden xl:table-cell">
                        <span className="text-xs text-muted-foreground" suppressHydrationWarning>
                          {new Date(app.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/applicants/${app.id}`}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
                          >
                            View <ExternalLink className="w-3 h-3" />
                          </Link>
                          <button
                            onClick={() => setConfirmDeleteId(app.id)}
                            className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                            title="Delete applicant"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
