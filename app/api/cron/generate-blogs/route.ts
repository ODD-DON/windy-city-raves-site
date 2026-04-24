import Anthropic from '@anthropic-ai/sdk'
import { NextRequest } from 'next/server'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

// The Festive Owl Nitter RSS feed - try multiple instances
const NITTER_INSTANCES = [
  'https://nitter.poast.org',
  'https://nitter.privacydev.net',
  'https://nitter.1d4.us',
  'https://nitter.kavin.rocks'
]

interface Tweet {
  id: string
  text: string
  link: string
  pubDate: string
  imageUrl?: string
}

// WCR System Prompt
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
- Detect the format from the topic automatically: numbered list, checklist, guide, or standard post

FORMAT YOUR RESPONSE AS CLEAN HTML:
- Wrap EVERY paragraph in <p> tags. No exceptions. No plain text.
- Subheadings go in <h2> tags
- Use <strong> for artist names, venue names, dates
- Use <em> for track/album titles
- Use <blockquote> for standout quotes or pro tips
- NO MARKDOWN. No **bold** or *italic*. Only HTML tags.`

// Generate Unsplash fallback URL from title keywords
function getUnsplashFallback(title: string): string {
  const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'new', 'announces', 'releases', 'drops', 'reveals', 'just', 'has', 'have', 'been', 'will', 'be']
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
    return response.ok && (contentType?.startsWith('image/') || url.includes('unsplash') || url.includes('nitter'))
  } catch {
    return false
  }
}

// Fetch tweets from The Festive Owl via Nitter RSS
async function fetchFestiveOwlTweets(): Promise<Tweet[]> {
  let xml = ''
  let successInstance = ''
  
  // Try each Nitter instance until one works
  for (const instance of NITTER_INSTANCES) {
    const rssUrl = `${instance}/TheFestiveOwl/rss`
    console.log(`[v0] Trying Nitter instance: ${rssUrl}`)
    
    try {
      const response = await fetch(rssUrl, {
        headers: { 
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/rss+xml, application/xml, text/xml, */*'
        },
        signal: AbortSignal.timeout(10000) // 10 second timeout
      })
      
      if (response.ok) {
        xml = await response.text()
        if (xml.includes('<item>')) {
          successInstance = instance
          console.log(`[v0] Success with ${instance}, found RSS items`)
          break
        } else {
          console.log(`[v0] ${instance} returned OK but no items in XML`)
        }
      } else {
        console.log(`[v0] ${instance} returned status ${response.status}`)
      }
    } catch (err) {
      console.log(`[v0] ${instance} failed:`, err instanceof Error ? err.message : 'unknown error')
    }
  }
  
  if (!xml || !xml.includes('<item>')) {
    console.error('[v0] All Nitter instances failed or returned no items')
    return []
  }
  
  console.log(`[v0] Parsing RSS from ${successInstance}`)
    const tweets: Tweet[] = []
    
    // Parse RSS items
    const itemMatches = xml.match(/<item>([\s\S]*?)<\/item>/g) || []
    
    for (const itemXml of itemMatches.slice(0, 10)) {
      // Extract tweet ID from link
      const link = itemXml.match(/<link>(.*?)<\/link>/)?.[1] || ''
      const idMatch = link.match(/status\/(\d+)/)
      const id = idMatch ? idMatch[1] : ''
      
      // Get tweet text from title or description
      const title = itemXml.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] || 
                    itemXml.match(/<title>(.*?)<\/title>/)?.[1] || ''
      const description = itemXml.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/)?.[1] ||
                          itemXml.match(/<description>([\s\S]*?)<\/description>/)?.[1] || ''
      
      const pubDate = itemXml.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || ''
      
      // Extract image from enclosure or media tags
      const imageUrl = itemXml.match(/<enclosure[^>]*url="([^"]+)"/)?.[1] ||
                       itemXml.match(/<media:content[^>]*url="([^"]+)"/)?.[1] ||
                       // Also check for images in description HTML
                       description.match(/src="([^"]+\.(jpg|png|gif|webp))"/i)?.[1] ||
                       undefined
      
      // Clean text - remove HTML, decode entities
      const text = (description || title)
        .replace(/<[^>]*>/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s+/g, ' ')
        .trim()
      
      if (id && text.length > 20) {
        tweets.push({ id, text, link, pubDate, imageUrl })
      }
    }
    
    return tweets
  } catch (error) {
    console.error('Failed to fetch Festive Owl tweets:', error)
    return []
  }
}

// Check if tweet has already been processed
async function isTweetProcessed(tweetId: string): Promise<boolean> {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/wcr_blog_posts?related_event_id=eq.tweet_${tweetId}&select=id`,
      {
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        },
      }
    )
    const posts = await response.json()
    return Array.isArray(posts) && posts.length > 0
  } catch {
    return false
  }
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

