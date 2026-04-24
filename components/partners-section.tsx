"use client"

import Image from "next/image"

const partners = [
  {
    name: "Lollapalooza",
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LOLLA-xvYJ7RkB5PEkNfwFe5GDmoMK1b1Q6F.png",
  },
  {
    name: "Beyond Wonderland Chicago",
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/BW%20CHICAGO-M19JrIyPVmwiQMgAbkZqOT9W8rQG8v.png",
  },
  {
    name: "Electric Forest",
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EF-lxvOTkQQ4qq7TDSj0BksxsiRumJR1W.png",
  },
  {
    name: "North Coast",
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/NCMF-W2pVJzL28mB72TtZ9Nic1JFwKnnqCn.png",
  },
  {
    name: "Force Fields",
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/FF%20LOGO-1tNF6e5U4UV30cWUMf18hcJLL8EZ39.png",
  },
  {
    name: "Summer Last Festival",
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/SLD%20LOGO-nnOpUK6vTxr9AFvI91Evr51b5G9hJ2.png",
  },
  {
    name: "ARC Music Festival",
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/arc-etRM2JoC4qESoIZuMJmeW9HZtzjpOP.png",
  },
]

export function PartnersSection() {
  return (
    <section className="py-16 md:py-24 bg-muted/30 overflow-x-clip overflow-y-visible w-full max-w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-12">
          <span className="text-primary text-sm font-semibold uppercase tracking-wider">
            Trusted By
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold mt-3 text-balance">
            Featured Partners & Events
          </h2>
        </div>

        {/* Logo marquee - infinite scroll effect */}
        <div className="relative">
          {/* Gradient fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-muted/30 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-muted/30 to-transparent z-10 pointer-events-none" />
          
          {/* Scrolling container - two identical tracks side by side */}
          <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
            {/* First set of logos */}
            {partners.map((partner) => (
              <div
                key={partner.name}
                className="flex-shrink-0 px-8 md:px-12 flex items-center justify-center"
              >
                <div className="relative h-16 md:h-20 w-40 md:w-48 opacity-90 hover:opacity-100 hover:scale-105 transition-all duration-300">
                  <Image
                    src={partner.logo}
                    alt={partner.name}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 160px, 192px"
                  />
                </div>
              </div>
            ))}
            {/* Duplicate set for seamless infinite loop */}
            {partners.map((partner) => (
              <div
                key={`${partner.name}-dup`}
                className="flex-shrink-0 px-8 md:px-12 flex items-center justify-center"
              >
                <div className="relative h-16 md:h-20 w-40 md:w-48 opacity-90 hover:opacity-100 hover:scale-105 transition-all duration-300">
                  <Image
                    src={partner.logo}
                    alt={partner.name}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 160px, 192px"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
