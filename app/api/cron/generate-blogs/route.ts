import Anthropic from '@anthropic-ai/sdk'
import { NextRequest } from 'next/server'

const anthropic = new Anthropic({
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
  rawContent?: string
}

// WCR System Prompt with web search instructions
const WCR_SYSTEM_PROMPT = `You are a writer for Windy City Raves, a Chicago underground EDM blog.

Before writing anything, search the web for current, accurate information about the topic. Run as many searches as you need to get real facts, real names, real dates, and real lineups. Never write from memory alone.

Then write the post using only what you found. If you couldn't find something, don't make it up.

Writing rules:
- Sound like a 28 year old Chicago raver texting their friends about it
- Short punchy paragraphs, 2-3 sentences max
- Opinionated. "This set will rip." "Don't sleep on this." That's the voice.
- No em dashes
- No AI filler words: "it's worth noting", "dive into", "delve", "seamlessly", "robust", "game-changer", "landscape"
- No bullet summaries or "In conclusion" endings
- No subheadings that sound like listicle titles
- Reference Chicago culture when relevant
- Start with a hook, not a summary
- Detect the format from the topic automatically: numbered list, checklist, guide, or standard post`

// Generate Unsplash fallback URL from title keywords
function getUnsplashFallback(title: string): string {
  const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'new', 'announces', 'releases', 'drops', 'reveals']
  const keywords = title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.includes(word))
    .slice(0, 3)
    .join(',')
  
  return `https://source.unsplash.com/1200x630/?EDM,festival,${keywords || 'concert,rave'}`
}

// Check if image URL is valid
async function isImageValid(url: string): Promise<boolean> {
  if (!url || url.length < 10) return false
  try {
    const response = await fetch(url, { 
      method: 'HEAD',
      signal: AbortSignal.timeout(5000)
    })
    const contentType = response.headers.get('content-type')
    return response.ok && (contentType?.startsWith('image/') || url.includes('unsplash'))
  } catch {
    return false
  }
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
    
    const itemMatches = xml.match(/<item>([\s\S]*?)<\/item>/g) || []
    
    for (const itemXml of itemMatches.slice(0, 5)) {
      const title = itemXml.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] || 
                    itemXml.match(/<title>(.*?)<\/title>/)?.[1] || ''
      const link = itemXml.match(/<link>(.*?)<\/link>/)?.[1] || ''
      const description = itemXml.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/)?.[1] ||
                          itemXml.match(/<description>(.*?)<\/description>/)?.[1] || ''
      const pubDate = itemXml.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || ''
      const contentEncoded = itemXml.match(/<content:encoded><!\[CDATA\[([\s\S]*?)\]\]><\/content:encoded>/)?.[1] || ''
      
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
          imageUrl,
          rawContent: contentEncoded || description
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

// Generate blog post using Claude with web search
async function generateBlogPost(newsItems: RSSItem[]): Promise<{
  title: string
  excerpt: string
  content: string
  metaTitle: string
  metaDescription: string
  keywords: string[]
  category: string
  tags: string[]
}> {
  const newsContext = newsItems.slice(0, 5).map(item => 
    `- ${item.title} (${item.source}): ${item.description.substring(0, 200)}...`
  ).join('\n')

  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 4000,
    system: WCR_SYSTEM_PROMPT,
    tools: [
      {
        type: 'web_search_20250305',
        name: 'web_search',
      }
    ],
    messages: [
      {
        role: 'user',
        content: `Here are today's top EDM news headlines:

${newsContext}

Pick the most interesting story and write an original blog post about it. Search the web first to get more details, full context, and any related info.

After searching, write the post and respond with ONLY valid JSON (no markdown):
{
  "title": "Catchy headline, 50-70 chars, no clickbait",
  "excerpt": "Hook for social sharing, 150-200 chars",
  "content": "Full HTML article with <p> tags for each paragraph, <strong> for emphasis, <em> for track titles, <blockquote> for standout quotes. 5-8 short paragraphs.",
  "metaTitle": "SEO title with artist + Chicago EDM, 50-60 chars",
  "metaDescription": "SEO description, 150-160 chars",
  "keywords": ["array", "of", "8-10", "seo", "keywords"],
  "category": "scene-news or artist-spotlight or festival-news or industry-news",
  "tags": ["relevant", "tags", "genres"]
}

Remember: WCR voice. Short paragraphs. No em dashes. No AI filler. Opinionated.`
      }
    ]
  })

  // Extract text from response (handling potential tool use)
  let textContent = ''
  for (const block of response.content) {
    if (block.type === 'text') {
      textContent = block.text
      break
    }
  }

  // If no direct text, there might be tool results - get the final text
  if (!textContent) {
    // Claude may have done web searches, find the final text response
    for (const block of response.content) {
      if (block.type === 'text') {
        textContent = block.text
      }
    }
  }

  try {
    const cleanedText = textContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(cleanedText)
    
    return {
      title: parsed.title,
      excerpt: parsed.excerpt,
      content: parsed.content,
      metaTitle: parsed.metaTitle,
      metaDescription: parsed.metaDescription,
      keywords: parsed.keywords || [],
      category: parsed.category || 'scene-news',
      tags: parsed.tags || []
    }
  } catch (error) {
    console.error('Failed to parse AI response:', textContent)
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
  imageUrl: string
  imageCredit: string
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
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
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

    const newsItems = await fetchAllNews()
    
    if (newsItems.length === 0) {
      return Response.json({ 
        success: false, 
        message: 'No news items found from RSS feeds' 
      })
    }

    const blogPost = await generateBlogPost(newsItems)
    const slug = generateSlug(blogPost.title)

    // Get image - try RSS images first, fallback to Unsplash
    let imageUrl = getUnsplashFallback(blogPost.title)
    let imageCredit = 'Unsplash'
    
    for (const item of newsItems) {
      if (item.imageUrl && item.imageUrl.startsWith('http')) {
        const valid = await isImageValid(item.imageUrl)
        if (valid) {
          imageUrl = item.imageUrl
          imageCredit = item.source
          break
        }
      }
    }

    await saveBlogPost({ slug, imageUrl, imageCredit, ...blogPost })

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
      post: { slug, title: blogPost.title, category: blogPost.category, url: `/blog/${slug}` },
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

// POST handler for manual testing
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
    const newsItems = await fetchAllNews()
    
    if (newsItems.length === 0) {
      return Response.json({ 
        success: false, 
        message: 'No news items found from RSS feeds',
        feeds_checked: RSS_FEEDS.map(f => f.source)
      })
    }

    const blogPost = await generateBlogPost(newsItems)
    const slug = generateSlug(blogPost.title)

    // Get image
    let imageUrl = getUnsplashFallback(blogPost.title)
    let imageCredit = 'Unsplash'
    
    for (const item of newsItems) {
      if (item.imageUrl && item.imageUrl.startsWith('http')) {
        const valid = await isImageValid(item.imageUrl)
        if (valid) {
          imageUrl = item.imageUrl
          imageCredit = item.source
          break
        }
      }
    }

    await saveBlogPost({ slug, imageUrl, imageCredit, ...blogPost })

    return Response.json({
      success: true,
      post: {
        slug,
        title: blogPost.title,
        excerpt: blogPost.excerpt,
        category: blogPost.category,
        tags: blogPost.tags,
        imageUrl,
        imageCredit,
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
