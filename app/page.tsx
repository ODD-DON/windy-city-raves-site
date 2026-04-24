import { Metadata } from 'next'
import Link from "next/link"
import Image from "next/image"
import { Calendar, ArrowRight, MapPin, Clock, Sparkles } from "lucide-react"
import { Footer } from "@/components/footer"

export const metadata: Metadata = {
  title: 'Windy City Raves | Chicago EDM Events, Raves & Electronic Music Calendar',
  description: 'Discover Chicago EDM events, raves, and electronic music shows. Your complete guide to house music, techno, bass, and more in Chicago. Find events tonight and this weekend.',
  keywords: [
    'Chicago EDM', 'Chicago raves', 'Chicago electronic music', 'Chicago house music',
    'Chicago techno', 'Chicago bass music', 'Chicago nightlife', 'Chicago DJ events',
    'Chicago music events', 'Chicago concerts', 'EDM events near me', 'raves near me',
    'Chicago club events', 'Sound-Bar Chicago', 'Prysm Chicago', 'Radius Chicago',
    'Chicago dance music', 'Chicago rave scene', 'Chicago underground music'
  ],
  openGraph: {
    title: 'Windy City Raves | Chicago EDM Events & Electronic Music',
    description: 'Your complete guide to Chicago electronic music events, raves, and nightlife.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Windy City Raves',
  },
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

type BlogPost = {
  id: string
  slug: string
  title: string
  excerpt: string
  category: string
  featured_image: string | null
  published_at: string
}

type Event = {
  id: string
  name: string
  date: string
  venue: { name: string } | null
  artistList: string[]
  link: string
}

async function getLatestPosts(): Promise<BlogPost[]> {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/wcr_blog_posts?status=eq.published&order=published_at.desc&limit=6`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        next: { revalidate: 300 }
      }
    )
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

async function getUpcomingEvents(): Promise<Event[]> {
  try {
    const today = new Date().toISOString().split('T')[0]
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const res = await fetch(
      `https://edmtrain.com/api/events?latitude=41.8781&longitude=-87.6298&client=a5a318c7-a940-4a53-90d3-a260502c87cd&startDate=${today}&endDate=${nextWeek}`,
      { next: { revalidate: 1800 } }
    )
    if (!res.ok) return []
    const data = await res.json()
    return data.data?.slice(0, 8) || []
  } catch {
    return []
  }
}

const categoryLabels: Record<string, string> = {
  'event-preview': 'Preview',
  'event-recap': 'Recap',
  'artist-spotlight': 'Artist',
  'venue-guide': 'Venue',
  'scene-news': 'News',
}

const categoryColors: Record<string, string> = {
  'event-preview': 'bg-cyan-500',
  'event-recap': 'bg-purple-500',
  'artist-spotlight': 'bg-red-500',
  'venue-guide': 'bg-amber-500',
  'scene-news': 'bg-emerald-500',
}

