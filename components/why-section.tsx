"use client"

import { MapPin, Eye, TrendingUp, Calendar } from "lucide-react"

const features = [
  {
    icon: MapPin,
    title: "Local Audience",
    description:
      "Chicago-based EDM audience already looking for events and nightlife.",
    stat: "Chicago",
    statLabel: "Focused",
  },
  {
    icon: Eye,
    title: "New People, Not Just Followers",
    description:
      "Your event reaches people who don't already follow us - real discovery, not just recycled audience.",
    stat: "59%",
    statLabel: "Non-Followers",
  },
  {
    icon: TrendingUp,
    title: "High Visibility",
    description:
      "Top content regularly reaches tens of thousands of viewers.",
    stat: "15.8M",
    statLabel: "Top 3 Posts",
  },
  {
    icon: Calendar,
    title: "Event Focused",
    description:
      "Content structured for event promotion - giveaways, roundups, features.",
    stat: "Weekly",
    statLabel: "Roundups",
  },
]

export function WhySection() {
  return (
    <section className="py-16 md:py-24 relative overflow-x-clip overflow-y-visible w-full max-w-full">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header - simplified */}
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 text-balance">
            Why Windy City Raves?
          </h2>
          <p className="text-muted-foreground text-base max-w-xl mx-auto">
            Connecting Chicago&apos;s EDM community with events they want to see.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-all">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <span className="text-lg font-bold text-foreground">{feature.stat}</span>
                  <span className="text-xs text-muted-foreground ml-1">{feature.statLabel}</span>
                </div>
              </div>
              
              <h3 className="text-sm font-semibold mb-1 text-foreground">
                {feature.title}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
