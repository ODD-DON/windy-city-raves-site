"use client"

import { Gift, Video, Pin, Bell } from "lucide-react"

const addons = [
  {
    icon: Gift,
    name: "Giveaway Boost",
    price: "+$150",
    description: "Run a giveaway to drive engagement and ticket interest",
  },
  {
    icon: Video,
    name: "Reel Creation",
    price: "+$150",
    description: "Custom reel content for maximum reach and discovery",
  },
  {
    icon: Pin,
    name: "Pinned Post / Priority",
    price: "+$75",
    description: "Get your event pinned or prioritized in feed placement",
  },
  {
    icon: Bell,
    name: "Extra Story Reminder",
    price: "+$40",
    description: "Additional story reminder closer to event date",
  },
]

export function AddOnsSection() {
  return (
    <section id="addons" className="py-20 md:py-28 relative overflow-x-clip w-full max-w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="text-secondary text-sm font-semibold uppercase tracking-wider">
            Extras
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mt-4 mb-6">
            Add-Ons
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Enhance any package with additional promotional power.
          </p>
        </div>

        {/* Add-on cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {addons.map((addon) => (
            <div
              key={addon.name}
              className="group relative p-6 rounded-xl bg-card border border-border hover:border-secondary/50 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                    <addon.icon className="w-5 h-5 text-secondary" />
                  </div>
                  <span className="text-xl font-bold text-primary">{addon.price}</span>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {addon.name}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {addon.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Note */}
        <p className="text-center text-sm text-muted-foreground mt-10">
          Add-ons can be bundled into any campaign for stronger visibility and engagement.
        </p>
      </div>
    </section>
  )
}
