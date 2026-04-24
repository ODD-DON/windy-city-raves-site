import Link from "next/link"
import Image from "next/image"
import { Calendar, Megaphone, Users, MapPin, ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Footer } from "@/components/footer"

const features = [
  {
    icon: Calendar,
    title: "Events Calendar",
    description: "Browse upcoming raves, festivals, and electronic music events near you.",
    href: "/events",
    cta: "View Events",
    gradient: "from-red-500/20 to-blue-500/20",
    iconColor: "text-red-400",
  },
  {
    icon: Megaphone,
    title: "Promote Your Event",
    description: "Get your event in front of thousands of rave fans with our promotion packages.",
    href: "/promote",
    cta: "Promote Now",
    gradient: "from-blue-500/20 to-red-500/20",
    iconColor: "text-blue-400",
  },
  {
    icon: Users,
    title: "Join the Talent Roster",
    description: "Apply as a DJ, photographer, videographer, or performer to work WCR events.",
    href: "/apply",
    cta: "Apply Today",
    gradient: "from-red-500/20 to-blue-500/20",
    iconColor: "text-red-400",
  },
]

const stats = [
  { value: "19.5K+", label: "Followers" },
  { value: "300K+", label: "Monthly Reach" },
  { value: "500+", label: "Events Listed" },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center text-center px-4 py-24 md:py-32 overflow-hidden">
        {/* Background gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/80 via-background to-red-950/40 -z-10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent -z-10" />
        <div className="absolute top-1/4 -left-32 w-64 h-64 bg-red-600/30 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl -z-10" />

        {/* Logo */}
        <div className="mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="relative w-[180px] md:w-[240px] h-[77px] md:h-[103px]">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/New%20Logo-tGlIj5rYBWQGemKw5Ce0TbbPJg5oJJ.png"
              alt="Windy City Raves"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Badge */}
        <div className="flex items-center gap-2 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
          <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-full px-4 py-1.5">
            <Sparkles className="w-4 h-4 text-red-400" />
            <span className="text-red-300 font-medium text-sm">
              Chicago&apos;s Premier EDM Community
            </span>
          </div>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-white mb-6 leading-tight animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150 text-balance">
          {"Your Home for "}
          <span className="bg-gradient-to-r from-red-400 via-blue-400 to-red-400 bg-clip-text text-transparent">
            Electronic Music
          </span>
        </h1>

        <p className="text-lg md:text-xl text-zinc-300 max-w-2xl mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 text-pretty">
          Discover events, promote your shows, and connect with the Chicago rave community — all in one place.
        </p>

        <div className="flex flex-wrap gap-4 justify-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
          <Button size="lg" asChild className="bg-red-600 hover:bg-red-500 text-white font-semibold px-6 py-6 text-base">
            <Link href="/events">
              <Calendar className="mr-2 h-5 w-5" />
              Browse Events
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="border-blue-500/50 text-white hover:bg-blue-500/10 hover:border-blue-400 font-semibold px-6 py-6 text-base">
            <Link href="/apply">
              <Users className="mr-2 h-5 w-5" />
              Join the Team
            </Link>
          </Button>
        </div>

        <div className="flex items-center gap-2 mt-10 text-zinc-500 text-sm animate-in fade-in duration-700 delay-500">
          <MapPin className="h-4 w-4" />
          <span>Chicago, IL — and expanding to more cities</span>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-blue-900/30 bg-blue-950/30 py-8">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-3 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-zinc-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section className="px-4 py-20 max-w-5xl mx-auto w-full">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Everything You Need</h2>
          <p className="text-zinc-400 max-w-xl mx-auto">
            Whether you&apos;re looking for events, promoting shows, or joining our talent roster — we&apos;ve got you covered.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f) => (
            <Card
              key={f.href}
              className="group bg-zinc-900/50 border-blue-900/30 hover:border-red-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/10"
            >
              <CardContent className="p-6 flex flex-col gap-4">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <f.icon className={`h-7 w-7 ${f.iconColor}`} />
                </div>
                <h3 className="text-xl font-semibold text-white">{f.title}</h3>
                <p className="text-zinc-400 text-sm flex-1">{f.description}</p>
                <Button variant="ghost" size="sm" asChild className="w-fit text-red-400 hover:text-red-300 hover:bg-red-500/10 px-0 group/btn">
                  <Link href={f.href} className="flex items-center gap-2">
                    {f.cta}
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-16 bg-gradient-to-b from-blue-950/50 to-background">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Ready to Promote Your Event?
          </h2>
          <p className="text-zinc-400 mb-8 text-pretty">
            Get your event in front of thousands of dedicated electronic music fans in Chicago. 
            Our promotion packages are designed to maximize your reach and ticket sales.
          </p>
          <Button size="lg" asChild className="bg-red-600 hover:bg-red-500 text-white font-semibold">
            <Link href="/promote">
              <Megaphone className="mr-2 h-5 w-5" />
              View Promotion Packages
            </Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  )
}
