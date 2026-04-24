import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, User, ArrowRight, Tag } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Chicago EDM Blog | Windy City Raves - News, Events & Scene Updates',
  description: 'Stay updated with Chicago\'s electronic music scene. Event previews, artist spotlights, venue guides, and the latest EDM news from Windy City Raves.',
  keywords: ['Chicago EDM blog', 'Chicago rave news', 'Chicago DJ news', 'electronic music Chicago', 'Chicago nightlife blog', 'EDM events Chicago'],
  openGraph: {
    title: 'Chicago EDM Blog | Windy City Raves',
    description: 'Your source for Chicago electronic music news, event coverage, and scene updates.',
    type: 'website',
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
  related_artist: string | null
  related_venue: string | null
}

async function getBlogPosts(category?: string): Promise<BlogPost[]> {
  let url = `${SUPABASE_URL}/rest/v1/wcr_blog_posts?status=eq.published&order=published_at.desc&limit=20`
  if (category) {
    url += `&category=eq.${category}`
  }
  
  const res = await fetch(url, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
    next: { revalidate: 300 } // Cache for 5 minutes
  })
  
  if (!res.ok) return []
  return res.json()
}

const categoryLabels: Record<string, string> = {
  'event-preview': 'Event Preview',
  'event-recap': 'Event Recap',
  'artist-spotlight': 'Artist Spotlight',
  'venue-guide': 'Venue Guide',
  'scene-news': 'Scene News',
}

const categoryColors: Record<string, string> = {
  'event-preview': 'bg-cyan-100 text-cyan-700',
  'event-recap': 'bg-purple-100 text-purple-700',
  'artist-spotlight': 'bg-red-100 text-red-700',
  'venue-guide': 'bg-amber-100 text-amber-700',
  'scene-news': 'bg-emerald-100 text-emerald-700',
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category } = await searchParams
  const posts = await getBlogPosts(category)

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
            Chicago EDM <span className="text-red-500">Blog</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your source for Chicago electronic music news, event coverage, artist spotlights, and scene updates.
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="border-b border-gray-100 sticky top-16 bg-white z-40">
        <div className="max-w-6xl mx-auto px-4">
          <nav className="flex items-center gap-2 overflow-x-auto py-4 scrollbar-hide">
            <Link
              href="/blog"
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                !category ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Posts
            </Link>
            {Object.entries(categoryLabels).map(([key, label]) => (
              <Link
                key={key}
                href={`/blog?category=${key}`}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  category === key ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          {posts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">No posts yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <article key={post.id} className="group">
                  <Link href={`/blog/${post.slug}`}>
                    <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-gray-100 mb-4">
                      {post.featured_image ? (
                        <Image
                          src={post.featured_image}
                          alt={post.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-cyan-500 flex items-center justify-center">
                          <span className="text-white text-4xl font-black opacity-30">WCR</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryColors[post.category]}`}>
                          {categoryLabels[post.category]}
                        </span>
                      </div>
                      
                      <h2 className="text-xl font-bold text-gray-900 group-hover:text-red-500 transition-colors line-clamp-2">
                        {post.title}
                      </h2>
                      
                      <p className="text-gray-600 line-clamp-2">
                        {post.excerpt}
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500 pt-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(post.published_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* SEO Content Section */}
      <section className="bg-gray-50 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">About Chicago EDM Scene</h2>
          <div className="prose prose-gray max-w-none">
            <p>
              Chicago has been at the heart of electronic dance music since the birth of house music in the 1980s. 
              From legendary venues like The Warehouse to modern hotspots like Sound-Bar, Prysm, and Radius, 
              the city continues to be a global destination for EDM lovers.
            </p>
            <p>
              Our blog covers everything happening in Chicago&apos;s electronic music scene - from intimate underground 
              sets to massive festival announcements, artist interviews, venue guides, and the latest news 
              affecting ravers and music lovers across the Midwest.
            </p>
            <p>
              Whether you&apos;re looking for tonight&apos;s best shows, want to discover new artists performing in Chicago, 
              or need insider tips on the best venues for specific genres, Windy City Raves has you covered.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
