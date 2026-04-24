'use client'

import Link from 'next/link'
import { Disc3, Camera, Sparkles, ArrowRight } from 'lucide-react'

const ROLES = [
  {
    href: '/apply/dj',
    icon: Disc3,
    label: 'DJ',
    description: 'Spin sets at Chicago raves & club nights',
    iconBg: 'bg-red-50 group-hover:bg-[#E31837]',
    iconColor: 'text-[#E31837] group-hover:text-white',
    tileBorder: 'hover:border-[#E31837]',
    tileBg: 'hover:bg-red-50/40',
  },
  {
    href: '/apply/photo_video',
    icon: Camera,
    label: 'Photo / Video',
    description: 'Capture the energy of our events',
    iconBg: 'bg-sky-50 group-hover:bg-[#4FC3F7]',
    iconColor: 'text-[#4FC3F7] group-hover:text-white',
    tileBorder: 'hover:border-[#4FC3F7]',
    tileBg: 'hover:bg-sky-50/40',
  },
  {
    href: '/apply/performer',
    icon: Sparkles,
    label: 'Performer',
    description: 'Dancers, flow artists, aerialists & more',
    iconBg: 'bg-red-50 group-hover:bg-[#E31837]',
    iconColor: 'text-[#E31837] group-hover:text-white',
    tileBorder: 'hover:border-[#E31837]',
    tileBg: 'hover:bg-red-50/40',
  },
]

export function RoleSelectionPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="max-w-3xl mx-auto w-full px-5 pt-12 pb-6 text-center">
        <div className="inline-flex items-center gap-2 bg-red-50 border border-red-100 rounded-full px-4 py-1.5 mb-6">
          <span className="w-2 h-2 rounded-full bg-[#E31837] animate-pulse" />
          <span className="text-xs font-semibold text-[#E31837] uppercase tracking-widest">
            Now Accepting Applications
          </span>
        </div>
        <h1 className="font-display text-3xl md:text-4xl font-bold text-gray-900 leading-tight text-balance">
          Join the WCR Talent Roster
        </h1>
        <p className="mt-3 text-gray-500 text-base leading-relaxed max-w-md mx-auto text-pretty">
          {"Chicago's premier rave and nightlife events are looking for talented people. Select your role to get started."}
        </p>
      </div>

      <main className="flex-1 max-w-3xl mx-auto w-full px-5 pb-16">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-5 text-center">
          I am applying as a...
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ROLES.map((role) => {
            const Icon = role.icon
            return (
              <Link
                key={role.href}
                href={role.href}
                className={`group relative flex flex-col items-center gap-4 rounded-2xl border-2 border-gray-200 bg-white px-4 py-8 text-center transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.97] ${role.tileBorder} ${role.tileBg}`}
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-200 shrink-0 ${role.iconBg}`}>
                  <Icon className={`w-8 h-8 transition-colors duration-200 ${role.iconColor}`} strokeWidth={1.5} />
                </div>
                <div className="w-full">
                  <p className="font-display text-lg font-bold text-gray-900 leading-tight text-balance">{role.label}</p>
                  <p className="mt-1.5 text-xs text-gray-500 leading-snug text-pretty">{role.description}</p>
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold text-gray-400 group-hover:text-gray-700 transition-colors">
                  Apply now <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            )
          })}
        </div>

        <div className="flex items-center justify-center gap-8 mt-14 opacity-30">
          {[...Array(4)].map((_, i) => (
            <svg key={i} viewBox="0 0 50 50" className="w-6 h-6 fill-[#E31837]" aria-hidden="true">
              <polygon points="25,3 29,18 44,18 32,27 36,42 25,33 14,42 18,27 6,18 21,18" />
            </svg>
          ))}
        </div>

        <p className="text-center text-xs text-gray-400 mt-5 flex items-center justify-center gap-2">
          <span>Questions? DM</span>
          <a
            href="https://instagram.com/windycityraves"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 underline hover:text-gray-600 transition-colors"
            aria-label="DM us on Instagram @windycityraves"
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current" aria-hidden="true">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            @windycityraves
          </a>
          <Link
            href="/auth/login"
            className="text-gray-300 hover:text-gray-500 transition-colors"
            aria-label="Admin login"
            title="Admin"
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current" aria-hidden="true">
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
            </svg>
          </Link>
        </p>
      </main>
    </div>
  )
}
