import { generateText, Output } from 'ai'
import { z } from 'zod'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Blog post schema
const blogPostSchema = z.object({
  title: z.string(),
  slug: z.string(),
  excerpt: z.string(),
  content: z.string(),
  category: z.enum(['event-preview', 'event-recap', 'artist-spotlight', 'venue-guide', 'scene-news']),
  meta_title: z.string(),
  meta_description: z.string(),
  keywords: z.array(z.string()),
  related_artist: z.string().nullable(),
  related_venue: z.string().nullable(),
})

const topics = [
  { type: 'event-preview', prompt: 'upcoming electronic music event in Chicago' },
  { type: 'event-recap', prompt: 'recent rave or EDM show that happened in Chicago' },
  { type: 'artist-spotlight', prompt: 'DJ or electronic music artist performing in Chicago' },
  { type: 'venue-guide', prompt: 'Chicago nightclub or music venue for electronic music' },
  { type: 'scene-news', prompt: 'Chicago EDM scene news, trends, or announcements' },
]

const chicagoVenues = [
  'Sound-Bar', 'Prysm', 'Radius Chicago', 'Concord Music Hall', 
  'Smartbar', 'Spy Bar', 'The Mid', 'Aragon Ballroom',
  'Credit Union 1 Arena', 'United Center', 'Northerly Island'
]

const genres = [
  'house music', 'techno', 'bass music', 'dubstep', 
  'drum and bass', 'trance', 'progressive house', 'melodic techno'
]

export async function POST(req: Request) {
  try {
    // Verify API key for security
    const authHeader = req.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check how many posts generated today
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

    // Pick a random topic
    const topic = topics[Math.floor(Math.random() * topics.length)]
    const venue = chicagoVenues[Math.floor(Math.random() * chicagoVenues.length)]
    const genre = genres[Math.floor(Math.random() * genres.length)]

    const prompt = `You are a Chicago EDM scene expert and blog writer for Windy City Raves, the premier source for electronic music events in Chicago.

Write a blog post about: ${topic.prompt}

Context:
- Featured venue to mention: ${venue}
- Genre focus: ${genre}
- Make it sound authentic to Chicago's EDM scene
- Include references to the Chicago house music legacy
- Mention local events, venues, and artists when relevant
- Write in an engaging, insider tone that appeals to ravers and EDM fans
- Use specific Chicago neighborhood references (River North, Wicker Park, West Loop, etc.)

Requirements:
- Title should be SEO-optimized and catchy (include "Chicago" and relevant keywords)
- Excerpt should be 2-3 compelling sentences
- Content should be 400-600 words of well-structured HTML (use <p>, <h2>, <h3>, <ul>, <li> tags)
- Slug should be URL-friendly (lowercase, hyphens, no special chars)
- Include 5-8 relevant SEO keywords
- Meta title should be under 60 characters
- Meta description should be 150-160 characters

The content should be informative, engaging, and help readers discover Chicago's electronic music scene.`

    const result = await generateText({
      model: 'anthropic/claude-sonnet-4-20250514',
      prompt,
      output: Output.object({ schema: blogPostSchema }),
    })

    const post = result.object

    if (!post) {
      return Response.json({ error: 'Failed to generate post' }, { status: 500 })
    }

    // Save to database
    const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/wcr_blog_posts`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({
        ...post,
        status: 'published',
        published_at: new Date().toISOString(),
        ai_generated: true,
        generation_prompt: prompt,
      }),
    })

    if (!insertRes.ok) {
      const error = await insertRes.text()
      return Response.json({ error: 'Failed to save post', details: error }, { status: 500 })
    }

    const savedPost = await insertRes.json()

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
          ? [...logs[0].topics_used, topic.type]
          : [topic.type],
      }),
    })

    return Response.json({
      success: true,
      post: savedPost[0],
      posts_today: postsToday + 1,
    })

  } catch (error) {
    console.error('Blog generation error:', error)
    return Response.json({ 
      error: 'Generation failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}

// GET endpoint to check status
export async function GET() {
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
  
  return Response.json({
    date: today,
    posts_generated: logs[0]?.posts_generated || 0,
    topics_used: logs[0]?.topics_used || [],
    remaining: 3 - (logs[0]?.posts_generated || 0),
  })
}
