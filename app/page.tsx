import Link from "next/link"
import Image from "next/image"
import { Calendar, ArrowRight, Eye, Users, BarChart3, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Footer } from "@/components/footer"

const stats = [
  { value: "19.5K", label: "Followers", change: "+12%", icon: Users, color: "text-red-500" },
  { value: "304K", label: "Views", change: "+34%", icon: Eye, color: "text-cyan-500" },
  { value: "116K", label: "Reached", change: "+28%", icon: BarChart3, color: "text-red-500" },
  { value: "59%", label: "Non-Followers", change: "+8%", icon: UserPlus, color: "text-cyan-500" },
]

const audienceTags = [
  "DJs and Collectives",
  "Clubs and Venues", 
  "Event Promoters",
  "Festivals"
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center text-center px-4 pt-16 pb-20 overflow-hidden">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-red-50/50 via-white to-cyan-50/30 -z-10" />
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-cyan-500 to-red-500" />
        
        {/* Logo */}
        <div className="mb-8">
          <div className="relative w-[200px] md:w-[280px] h-[80px] md:h-[110px]">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/New%20Logo-tGlIj5rYBWQGemKw5Ce0TbbPJg5oJJ.png"
              alt="Windy City Raves"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Main Headline */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 leading-tight text-balance max-w-3xl">
          Get Your Event Seen by
        </h1>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 leading-tight text-balance max-w-3xl">
          <span className="text-cyan-500">Thousands of Chicago Ravers</span>
        </h2>

        {/* Subtitle */}
        <p className="text-gray-600 text-lg max-w-2xl mb-8">
          High-visibility posts, stories, and giveaways for DJs, venues, and festivals.
        </p>

        {/* Audience Tags */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {audienceTags.map((tag) => (
            <span 
              key={tag}
              className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-wrap gap-4 justify-center mb-12">
          <Button size="lg" asChild className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 rounded-full">
            <Link href="/promote">
              Promote My Event
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold px-6 rounded-full">
            <Link href="/promote#packages">
              View Packages
            </Link>
          </Button>
        </div>

        {/* Stats Section */}
        <div className="w-full max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-gray-100 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-gray-600 text-sm font-medium">LAST 30 DAYS</span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <div 
                key={stat.label}
                className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm"
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                  <span className="text-xs text-green-500 font-medium">{stat.change}</span>
                </div>
                <div className={`text-2xl md:text-3xl font-bold ${stat.color}`}>
                  {stat.value}
                </div>
                <div className="text-gray-500 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why WCR Section */}
      <section className="px-4 py-16 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-4">
            Why Windy City Raves?
          </h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Connecting Chicago&apos;s EDM community with events they want to see.
          </p>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: "📍", label: "Chicago", sublabel: "Focused", title: "Local Audience", desc: "Chicago-based EDM audience already looking for events and nightlife." },
              { icon: "👁", label: "59%", sublabel: "Non-Followers", title: "New People, Not Just Followers", desc: "Your event reaches people who don't already follow us - real discovery, not just recycled audience." },
              { icon: "📈", label: "15.8M", sublabel: "Top 3 Posts", title: "High Visibility", desc: "Top content regularly reaches tens of thousands of viewers." },
              { icon: "📅", label: "Weekly", sublabel: "Roundups", title: "Event Focused", desc: "Content structured for event promotion - giveaways, roundups, features." },
            ].map((item, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-xl p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <span className="font-bold text-gray-900">{item.label}</span>
                    <span className="text-gray-500 text-sm ml-1">{item.sublabel}</span>
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Performance Section */}
      <section className="px-4 py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto text-center">
          <span className="text-red-500 font-semibold text-sm tracking-wide">PERFORMANCE</span>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-2 mb-4">
            Real Results, Real Reach
          </h2>
          
          <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-1.5 mb-6 shadow-sm">
            <span className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-gray-600 text-sm font-medium">LAST 30 DAYS</span>
          </div>

          <p className="text-gray-600 max-w-2xl mx-auto mb-10">
            Windy City Raves is more than a social page — it is a discovery platform for Chicago EDM events. 
            Our strongest content consistently drives awareness, profile traffic, and direct audience action.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Eye, value: "304,247", label: "Monthly Views" },
              { icon: Users, value: "116,121", label: "Accounts Reached" },
              { icon: BarChart3, value: "24,870", label: "Interactions" },
              { icon: UserPlus, value: "4,504", label: "Profile Visits" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
                <stat.icon className="w-6 h-6 text-cyan-500 mx-auto mb-3" />
                <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </div>
                <div className="text-gray-500 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Links Section */}
      <section className="px-4 py-16 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            <Link 
              href="/events"
              className="group bg-gradient-to-br from-red-50 to-red-100/50 border border-red-100 rounded-2xl p-8 hover:shadow-lg transition-all"
            >
              <Calendar className="w-10 h-10 text-red-500 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Browse Events</h3>
              <p className="text-gray-600 mb-4">
                Find raves, concerts, and festivals happening in Chicago tonight and this weekend.
              </p>
              <span className="text-red-500 font-semibold flex items-center gap-2 group-hover:gap-3 transition-all">
                View Calendar <ArrowRight className="w-4 h-4" />
              </span>
            </Link>

            <Link 
              href="/apply"
              className="group bg-gradient-to-br from-cyan-50 to-cyan-100/50 border border-cyan-100 rounded-2xl p-8 hover:shadow-lg transition-all"
            >
              <Users className="w-10 h-10 text-cyan-500 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Join the Team</h3>
              <p className="text-gray-600 mb-4">
                Apply as a DJ, photographer, videographer, or performer to work WCR events.
              </p>
              <span className="text-cyan-500 font-semibold flex items-center gap-2 group-hover:gap-3 transition-all">
                Apply Now <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
