'use client'

import Link from 'next/link'
import { CheckCircle2, ArrowLeft } from 'lucide-react'

interface SuccessScreenProps {
  applicantType: 'dj' | 'photo_video' | 'performer'
  name: string
}

const typeLabels: Record<string, string> = {
  dj: 'DJ',
  photo_video: 'Photo / Video',
  performer: 'Performer',
}

export function SuccessScreen({ applicantType, name }: SuccessScreenProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="flex justify-center mb-7">
          <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-primary" />
          </div>
        </div>

        {/* Heading */}
        <h1 className="font-display text-3xl font-bold text-foreground mb-3">
          Application Received
        </h1>
        <p className="text-muted-foreground text-base leading-relaxed mb-2 text-pretty">
          Thanks, <span className="text-foreground font-medium">{name}</span>. Your{' '}
          <span className="text-primary">{typeLabels[applicantType]}</span> application has been
          submitted to Windy City Raves.
        </p>
        <p className="text-muted-foreground text-sm leading-relaxed text-pretty">
          Our team reviews every application personally. If there&apos;s a good fit for an upcoming
          event, we&apos;ll be in touch via the email and phone you provided.
        </p>

        {/* Divider */}
        <div className="border-t border-border my-8" />

        {/* Next steps */}
        <div className="bg-card border border-border rounded-2xl p-5 text-left mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            What happens next
          </p>
          <ul className="flex flex-col gap-2">
            {[
              'Our team reviews your application',
              'We check out your social pages and portfolio',
              "If it's a fit, we'll reach out to discuss details",
              'You get booked for an upcoming WCR event',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Back button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to WCR Talent Portal
        </Link>
      </div>
    </div>
  )
}
