import { MetadataRoute } from 'next'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const EDMTRAIN_API_KEY = process.env.EDMTRAIN_API_KEY || process.env.NEXT_PUBLIC_EDMTRAIN_API_KEY

type BlogPost = {
  slug: string
  published_at: string
  category: string
}

type EDMTrainEvent = {
  id: number
  date: string
}

async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/wcr_blog_posts?status=eq.published&select=slug,published_at,category&order=published_at.desc`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        next: { revalidate: 3600 }
      }
    )
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

async function getUpcomingEvents(): Promise<EDMTrainEvent[]> {
  try {
    if (!EDMTRAIN_API_KEY) return []
    
    const today = new Date().toISOString().split('T')[0]
    const threeMonthsLater = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    
    const res = await fetch(
      `https://edmtrain.com/api/events?locationIds=100&startDate=${today}&endDate=${threeMonthsLater}&client=${EDMTRAIN_API_KEY}`,
      { next: { revalidate: 3600 } }
    )
    
    if (!res.ok) return []
    const data = await res.json()
    return data.data || []
  } catch {
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://windycityraves.com'
  
  const [posts, events] = await Promise.all([
    getBlogPosts(),
    getUpcomingEvents()
  ])

  // Static pages with high priority
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/events`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/promote`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/apply`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
  ]

  // Blog category pages
  const categories = ['event-preview', 'event-recap', 'artist-spotlight', 'venue-guide', 'scene-news']
  const categoryPages: MetadataRoute.Sitemap = categories.map(category => ({
    url: `${baseUrl}/blog?category=${category}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.7,
  }))

  // Individual event pages - HIGH priority for SEO
  const eventPages: MetadataRoute.Sitemap = events.map(event => ({
    url: `${baseUrl}/event/${event.id}`,
    lastModified: new Date(event.date),
    changeFrequency: 'daily' as const,
    priority: 0.85,
  }))

  // Blog post pages
  const blogPages: MetadataRoute.Sitemap = posts.map(post => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.published_at),
    changeFrequency: 'weekly',
    priority: 0.75,
  }))

  return [...staticPages, ...eventPages, ...categoryPages, ...blogPages]
}
