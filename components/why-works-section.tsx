"use client"

import { Layers, Calendar, Sparkles } from "lucide-react"

const points = [
  {
    icon: Layers,
    title: "Multi-touch visibility beats one-time posting",
    description:
      "Multiple touchpoints across feed, stories, and features creates stronger recall and action.",
  },
  {
    icon: Calendar,
    title: "Weekly roundup placements help reinforce awareness",
    description:
      "Being featured in our weekly event roundups keeps your event top of mind.",
  },
  {
    icon: Sparkles,
    title: "Giveaways and reels create stronger discovery",
    description:
      "Interactive content drives engagement and expands reach beyond our existing audience.",
  },
]

export function WhyWorksSection() {
  return (
    <section className="py-20 md:py-28 relative overflow-x-clip w-full max-w-full">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-card/30 to-transparent pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="text-primary text-sm font-semibold uppercase tracking-wider">
            Strategy
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mt-4 mb-6">
            Why These Packages Work
          </h2>
        </div>

        {/* Points */}
        <div className="space-y-6">
          {points.map((point, index) => (
            <div
              key={point.title}
              className="group flex items-start gap-4 md:gap-6 p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300"
            >
              <div className="shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <point.icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-bold text-primary/60 uppercase tracking-wider">
                    0{index + 1}
                  </span>
                  <h3 className="text-lg md:text-xl font-semibold text-foreground">
                    {point.title}
                  </h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {point.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
