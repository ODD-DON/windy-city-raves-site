import { generateText, Output } from 'ai'
import { z } from 'zod'
import { NextRequest } from 'next/server'

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
  { type: 'event-preview', prompt: 'an upcoming electronic music event happening in Chicago this week or weekend' },
  { type: 'event-recap', prompt: 'a recent memorable rave or EDM show that happened in Chicago' },
  { type: 'artist-spotlight', prompt: 'a DJ or electronic music artist who has performed or will perform in Chicago' },
  { type: 'venue-guide', prompt: 'a Chicago nightclub or music venue known for electronic music' },
  { type: 'scene-news', prompt: 'news about Chicago EDM scene, new venue openings, festival announcements, or industry updates' },
]

const chicagoVenues = [
  'Sound-Bar', 'Prysm', 'Radius Chicago', 'Concord Music Hall', 
  'Smartbar', 'Spy Bar', 'The Mid', 'Aragon Ballroom',
  'Lincoln Hall', 'Metro Chicago', 'The Salt Shed', 'Thalia Hall'
]

const genres = [
  'house music', 'techno', 'bass music', 'dubstep', 
  'drum and bass', 'trance', 'progressive house', 'melodic techno',
  'deep house', 'tech house', 'hardstyle', 'jungle'
]

const artistStyles = [
  'local Chicago DJ', 'touring headliner', 'rising producer',
  'underground selector', 'festival mainstage artist', 'resident DJ'
]

export async function GET(req: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = req.headers.get('authorization')
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

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

    // Pick random elements for variety
    const topic = topics[Math.floor(Math.random() * topics.length)]
    const venue = chicagoVenues[Math.floor(Math.random() * chicagoVenues.length)]
    const genre = genres[Math.floor(Math.random() * genres.length)]
    const artistStyle = artistStyles[Math.floor(Math.random() * artistStyles.length)]

    const prompt = `You are a Chicago EDM scene expert and blog writer for Windy City Raves, the premier source for electronic music events in Chicago.

Write a unique, engaging blog post about: ${topic.prompt}

Context for this post:
- Featured venue: ${venue}
- Genre focus: ${genre}
- Artist angle: ${artistStyle}
- Make it authentic to Chicago's EDM and house music culture
- Reference the Chicago house music legacy when relevant
- Use specific Chicago neighborhood names (River North, Wicker Park, West Loop, Logan Square, Pilsen, etc.)
- Write in an engaging tone that appeals to ravers and music lovers

Requirements:
- Title: SEO-optimized, include "Chicago" and genre/event keywords, catchy but not clickbait
- Excerpt: 2-3 compelling sentences that summarize the post
- Content: 500-700 words of well-structured HTML using <p>, <h2>, <h3>, <ul>, <li> tags
- Slug: URL-friendly (lowercase, hyphens, no special characters, include key terms)
- Keywords: 6-10 relevant SEO terms (include "Chicago EDM", venue names, genres)
- Meta title: Under 60 characters, compelling for search results
- Meta description: 150-160 characters, includes call to action

The content should help readers discover Chicago's electronic music scene and be useful for anyone searching for EDM events, venues, or artists in Chicago.`

    const result = await generateText({
      model: 'anthropic/claude-sonnet-4-20250514',
      prompt,
      output: Output.object({ schema: blogPostSchema }),
    })

    const post = result.object

    if (!post) {
      return Response.json({ error: 'Failed to generate post content' }, { status: 500 })
    }

    // Ensure unique slug by adding timestamp if needed
    const uniqueSlug = `${post.slug}-${Date.now().toString(36)}`

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
        slug: uniqueSlug,
        status: 'published',
        published_at: new Date().toISOString(),
        ai_generated: true,
        generation_prompt: prompt,
      }),
    })

    if (!insertRes.ok) {
      const error = await insertRes.text()
      console.error('Failed to save post:', error)
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

    console.log(`Generated blog post: ${savedPost[0]?.title}`)

    return Response.json({
      success: true,
      post: {
        id: savedPost[0]?.id,
        title: savedPost[0]?.title,
        slug: savedPost[0]?.slug,
        category: savedPost[0]?.category,
      },
      posts_today: postsToday + 1,
    })

  } catch (error) {
    console.error('Cron blog generation error:', error)
    return Response.json({ 
      error: 'Generation failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
