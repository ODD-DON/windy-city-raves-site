import Link from "next/link"
import { Calendar, Megaphone, Users, Shield, Music, MapPin } from "lucide-react"
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
  },
  {
    icon: Megaphone,
    title: "Promote Your Event",
    description: "Get your event in front of thousands of rave fans with our promotion packages.",
    href: "/promote",
    cta: "Promote Now",
  },
  {
    icon: Users,
    title: "Join the Talent Roster",
    description: "Apply as a DJ, photographer, videographer, or performer to work WCR events.",
    href: "/apply",
    cta: "Apply Today",
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center text-center px-4 py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-950 via-black to-blue-950 -z-10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-800/20 via-transparent to-transparent -z-10" />

        <div className="flex items-center gap-2 mb-6">
          <Music className="h-8 w-8 text-purple-400" />
          <span className="text-purple-400 font-semibold tracking-widest uppercase text-sm">
            Windy City Raves
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
          {"Chicago's Home for "}
          <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Electronic Music
          </span>
        </h1>

        <p className="text-lg md:text-xl text-zinc-300 max-w-2xl mb-10">
          Discover events, promote your shows, and join the WCR talent community — all in one place.
        </p>

        <div className="flex flex-wrap gap-4 justify-center">
          <Button size="lg" asChild className="bg-purple-600 hover:bg-purple-700 text-white">
            <Link href="/events">
              <Calendar className="mr-2 h-5 w-5" />
              Browse Events
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="border-zinc-600 text-white hover:bg-zinc-800">
            <Link href="/apply">
              <Users className="mr-2 h-5 w-5" />
              Apply to WCR
            </Link>
          </Button>
        </div>

        <div className="flex items-center gap-2 mt-10 text-zinc-500 text-sm">
          <MapPin className="h-4 w-4" />
          <span>Chicago, IL — and expanding to more cities</span>
        </div>
      </section>

      {/* Feature cards */}
      <section className="px-4 py-20 max-w-5xl mx-auto w-full">
        <h2 className="text-3xl font-bold text-center text-white mb-12">Everything You Need</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f) => (
            <Card
              key={f.href}
              className="bg-zinc-900 border-zinc-800 hover:border-purple-700 transition-colors"
            >
              <CardContent className="p-6 flex flex-col gap-4">
                <div className="w-12 h-12 rounded-lg bg-purple-900/50 flex items-center justify-center">
                  <f.icon className="h-6 w-6 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">{f.title}</h3>
                <p className="text-zinc-400 text-sm flex-1">{f.description}</p>
                <Button variant="ghost" size="sm" asChild className="w-fit text-purple-400 hover:text-purple-300 px-0">
                  <Link href={f.href}>{f.cta} →</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Admin link (subtle) */}
      <div className="text-center pb-8">
        <Link href="/admin/login" className="text-xs text-zinc-600 hover:text-zinc-500 transition-colors">
          <Shield className="inline h-3 w-3 mr-1" />
          Admin
        </Link>
      </div>

      <Footer />
    </div>
  )
}
