'use client'
// form-shell v3 — force rebuild
import { useRef, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Step {
  label: string
}

interface FormShellProps {
  title: string
  subtitle: string
  steps: Step[]
  currentStep: number
  children: React.ReactNode
}

export function FormShell({ title, subtitle, steps, currentStep, children }: FormShellProps) {
  const topRef = useRef<HTMLDivElement>(null)
  const progress = ((currentStep + 1) / steps.length) * 100

  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [currentStep])

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div ref={topRef} className="absolute top-0" aria-hidden="true" />
      {/* Top bar */}
      <header className="border-b border-gray-100 bg-white sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-gray-400 hover:text-gray-700 transition-colors text-sm shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-gray-400 font-medium">
                Step {currentStep + 1} of {steps.length}{steps[currentStep] ? ` — ${steps[currentStep].label}` : ''}
              </span>
              <span className="text-xs text-gray-400">{Math.round(progress)}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-[#E31837] transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>


        </div>
      </header>

      {/* Step breadcrumb (desktop) */}
      <div className="hidden md:block max-w-2xl mx-auto w-full px-4 pt-6">
        <div className="flex items-center gap-2">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-2 flex-1 min-w-0">
              <div
                className={cn(
                  'flex items-center gap-1.5 text-xs font-medium shrink-0',
                  i < currentStep
                    ? 'text-[#E31837]'
                    : i === currentStep
                      ? 'text-gray-900'
                      : 'text-gray-400',
                )}
              >
                {i < currentStep ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#E31837] shrink-0" />
                ) : (
                  <span
                    className={cn(
                      'w-4 h-4 rounded-full border text-[10px] flex items-center justify-center shrink-0',
                      i === currentStep
                        ? 'border-[#E31837] text-[#E31837]'
                        : 'border-gray-300 text-gray-400',
                    )}
                  >
                    {i + 1}
                  </span>
                )}
                <span className="hidden lg:inline truncate">{step.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={cn('flex-1 h-px', i < currentStep ? 'bg-[#E31837]/30' : 'bg-gray-200')} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form header */}
      <div className="max-w-2xl mx-auto w-full px-4 pt-8 pb-4">
        <h1 className="font-display text-2xl md:text-3xl font-bold text-gray-900 tracking-tight text-balance">
          {title}
        </h1>
        <p className="text-gray-500 mt-2 text-sm leading-relaxed">{subtitle}</p>
      </div>

      {/* Form content */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 pb-16">{children}</main>
    </div>
  )
}
