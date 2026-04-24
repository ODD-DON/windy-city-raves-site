"use client"

import { Check, Zap, Star, Crown } from "lucide-react"
import { Button } from "@/components/ui/button"

const packages = [
  {
    name: "Boost",
    price: 99,
    icon: Zap,
    popular: false,
    bestFor: "Great for testing promotion with strong visibility",
    visibility: "3K–10K views",
    avgViews: 6500,
    features: [
      "1 feed post",
      "1 Instagram story post",
      "Event/venue/artist tagging",
      "Professionally written caption",
    ],
  },
  {
    name: "Amplify",
    price: 249,
    icon: Star,
    popular: true,
    bestFor: "Best value for serious event promotion",
    visibility: "10K–25K+ views",
    avgViews: 17500,
    features: [
      "1 feed post",
      "2 story posts",
      'Featured in "Shows This Weekend"',
      "Professionally written caption",
      "Preferred posting timing",
    ],
  },
  {
    name: "Takeover",
    price: 599,
    icon: Crown,
    popular: false,
    bestFor: "Maximum exposure for high-impact campaigns",
    visibility: "25K–80K+ views",
    avgViews: 52500,
    features: [
      "2 premium feed posts",
      "3 to 5 story posts",
      "Pinned on page until your event",
      'Featured in "Shows This Weekend"',
      "1 reel or giveaway-style promo",
      "Priority placement and posting strategy",
    ],
  },
]

export function PackagesSection() {
  return (
    <section id="packages" className="py-20 md:py-28 relative overflow-x-clip overflow-y-visible w-full max-w-full">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/3 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="text-primary text-sm font-semibold uppercase tracking-wider">
            Pricing
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mt-4 mb-6">
            Promotion Packages
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-6">
            Choose the package that fits your event and goals.
          </p>
          
          <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-green-600">Top campaigns have reached over 80,000 viewers</span>
          </div>
        </div>

        {/* Package cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {packages.map((pkg) => (
              <div
                key={pkg.name}
                className={`relative rounded-2xl p-6 md:p-8 transition-all duration-300 hover:-translate-y-2 ${
                  pkg.popular
                    ? "bg-card border-2 border-primary"
                    : "bg-card border border-border hover:border-muted-foreground/30"
                }`}
              >
                {/* Popular badge */}
                {pkg.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}

                {/* Package header */}
                <div className="text-center mb-6">
                  <div
                    className={`w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4 ${
                      pkg.popular ? "bg-primary/20" : "bg-muted"
                    }`}
                  >
                    <pkg.icon
                      className={`w-7 h-7 ${
                        pkg.popular ? "text-primary" : "text-muted-foreground"
                      }`}
                    />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">{pkg.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl md:text-5xl font-bold text-foreground">
                      ${pkg.price}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{pkg.bestFor}</p>
                </div>

                {/* Visibility badge */}
                <div className="bg-muted/50 rounded-lg p-3 mb-6 text-center">
                  <span className="text-sm text-muted-foreground">Expected reach: </span>
                  <span className="text-sm font-semibold text-secondary">{pkg.visibility}</span>
                  <div className="text-[10px] text-muted-foreground mt-1">Based on last 30 days</div>
                </div>

                {/* Features list */}
                <ul className="space-y-3 mb-8">
                  {pkg.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check
                        className={`w-5 h-5 mt-0.5 shrink-0 ${
                          pkg.popular ? "text-primary" : "text-secondary"
                        }`}
                      />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA button */}
                <Button
                  asChild
                  className={`w-full font-semibold transition-all hover:scale-[1.02] ${
                    pkg.popular
                      ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                      : "bg-muted hover:bg-muted/80 text-foreground"
                  }`}
                  size="lg"
                >
                  <a href="#contact">Get My Event Featured</a>
                </Button>
              </div>
            ))}
        </div>

        {/* Pricing note */}
        <div className="text-center mt-10 space-y-2">
          <p className="text-sm font-medium text-foreground">Limited promotional slots available each week to maintain content quality.</p>
          <p className="text-xs text-muted-foreground">Pricing may vary based on event size, turnaround time, and custom content needs.</p>
        </div>
      </div>
    </section>
  )
}
