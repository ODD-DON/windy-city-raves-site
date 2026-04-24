import { generateText } from 'ai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { NextRequest } from 'next/server'

// Create Anthropic client with your API key
const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

// RSS feeds from major EDM news sources
const RSS_FEEDS = [
  { url: 'https://dancingastronaut.com/feed/', source: 'Dancing Astronaut' },
  { url: 'https://mixmag.net/feed', source: 'Mixmag' },
  { url: 'https://www.billboard.com/c/music/music-news/dance/feed/', source: 'Billboard Dance' },
  { url: 'https://edm.com/feed', source: 'EDM.com' },
  { url: 'https://djmag.com/feed', source: 'DJ Mag' },
]

interface RSSItem {
  title: string
  link: string
  description: string
  pubDate: string
  source: string
  imageUrl?: string
}

// Parse RSS feed and extract items
async function fetchRSSFeed(feedUrl: string, source: string): Promise<RSSItem[]> {
  try {
    const response = await fetch(feedUrl, {
      headers: { 'User-Agent': 'WindyCityRaves/1.0' },
      next: { revalidate: 3600 }
    })
    
    if (!response.ok) return []
    
    const xml = await response.text()
    const items: RSSItem[] = []
    
    // Simple XML parsing for RSS items
    const itemMatches = xml.match(/<item>([\s\S]*?)<\/item>/g) || []
    
    for (const itemXml of itemMatches.slice(0, 5)) {
      const title = itemXml.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] || 
                    itemXml.match(/<title>(.*?)<\/title>/)?.[1] || ''
      const link = itemXml.match(/<link>(.*?)<\/link>/)?.[1] || ''
      const description = itemXml.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/)?.[1] ||
                          itemXml.match(/<description>(.*?)<\/description>/)?.[1] || ''
      const pubDate = itemXml.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || ''
      
      // Try to extract image from media:content or enclosure
      const imageUrl = itemXml.match(/<media:content[^>]*url="([^"]+)"/)?.[1] ||
                       itemXml.match(/<enclosure[^>]*url="([^"]+)"/)?.[1] ||
                       itemXml.match(/<media:thumbnail[^>]*url="([^"]+)"/)?.[1] || undefined
      
      if (title && link) {
        items.push({
          title: title.replace(/<[^>]*>/g, '').trim(),
          link,
          description: description.replace(/<[^>]*>/g, '').substring(0, 500),
          pubDate,
          source,
          imageUrl
        })
      }
    }
    
    return items
  } catch (error) {
    console.error(`Failed to fetch RSS from ${source}:`, error)
    return []
  }
}

// Fetch all RSS feeds
async function fetchAllNews(): Promise<RSSItem[]> {
  const allItems: RSSItem[] = []
  
  await Promise.all(
    RSS_FEEDS.map(async (feed) => {
      const items = await fetchRSSFeed(feed.url, feed.source)
      allItems.push(...items)
    })
  )
  
  // Sort by date (newest first) and return top items
  return allItems
    .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
    .slice(0, 15)
}

// Generate a unique slug
function generateSlug(title: string): string {
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 60)
  
  const timestamp = Date.now().toString(36)
  return `${baseSlug}-${timestamp}`
}

// Generate blog post using Claude Haiku via Vercel AI Gateway
async function generateBlogPost(newsItems: RSSItem[]): Promise<{
  title: string
  excerpt: string
  content: string
  metaTitle: string
  metaDescription: string
  keywords: string[]
  category: string
  tags: string[]
  imageUrl?: string
  imageCredit?: string
}> {
  const newsContext = newsItems.map(item => 
    `SOURCE: ${item.source}\nTITLE: ${item.title}\nSUMMARY: ${item.description}\nDATE: ${item.pubDate}\n`
  ).join('\n---\n')

  const { text } = await generateText({
    model: anthropic('claude-3-haiku-20240307'),
    prompt: `You are a music journalist writing for Windy City Raves, Chicago's premier electronic music community platform.

Based on the following REAL, CURRENT EDM news items, write an original, engaging blog post that covers the most interesting story or combines related stories into a compelling narrative.

CURRENT EDM NEWS (from today's feeds):
${newsContext}

Write the blog post in the following JSON format (respond ONLY with valid JSON, no markdown code blocks):
{
  "title": "Catchy, SEO-optimized headline that accurately reflects the news (50-70 chars)",
  "excerpt": "Engaging summary for social sharing (150-200 chars)",
  "content": "Full article in HTML format with <p>, <h2>, <h3>, <strong>, <em> tags. Include 4-6 paragraphs. Reference Chicago's scene where relevant - how this news affects Chicago ravers, upcoming Chicago shows by these artists, etc.",
  "metaTitle": "SEO title including artist/event name + 'Chicago EDM' (50-60 chars)",
  "metaDescription": "SEO description with key details (150-160 chars)",
  "keywords": ["array", "of", "8-10", "seo", "keywords", "artist-names", "chicago", "edm", "genre"],
  "category": "one of: scene-news, artist-spotlight, festival-news, industry-news",
  "tags": ["relevant", "tags", "artist-names", "genres", "labels"]
}

IMPORTANT: 
- Write about REAL news from the feed above - do not make up events or announcements
- Include actual artist names, venues, dates mentioned in the news
- Connect it to Chicago's scene when possible
- Focus on SEO: include artist names, song titles, label names in keywords`,
    maxOutputTokens: 2000,
  })

  try {
    // Clean the response - remove any markdown code blocks if present
    const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(cleanedText)
    
    // Find an image from the news items
    const itemWithImage = newsItems.find(item => item.imageUrl)
    
    return {
      title: parsed.title,
      excerpt: parsed.excerpt,
      content: parsed.content,
      metaTitle: parsed.metaTitle,
      metaDescription: parsed.metaDescription,
      keywords: parsed.keywords || [],
      category: parsed.category || 'scene-news',
      tags: parsed.tags || [],
      imageUrl: itemWithImage?.imageUrl,
      imageCredit: itemWithImage?.source
    }
  } catch (error) {
    console.error('Failed to parse AI response:', text)
    throw new Error('Failed to generate blog post - invalid JSON response')
  }
}

