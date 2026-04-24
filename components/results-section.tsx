"use client"

import { useEffect, useRef, useState } from "react"
import { Eye, Users, MessageCircle, UserPlus, Zap, TrendingUp, Play, Share2, MousePointerClick, Ticket, MapPin } from "lucide-react"

const mainStats = [
  { icon: Eye, value: "304,247", label: "Monthly Views" },
  { icon: Users, value: "116,121", label: "Accounts Reached" },
  { icon: MessageCircle, value: "24,870", label: "Interactions" },
  { icon: UserPlus, value: "4,504", label: "Profile Visits" },
]

const highlights = [
  { icon: TrendingUp, value: "80.9K", label: "Top Post Views" },
  { icon: Play, value: "58K", label: "Second Top Post" },
  { icon: Zap, value: "59%", label: "Non-Follower Views" },
  { icon: Share2, value: "90", label: "Conversations Started" },
]

function AnimatedNumber({ value }: { value: string }) {
  const [displayValue, setDisplayValue] = useState("0")
  const ref = useRef<HTMLSpanElement>(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true
          const cleanValue = value.replace(/[^0-9.]/g, "")
          const numericValue = parseFloat(cleanValue)
          const suffix = value.includes("K") ? "K" : value.includes("%") ? "%" : ""
          const duration = 2000
          const startTime = Date.now()

          const animate = () => {
            const elapsed = Date.now() - startTime
            const progress = Math.min(elapsed / duration, 1)
            const easeOut = 1 - Math.pow(1 - progress, 3)
            const current = numericValue * easeOut

            if (value.includes(",")) {
              setDisplayValue(Math.floor(current).toLocaleString())
            } else if (suffix === "K") {
              setDisplayValue(current.toFixed(1) + suffix)
            } else if (suffix === "%") {
              setDisplayValue(Math.floor(current) + suffix)
            } else {
              setDisplayValue(Math.floor(current).toString())
            }

            if (progress < 1) {
              requestAnimationFrame(animate)
            } else {
              setDisplayValue(value)
            }
          }
          animate()
        }
      },
      { threshold: 0.3 }
    )

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [value])

  return <span ref={ref}>{displayValue}</span>
}

export function ResultsSection() {
  return (
    <section id="results" className="py-20 md:py-28 relative overflow-x-clip overflow-y-visible w-full max-w-full">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-card/50 to-transparent" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="text-secondary text-sm font-semibold uppercase tracking-wider">
            Performance
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mt-4 mb-4">
            Real Results, Real Reach
          </h2>
          <div className="inline-flex items-center gap-1.5 bg-muted/80 px-4 py-1.5 rounded-full border border-border mb-6">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Last 30 Days</span>
          </div>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto leading-relaxed">
            Windy City Raves is more than a social page — it is a discovery platform for Chicago EDM events. Our strongest content consistently drives awareness, profile traffic, and direct audience action.
          </p>
        </div>

        {/* Main stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          {mainStats.map((stat, index) => (
            <div
              key={stat.label}
              className="relative group p-6 md:p-8 rounded-2xl bg-card border border-border hover:border-secondary/50 transition-all duration-300 text-center overflow-hidden"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <stat.icon className="w-8 h-8 mx-auto mb-4 text-secondary" />
              <div className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                <AnimatedNumber value={stat.value} />
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Highlight cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {highlights.map((item, index) => (
            <div
              key={item.label}
              className="p-4 md:p-6 rounded-xl bg-muted/50 border border-border/50 text-center group hover:bg-muted transition-colors"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <item.icon className="w-5 h-5 mx-auto mb-2 text-primary group-hover:scale-110 transition-transform" />
              <div className="text-xl md:text-2xl font-bold text-foreground">
                <AnimatedNumber value={item.value} />
              </div>
              <div className="text-xs text-muted-foreground">{item.label}</div>
            </div>
          ))}
        </div>
        
        {/* What This Means For Your Event */}
        <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
          <h3 className="text-xl md:text-2xl font-bold text-center mb-6">What This Means For Your Event</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-4">
              <Eye className="w-6 h-6 mx-auto mb-2 text-secondary" />
              <p className="text-sm text-muted-foreground">More people seeing your lineup</p>
            </div>
            <div className="p-4">
              <MousePointerClick className="w-6 h-6 mx-auto mb-2 text-secondary" />
              <p className="text-sm text-muted-foreground">More profile clicks to your page</p>
            </div>
            <div className="p-4">
              <Ticket className="w-6 h-6 mx-auto mb-2 text-secondary" />
              <p className="text-sm text-muted-foreground">Increased ticket awareness</p>
            </div>
            <div className="p-4">
              <MapPin className="w-6 h-6 mx-auto mb-2 text-secondary" />
              <p className="text-sm text-muted-foreground">Stronger local presence</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
