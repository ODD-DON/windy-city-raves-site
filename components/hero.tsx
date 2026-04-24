"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, Eye, Users, TrendingUp, Zap } from "lucide-react"
import Image from "next/image"

const stats = [
  { icon: Users, value: "19.5K", label: "Followers", color: "text-primary", trend: "+12%" },
  { icon: Eye, value: "304K", label: "Views", color: "text-secondary", trend: "+34%" },
  { icon: TrendingUp, value: "116K", label: "Reached", color: "text-primary", trend: "+28%" },
  { icon: Zap, value: "59%", label: "Non-Followers", color: "text-secondary", trend: "+8%" },
]

function AnimatedCounter({ value }: { value: string }) {
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

            if (suffix === "K") {
              setDisplayValue(current.toFixed(1) + suffix)
            } else if (suffix === "%") {
              setDisplayValue(Math.floor(current) + suffix)
            } else {
              setDisplayValue(Math.floor(current).toLocaleString())
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
      { threshold: 0.5 }
    )

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [value])

  return <span ref={ref}>{displayValue}</span>
}

export function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-[90vh] flex flex-col justify-center pt-16 pb-8 overflow-x-clip overflow-y-visible w-full max-w-full"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-48 md:w-72 h-48 md:h-72 bg-primary/10 rounded-full blur-3xl animate-pulse pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-48 md:w-72 h-48 md:h-72 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700 flex justify-center">
          <div className="relative w-[200px] md:w-[280px] h-[86px] md:h-[120px]">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/New%20Logo-tGlIj5rYBWQGemKw5Ce0TbbPJg5oJJ.png"
              alt="Windy City Raves"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
          <span className="text-foreground">Get Your Event Seen by</span>
          <br />
          <span className="gradient-text">Thousands of Chicago Ravers</span>
        </h1>

        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-6 leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 text-balance">
          High-visibility posts, stories, and giveaways for DJs, venues, and festivals.
        </p>
        
        <div className="flex flex-wrap justify-center gap-2 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-350">
          <span className="text-xs bg-muted px-3 py-1 rounded-full text-muted-foreground">DJs and Collectives</span>
          <span className="text-xs bg-muted px-3 py-1 rounded-full text-muted-foreground">Clubs and Venues</span>
          <span className="text-xs bg-muted px-3 py-1 rounded-full text-muted-foreground">Event Promoters</span>
          <span className="text-xs bg-muted px-3 py-1 rounded-full text-muted-foreground">Festivals</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-450">
          <Button
            asChild
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-5 transition-all hover:scale-105"
          >
            <a href="#contact">
              Promote My Event
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-border text-foreground hover:bg-muted font-semibold px-6 py-5 transition-all hover:scale-105"
          >
            <a href="/events">Browse Events</a>
          </Button>
        </div>

        <div className="text-center mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground bg-muted/80 px-4 py-1.5 rounded-full border border-border">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            Last 30 Days
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 delay-550">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="relative rounded-xl p-4 text-center group bg-card border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-secondary/0 group-hover:from-primary/5 group-hover:to-secondary/5 transition-all duration-500" />
              
              <div className="relative">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <stat.icon className={`w-4 h-4 ${stat.color} group-hover:scale-110 transition-transform`} />
                  <span className="text-[10px] font-semibold text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded-full flex items-center">
                    <TrendingUp className="w-2.5 h-2.5 mr-0.5" />
                    {stat.trend}
                  </span>
                </div>
                <div className={`text-2xl md:text-3xl font-bold ${stat.color} mb-0.5`}>
                  <AnimatedCounter value={stat.value} />
                </div>
                <div className="text-[11px] md:text-xs text-muted-foreground">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