// Save blog post to Supabase
async function saveBlogPost(post: {
  slug: string
  title: string
  excerpt: string
  content: string
  metaTitle: string
  metaDescription: string
  keywords: string[]
  category: string
  tags: string[]
  imageUrl?: string
  imageCredit?: string
}) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/wcr_blog_posts`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      meta_title: post.metaTitle,
      meta_description: post.metaDescription,
      keywords: post.keywords,
      category: post.category,
      tags: post.tags,
      image_url: post.imageUrl,
      image_credit: post.imageCredit,
      status: 'published',
      published_at: new Date().toISOString(),
      ai_generated: true
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to save blog post: ${error}`)
  }

  return response.json()
}

// GET handler for Vercel Cron
export async function GET(req: NextRequest) {
  // Verify cron secret for production
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Check posts generated today
    const today = new Date().toISOString().split('T')[0]
    const logRes = await fetch(
      `${SUPABASE_URL}/rest/v1/wcr_blog_generation_log?date=eq.${today}`,
      {
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        },
      }
    )
    
    const logs = await logRes.json()
    const postsToday = logs[0]?.posts_generated || 0
    
    if (postsToday >= 3) {
      return Response.json({ 
        message: 'Already generated 3 posts today',
        posts_generated: postsToday 
      })
    }

    // Fetch latest news from RSS feeds
    const newsItems = await fetchAllNews()
    
    if (newsItems.length === 0) {
      return Response.json({ 
        success: false, 
        message: 'No news items found from RSS feeds' 
      })
    }

    // Generate blog post from real news
    const blogPost = await generateBlogPost(newsItems)
    const slug = generateSlug(blogPost.title)

    // Save to database
    await saveBlogPost({ slug, ...blogPost })

    // Update generation log
    await fetch(`${SUPABASE_URL}/rest/v1/wcr_blog_generation_log`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates',
      },
      body: JSON.stringify({
        date: today,
        posts_generated: postsToday + 1,
        topics_used: logs[0]?.topics_used 
          ? [...logs[0].topics_used, blogPost.category]
          : [blogPost.category],
      }),
    })

    return Response.json({
      success: true,
      post: {
        slug,
        title: blogPost.title,
        category: blogPost.category,
        url: `/blog/${slug}`
      },
      posts_today: postsToday + 1,
      news_sources_used: [...new Set(newsItems.map(n => n.source))]
    })

  } catch (error) {
    console.error('Cron blog generation error:', error)
    return Response.json({ 
      error: 'Generation failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}

// POST handler for manual testing (no auth required with ?test=true)
export async function POST(req: NextRequest) {
  const url = new URL(req.url)
  const isTest = url.searchParams.get('test') === 'true'
  
  if (!isTest) {
    const authHeader = req.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  try {
    // Fetch latest news from RSS feeds
    const newsItems = await fetchAllNews()
    
    if (newsItems.length === 0) {
      return Response.json({ 
        success: false, 
        message: 'No news items found from RSS feeds',
        feeds_checked: RSS_FEEDS.map(f => f.source)
      })
    }

    // Generate blog post from real news
    const blogPost = await generateBlogPost(newsItems)
    const slug = generateSlug(blogPost.title)

    // Save to database
    await saveBlogPost({ slug, ...blogPost })

    return Response.json({
      success: true,
      post: {
        slug,
        title: blogPost.title,
        excerpt: blogPost.excerpt,
        category: blogPost.category,
        tags: blogPost.tags,
        url: `/blog/${slug}`
      },
      news_sources_used: [...new Set(newsItems.map(n => n.source))],
      news_items_analyzed: newsItems.length
    })
  } catch (error) {
    console.error('Blog generation failed:', error)
    return Response.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
