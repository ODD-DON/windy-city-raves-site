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
  rawContent?: string // Store raw content for embed detection
}

// Check if image URL is valid
async function isImageValid(url: string): Promise<boolean> {
  if (!url || url.length < 10) return false
  try {
    const response = await fetch(url, { 
      method: 'HEAD',
      signal: AbortSignal.timeout(5000) // 5 second timeout
    })
    const contentType = response.headers.get('content-type')
    return response.ok && (contentType?.startsWith('image/') || url.includes('unsplash'))
  } catch {
    return false
  }
}

// Generate Unsplash fallback URL from title keywords
function getUnsplashFallback(title: string): string {
  // Extract meaningful keywords from title
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

// Detect embeds from article content/link
interface Embeds {
  twitter?: string[]
  soundcloud?: string[]
  spotify?: string[]
  mainArtist?: string
}

function detectEmbeds(content: string, title: string): Embeds {
  const embeds: Embeds = {}
  
  // Twitter/X links
  const twitterRegex = /https?:\/\/(twitter\.com|x\.com)\/\w+\/status\/(\d+)/gi
  const twitterMatches = content.match(twitterRegex)
  if (twitterMatches) {
    embeds.twitter = twitterMatches.slice(0, 2) // Max 2 tweets
  }
  
  // SoundCloud links
  const soundcloudRegex = /https?:\/\/(www\.)?soundcloud\.com\/[\w-]+\/[\w-]+/gi
  const soundcloudMatches = content.match(soundcloudRegex)
  if (soundcloudMatches) {
    embeds.soundcloud = soundcloudMatches.slice(0, 1) // Max 1
  }
  
  // Spotify links
  const spotifyRegex = /https?:\/\/open\.spotify\.com\/(track|album|playlist)\/[\w]+/gi
  const spotifyMatches = content.match(spotifyRegex)
  if (spotifyMatches) {
    embeds.spotify = spotifyMatches.slice(0, 1)
  }
  
  // Extract main artist name from title for Spotify search fallback
  // Common patterns: "Artist Name Releases...", "Artist Name Announces...", "Artist Name's New..."
  const artistMatch = title.match(/^([A-Z][a-zA-Z\s&]+?)(?:\s+(?:Releases|Announces|Drops|Reveals|Shares|Debuts|Premieres|Unveils|Returns|Teams|Joins|Delivers|'s))/i)
  if (artistMatch) {
    embeds.mainArtist = artistMatch[1].trim()
  }
  
  return embeds
}

// Generate embed HTML
function generateEmbedHTML(embeds: Embeds): string {
  let html = ''
  
  // Twitter embeds
  if (embeds.twitter && embeds.twitter.length > 0) {
    html += '\n<div class="embed-container twitter-embed">'
    for (const tweetUrl of embeds.twitter) {
      html += `
<blockquote class="twitter-tweet">
  <a href="${tweetUrl}"></a>
</blockquote>`
    }
    html += '\n<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>'
    html += '\n</div>'
  }
  
  // SoundCloud embeds
  if (embeds.soundcloud && embeds.soundcloud.length > 0) {
    for (const scUrl of embeds.soundcloud) {
      html += `
<div class="embed-container soundcloud-embed">
  <iframe width="100%" height="166" scrolling="no" frameborder="no" allow="autoplay" 
    src="https://w.soundcloud.com/player/?url=${encodeURIComponent(scUrl)}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true">
  </iframe>
</div>`
    }
  }
  
  // Spotify embeds
  if (embeds.spotify && embeds.spotify.length > 0) {
    for (const spotifyUrl of embeds.spotify) {
      // Convert open.spotify.com URL to embed URL
      const embedUrl = spotifyUrl.replace('open.spotify.com/', 'open.spotify.com/embed/')
      html += `
<div class="embed-container spotify-embed">
  <iframe style="border-radius:12px" src="${embedUrl}" width="100%" height="152" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
</div>`
    }
  } else if (embeds.mainArtist && !embeds.soundcloud?.length) {
    // Fallback: Spotify search for the main artist
    const searchQuery = encodeURIComponent(embeds.mainArtist)
    html += `
<div class="embed-container spotify-search">
  <p class="text-sm text-gray-500 mb-2">Listen to ${embeds.mainArtist} on Spotify:</p>
  <iframe style="border-radius:12px" src="https://open.spotify.com/embed/search/${searchQuery}" width="100%" height="152" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
</div>`
  }
  
  return html
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
      const contentEncoded = itemXml.match(/<content:encoded><!\[CDATA\[([\s\S]*?)\]\]><\/content:encoded>/)?.[1] || ''
      
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

// WCR Chicago raver writing voice system prompt
const WCR_SYSTEM_PROMPT = `You are a writer for Windy City Raves, a Chicago underground EDM blog. Write like a real scene insider.

VOICE & STYLE:
- Sound like a 28 year old Chicago raver texting their friends about a show
- Short punchy paragraphs, 2-3 sentences max
- Conversational, opinionated, specific
- Opinions are encouraged: "This set ripped." "Skip the opener." "Absolute heater."
- Reference Chicago culture when relevant (venues like Radius, Sound-Bar, Prysm, Concord; neighborhoods; the scene)
- Start with a hook, not a summary
- No "In conclusion" or summary endings

FORBIDDEN:
- Never use em dashes (—)
- No AI filler phrases: "it's worth noting", "dive into", "delve", "seamlessly", "robust", "game-changer", "in the realm of", "landscape", "elevate", "curated", "arguably"
- No bullet point summaries
- No formal journalist voice
- No hedging or excessive qualifiers

GOOD EXAMPLES:
- "Aight so Fred again.. just dropped something wild."
- "If you weren't at Radius last weekend you missed out. Big time."
- "This track goes stupid hard. Had it on repeat since 6am."
- "Chicago heads already know, but for everyone else catching up..."

BAD EXAMPLES (never write like this):
- "It's worth noting that the artist has seamlessly blended..."
- "In the ever-evolving landscape of electronic music..."
- "This robust release delves into..."`

// Generate blog post using Claude Haiku
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
  embeds: Embeds
}> {
  const newsContext = newsItems.map(item => 
    `SOURCE: ${item.source}\nTITLE: ${item.title}\nSUMMARY: ${item.description}\nLINK: ${item.link}\nDATE: ${item.pubDate}\n`
  ).join('\n---\n')

  const { text } = await generateText({
    model: anthropic('claude-haiku-4-5-20251001'),
    system: WCR_SYSTEM_PROMPT,
    prompt: `Based on the following REAL, CURRENT EDM news, write an original blog post for Windy City Raves.

Pick the most interesting story and write about it. Make it feel like you're putting your Chicago homies onto something.

CURRENT EDM NEWS:
${newsContext}

Respond ONLY with valid JSON (no markdown code blocks):
{
  "title": "Catchy headline, no clickbait, 50-70 chars",
  "excerpt": "Hook for social sharing, 150-200 chars, make people want to click",
  "content": "Full article in rich HTML. Use these tags:
    - <p> for paragraphs (2-3 sentences each, with spacing)
    - <h2> for section breaks (use 1-2 in longer posts)
    - <strong> or <b> to emphasize key names, venues, dates
    - <em> or <i> for track titles or album names
    - <blockquote> for pull quotes or standout lines
    Write 5-8 short paragraphs total. Connect to Chicago scene when relevant. Sound like WCR voice.",
  "metaTitle": "SEO title with artist name + Chicago EDM, 50-60 chars",
  "metaDescription": "SEO description, 150-160 chars",
  "keywords": ["8-10", "seo", "keywords", "artist-names", "chicago-edm"],
  "category": "scene-news or artist-spotlight or festival-news or industry-news",
  "tags": ["relevant", "tags", "genres", "artist-names"]
}

FORMATTING RULES:
- Every paragraph needs its own <p> tag
- Bold artist names, venue names, and dates with <strong>
- Italicize track/album titles with <em>
- Add a <h2> to break up longer posts
- Use <blockquote> for memorable quotes or standout lines

Remember: Write about REAL news from above. Short paragraphs. Chicago voice. No em dashes. No AI filler.`,
    maxOutputTokens: 2000,
  })

  try {
    // Clean the response
    const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(cleanedText)
    
    // Find embeds from source articles
    const mainNewsItem = newsItems[0]
    const embeds = detectEmbeds(mainNewsItem.rawContent || mainNewsItem.description, mainNewsItem.title)
    
    // Find a valid image or use Unsplash fallback
    let finalImageUrl: string
    let imageCredit: string
    let foundValidImage = false
    
    // Try to find a valid image from news items
    for (const item of newsItems) {
      if (item.imageUrl && item.imageUrl.startsWith('http')) {
        const isValid = await isImageValid(item.imageUrl)
        if (isValid) {
          finalImageUrl = item.imageUrl
          imageCredit = item.source
          foundValidImage = true
          break
        }
      }
    }
    
    // Always fallback to Unsplash if no valid image found
    if (!foundValidImage) {
      finalImageUrl = getUnsplashFallback(parsed.title)
      imageCredit = 'Unsplash'
    }
    
    // Append embeds to content
    let finalContent = parsed.content
    const embedHTML = generateEmbedHTML(embeds)
    if (embedHTML) {
      finalContent += '\n' + embedHTML
    }
    
    return {
      title: parsed.title,
      excerpt: parsed.excerpt,
      content: finalContent,
      metaTitle: parsed.metaTitle,
      metaDescription: parsed.metaDescription,
      keywords: parsed.keywords || [],
      category: parsed.category || 'scene-news',
      tags: parsed.tags || [],
      imageUrl: finalImageUrl,
      imageCredit,
      embeds
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
        imageUrl: blogPost.imageUrl,
        imageCredit: blogPost.imageCredit,
        hasEmbeds: !!(blogPost.embeds.twitter?.length || blogPost.embeds.soundcloud?.length || blogPost.embeds.spotify?.length),
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