// Generate blog post from tweet using Claude with web search
async function generateBlogPostFromTweet(tweet: Tweet): Promise<{
  title: string
  excerpt: string
  content: string
  metaTitle: string
  metaDescription: string
  keywords: string[]
  category: string
  tags: string[]
}> {
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
        content: `Here's a tweet from @TheFestiveOwl (a trusted EDM news account):

"${tweet.text}"

Tweet link: ${tweet.link}

This is real breaking news in the EDM world. Search the web to get more details, context, artist info, venue info, dates, and any related stories. Then write an original blog post about it.

After searching, respond with ONLY valid JSON (no markdown):
{
  "title": "Catchy headline, 50-70 chars, no clickbait",
  "excerpt": "Hook for social sharing, 150-200 chars",
  "content": "Full HTML article with <p> tags for each paragraph, <strong> for emphasis, <em> for track titles. 5-8 short paragraphs.",
  "metaTitle": "SEO title with artist + EDM news, 50-60 chars",
  "metaDescription": "SEO description, 150-160 chars",
  "keywords": ["array", "of", "8-10", "seo", "keywords"],
  "category": "scene-news or artist-spotlight or festival-news or industry-news",
  "tags": ["relevant", "tags", "genres"]
}

Remember: WCR voice. Short paragraphs. No em dashes. No AI filler. Opinionated.`
      }
    ]
  })

  // Extract text from response
  let textContent = ''
  for (const block of response.content) {
    if (block.type === 'text') {
      textContent = block.text
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
  tweetId: string
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
      related_event_id: `tweet_${post.tweetId}`, // Store tweet ID to prevent duplicates
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

// Helper to generate and save a post from a single tweet
async function generateFromTweet(tweet: Tweet): Promise<{ success: boolean; slug?: string; title?: string; error?: string }> {
  try {
    // Generate blog post
    const blogPost = await generateBlogPost(tweet)
    
    // Get image
    let finalImageUrl: string
    let imageCredit: string
    
    if (tweet.imageUrl) {
      const isValid = await isImageValid(tweet.imageUrl)
      if (isValid) {
        finalImageUrl = tweet.imageUrl
        imageCredit = '@TheFestiveOwl'
      } else {
        finalImageUrl = getUnsplashFallback(blogPost.title)
        imageCredit = 'Unsplash'
      }
    } else {
      finalImageUrl = getUnsplashFallback(blogPost.title)
      imageCredit = 'Unsplash'
    }
    
    // Generate slug
    const slug = blogPost.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 60) + '-' + Date.now().toString(36)
    
    // Save to Supabase
    await saveBlogPost({
      slug,
      title: blogPost.title,
      excerpt: blogPost.excerpt,
      content: blogPost.content,
      metaTitle: blogPost.metaTitle,
      metaDescription: blogPost.metaDescription,
      keywords: blogPost.keywords,
      category: blogPost.category,
      tags: blogPost.tags,
      imageUrl: finalImageUrl,
      imageCredit,
      tweetId: tweet.id
    })
    
    return { success: true, slug, title: blogPost.title }
  } catch (error) {
    console.error(`Error generating from tweet ${tweet.id}:`, error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// GET handler for Vercel Cron
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Check daily limit
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

    // Fetch latest tweets from The Festive Owl
    const tweets = await fetchFestiveOwlTweets()
    
    if (tweets.length === 0) {
      return Response.json({ 
        success: false, 
        message: 'No tweets found from @TheFestiveOwl' 
      })
    }

    // Find first unprocessed tweet
    let selectedTweet: Tweet | null = null
    for (const tweet of tweets) {
      const processed = await isTweetProcessed(tweet.id)
      if (!processed) {
        selectedTweet = tweet
        break
      }
    }

    if (!selectedTweet) {
      return Response.json({ 
        success: false, 
        message: 'All recent tweets already processed' 
      })
    }

    // Generate blog post from tweet
    const blogPost = await generateBlogPostFromTweet(selectedTweet)
    const slug = generateSlug(blogPost.title)

    // Get image - use tweet image if available, fallback to Unsplash
    let imageUrl: string
    let imageCredit: string
    
    if (selectedTweet.imageUrl && await isImageValid(selectedTweet.imageUrl)) {
      imageUrl = selectedTweet.imageUrl
      imageCredit = '@TheFestiveOwl'
    } else {
      imageUrl = getUnsplashFallback(blogPost.title)
      imageCredit = 'Unsplash'
    }

    // Save to Supabase
    await saveBlogPost({ 
      slug, 
      imageUrl, 
      imageCredit, 
      tweetId: selectedTweet.id,
      ...blogPost 
    })

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
      source_tweet: {
        id: selectedTweet.id,
        text: selectedTweet.text.substring(0, 100) + '...',
        link: selectedTweet.link
      },
      posts_today: postsToday + 1
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
  const limit = parseInt(url.searchParams.get('limit') || '1', 10)
  
  if (!isTest) {
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
  return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  }
  
  try {
  // Fetch latest tweets
  const tweets = await fetchFestiveOwlTweets()
  
  if (tweets.length === 0) {
  return Response.json({
  success: false,
  message: 'No tweets found from @TheFestiveOwl - all Nitter instances may be down',
  instances_tried: NITTER_INSTANCES,
  tip: 'Check if nitter.poast.org/TheFestiveOwl/rss loads in a browser'
  })
  }
  
  // If limit > 1, process multiple tweets
  if (limit > 1) {
    const postsCreated: { slug: string; title: string; tweet_id: string }[] = []
    const tweetsToProcess: Tweet[] = []
    
    // Find unprocessed tweets up to limit
    for (const tweet of tweets.slice(0, limit + 2)) {
      const processed = await isTweetProcessed(tweet.id)
      if (!processed && tweetsToProcess.length < limit) {
        tweetsToProcess.push(tweet)
      }
    }
    
    if (tweetsToProcess.length === 0) {
      return Response.json({
        success: false,
        message: 'All recent tweets have already been processed',
        tweets_checked: tweets.slice(0, limit + 2).map(t => t.id)
      })
    }
    
    // Process each tweet
    for (const tweet of tweetsToProcess) {
      try {
        const result = await generateFromTweet(tweet)
        if (result.success) {
          postsCreated.push({
            slug: result.slug!,
            title: result.title!,
            tweet_id: tweet.id
          })
        }
      } catch (err) {
        console.error(`Failed to process tweet ${tweet.id}:`, err)
      }
    }
    
    return Response.json({
      success: postsCreated.length > 0,
      posts_created: postsCreated.length,
      posts: postsCreated,
      tweets_processed: tweetsToProcess.map(t => t.id)
    })
  }
  
  // Single tweet mode (original behavior)
  // Find first unprocessed tweet
  let selectedTweet: Tweet | null = null
  for (const tweet of tweets) {
  const processed = await isTweetProcessed(tweet.id)
  if (!processed) {
  selectedTweet = tweet
        break
      }
    }

    if (!selectedTweet) {
      return Response.json({ 
        success: false, 
        message: 'All recent tweets already processed',
        tweets_checked: tweets.length
      })
    }

    // Generate blog post
    const blogPost = await generateBlogPostFromTweet(selectedTweet)
    const slug = generateSlug(blogPost.title)

    // Get image
    let imageUrl: string
    let imageCredit: string
    
    if (selectedTweet.imageUrl && await isImageValid(selectedTweet.imageUrl)) {
      imageUrl = selectedTweet.imageUrl
      imageCredit = '@TheFestiveOwl'
    } else {
      imageUrl = getUnsplashFallback(blogPost.title)
      imageCredit = 'Unsplash'
    }

    // Save to Supabase
    await saveBlogPost({ 
      slug, 
      imageUrl, 
      imageCredit, 
      tweetId: selectedTweet.id,
      ...blogPost 
    })

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
      source_tweet: {
        id: selectedTweet.id,
        text: selectedTweet.text,
        link: selectedTweet.link
      }
    })
  } catch (error) {
    console.error('Blog generation failed:', error)
    return Response.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