export default async function HomePage() {
  const [posts, events] = await Promise.all([
    getLatestPosts(),
    getUpcomingEvents()
  ])

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Windy City Raves',
    url: 'https://windycityraves.com',
    description: 'Chicago EDM events, raves, and electronic music calendar',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://windycityraves.com/events?q={search_term_string}',
      'query-input': 'required name=search_term_string'
    }
  }

  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Windy City Raves',
    url: 'https://windycityraves.com',
    logo: 'https://windycityraves.com/logo.png',
    sameAs: [
      'https://instagram.com/windycityraves',
      'https://twitter.com/windycityraves'
    ],
    areaServed: {
      '@type': 'City',
      name: 'Chicago'
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />

      <main className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-b from-gray-50 to-white py-12 md:py-20 px-4">
          <div className="max-w-6xl mx-auto text-center">
            {/* Logo */}
            <div className="mb-6">
              <div className="relative w-[180px] md:w-[240px] h-[70px] md:h-[95px] mx-auto">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/New%20Logo-tGlIj5rYBWQGemKw5Ce0TbbPJg5oJJ.png"
                  alt="Windy City Raves"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
            
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-4 leading-tight">
              Discover <span className="text-red-500">Chicago</span> EDM
            </h1>
            
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Find raves, electronic music shows, and nightlife events happening in Chicago tonight and this weekend.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/events"
                className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-full font-semibold transition-colors"
              >
                <Calendar className="w-5 h-5" />
                Browse Events
              </Link>
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 px-6 py-3 rounded-full font-semibold transition-colors"
              >
                Scene Updates
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Upcoming Events */}
        <section className="py-12 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-gray-900">This Week in Chicago</h2>
                <p className="text-gray-500 mt-1">Upcoming EDM events and shows</p>
              </div>
              <Link
                href="/events"
                className="hidden sm:inline-flex items-center gap-1 text-red-500 hover:text-red-600 font-semibold text-sm"
              >
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {events.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {events.map((event, idx) => (
                  <a
                    key={`${event.id}-${idx}`}
                    href={event.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group bg-gray-50 hover:bg-gray-100 rounded-xl p-4 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="bg-white rounded-lg p-2 text-center min-w-[48px] shadow-sm">
                        <div className="text-[10px] font-semibold text-red-500 uppercase">
                          {new Date(event.date).toLocaleDateString('en-US', { weekday: 'short' })}
                        </div>
                        <div className="text-lg font-bold text-gray-900">
                          {new Date(event.date).getDate()}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 group-hover:text-red-500 transition-colors line-clamp-2 text-sm">
                          {event.artistList?.[0] || event.name}
                        </h3>
                        {event.venue?.name && (
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{event.venue.name}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-gray-50 rounded-xl">
                <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Loading events...</p>
              </div>
            )}

            <div className="mt-4 sm:hidden text-center">
              <Link href="/events" className="text-red-500 font-semibold text-sm">
                View All Events <ArrowRight className="w-4 h-4 inline" />
              </Link>
            </div>
          </div>
        </section>

        {/* Blog Posts */}
        <section className="py-12 px-4 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-gray-900">Scene Updates</h2>
                <p className="text-gray-500 mt-1">News, previews, and artist spotlights</p>
              </div>
              <Link
                href="/blog"
                className="hidden sm:inline-flex items-center gap-1 text-red-500 hover:text-red-600 font-semibold text-sm"
              >
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {posts.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {posts.map((post) => (
                  <Link key={post.id} href={`/blog/${post.slug}`} className="group">
                    <article className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow h-full">
                      <div className="relative aspect-[16/9]">
                        {post.featured_image ? (
                          <Image
                            src={post.featured_image}
                            alt={post.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-cyan-500" />
                        )}
                        <div className={`absolute top-3 left-3 px-2 py-0.5 rounded text-xs font-medium text-white ${categoryColors[post.category] || 'bg-gray-500'}`}>
                          {categoryLabels[post.category] || post.category}
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-gray-900 group-hover:text-red-500 transition-colors line-clamp-2 mb-2">
                          {post.title}
                        </h3>
                        <p className="text-sm text-gray-500 line-clamp-2">{post.excerpt}</p>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-white rounded-xl">
                <Sparkles className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Blog posts coming soon...</p>
                <Link href="/events" className="text-red-500 font-medium mt-2 inline-block text-sm">
                  Browse events instead
                </Link>
              </div>
            )}

            <div className="mt-4 sm:hidden text-center">
              <Link href="/blog" className="text-red-500 font-semibold text-sm">
                View All Posts <ArrowRight className="w-4 h-4 inline" />
              </Link>
            </div>
          </div>
        </section>

        {/* Quick Links */}
        <section className="py-12 px-4 bg-white">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">Explore</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <Link href="/events" className="bg-gray-50 hover:bg-red-50 p-5 rounded-xl text-center transition-colors group">
                <Clock className="w-7 h-7 text-red-500 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 group-hover:text-red-500 text-sm">Tonight</h3>
                <p className="text-xs text-gray-500 mt-1">Events now</p>
              </Link>
              <Link href="/events" className="bg-gray-50 hover:bg-red-50 p-5 rounded-xl text-center transition-colors group">
                <Calendar className="w-7 h-7 text-cyan-500 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 group-hover:text-red-500 text-sm">This Weekend</h3>
                <p className="text-xs text-gray-500 mt-1">Fri - Sun</p>
              </Link>
              <Link href="/blog?category=venue-guide" className="bg-gray-50 hover:bg-red-50 p-5 rounded-xl text-center transition-colors group">
                <MapPin className="w-7 h-7 text-amber-500 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 group-hover:text-red-500 text-sm">Venues</h3>
                <p className="text-xs text-gray-500 mt-1">Club guides</p>
              </Link>
              <Link href="/blog?category=artist-spotlight" className="bg-gray-50 hover:bg-red-50 p-5 rounded-xl text-center transition-colors group">
                <Sparkles className="w-7 h-7 text-purple-500 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 group-hover:text-red-500 text-sm">Artists</h3>
                <p className="text-xs text-gray-500 mt-1">DJ spotlights</p>
              </Link>
            </div>
          </div>
        </section>

        {/* SEO Content */}
        <section className="py-12 px-4 bg-gray-50">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Chicago Electronic Music Scene</h2>
            <div className="prose prose-gray prose-sm max-w-none">
              <p>
                Chicago is the birthplace of house music and remains one of the world&apos;s most vibrant cities for electronic dance music. 
                From intimate underground sets at Smartbar to massive productions at Radius Chicago, the city offers something for every EDM fan.
              </p>
              <p>
                Our event calendar covers all genres including house, techno, bass music, dubstep, drum and bass, trance, and more. 
                Whether you&apos;re looking for a rave tonight, planning your weekend, or discovering new artists coming to Chicago, 
                Windy City Raves is your complete guide to the scene.
              </p>
              <p>
                Popular venues include Sound-Bar in River North, Prysm in Fulton Market, Concord Music Hall in Logan Square, 
                and Aragon Ballroom in Uptown. Each weekend brings world-class DJs and local talent to stages across the city.
              </p>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  )
}
