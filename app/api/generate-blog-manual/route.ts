import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Detect post format based on input
function detectFormat(topic: string): 'list' | 'checklist' | 'guide' | 'editorial' {
  const lower = topic.toLowerCase()
  
  if (/top\s*\d+|best\s*\d+|\d+\s*best|\d+\s*top|ranking|ranked/i.test(lower)) {
    return 'list'
  }
  if (/checklist|packing|what to bring|essentials|must.?have/i.test(lower)) {
    return 'checklist'
  }
  if (/guide|how to|tutorial|tips for|beginner|first time/i.test(lower)) {
    return 'guide'
  }
  return 'editorial'
}

// Extract keywords for Unsplash
function extractKeywords(topic: string): string {
  const stopWords = ['the', 'a', 'an', 'to', 'for', 'of', 'in', 'at', 'on', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'top', 'ten', 'best', 'this', 'that', 'these', 'those', 'what', 'how']
  
  const words = topic.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.includes(w))
    .slice(0, 3)
  
  return ['EDM', 'festival', ...words].join(',')
}

// Generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .slice(0, 80)
}

// Format-specific instructions
const formatInstructions: Record<string, string> = {
  list: `This is a RANKED LIST post. Structure:
- Start with a punchy intro (2-3 sentences, no "here are" or "let's dive into")
- Then NUMBER each item 1-10 (or however many make sense)
- Each item gets: <h2>NUMBER. Item Name</h2> followed by a short paragraph (2-3 sentences) explaining why it's on the list
- Bold the key names/venues with <strong>
- End with a short outro, no "in conclusion"`,
  
  checklist: `This is a CHECKLIST post. Structure:
- Start with a punchy intro about why this matters
- Use a styled checklist format with checkboxes
- Group items into categories with <h2> headers
- Format each item as: <div class="checklist-item"><input type="checkbox" disabled /><label>Item name</label><span class="item-note">brief note if needed</span></div>
- Add pro tips between sections in <blockquote> tags
- Keep it practical and specific`,
  
  guide: `This is a HOW-TO GUIDE. Structure:
- Start with why this guide matters (hook, not summary)
- Break into clear STEPS with <h2>Step 1: Action Verb</h2> format
- Each step gets 2-3 paragraphs max
- Include insider tips in <blockquote> tags
- End with a "you got this" type closer, not a summary`,
  
  editorial: `This is an EDITORIAL post. Structure:
- Start with a hook that makes people want to read more
- Use <h2> to break into 2-3 sections if the topic is complex
- Short punchy paragraphs, 2-3 sentences each
- Include opinions and hot takes
- Reference Chicago scene when relevant
- End strong, not with a summary`
}

// System prompt for Claude
const SYSTEM_PROMPT = `You are a writer for Windy City Raves, a Chicago underground EDM blog.

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

HTML FORMATTING:
- Wrap all paragraphs in <p> tags
- Use <h2> for section breaks
- Use <strong> for artist names, venue names, dates
- Use <em> for track/album titles
- Use <blockquote> for standout quotes or pro tips`

export async function POST(req: Request) {
  try {
    const { topic } = await req.json()
    
    if (!topic || typeof topic !== 'string' || topic.trim().length < 5) {
      return Response.json({ error: 'Topic must be at least 5 characters' }, { status: 400 })
    }
    
    const format = detectFormat(topic)
    const keywords = extractKeywords(topic)

    // Call Claude with web search enabled
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4000,
      system: SYSTEM_PROMPT,
      tools: [
        {
          type: 'web_search_20250305',
          name: 'web_search',
        }
      ],
      messages: [
        {
          role: 'user',
          content: `Write a blog post about: "${topic}"

Format type detected: ${format.toUpperCase()}

${formatInstructions[format]}

After searching and writing, respond with ONLY valid JSON (no markdown code blocks, no explanation):
{
  "title": "Catchy headline, 50-70 chars, no clickbait",
  "excerpt": "Hook for social sharing, 150-200 chars",
  "content": "Full HTML article following the format rules above",
  "metaTitle": "SEO title, 50-60 chars",
  "metaDescription": "SEO description, 150-160 chars",
  "keywords": ["8-10", "seo", "keywords"],
  "category": "scene-news or artist-spotlight or festival-news or venue-guide",
  "tags": ["relevant", "tags"]
}`
        }
      ]
    })

    // Extract text content from response
    let fullText = ''
    for (const block of response.content) {
      if (block.type === 'text') {
        fullText += block.text
      }
    }

    // Parse Claude's response
    let parsed
    try {
      const jsonMatch = fullText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('No JSON found in response')
      parsed = JSON.parse(jsonMatch[0])
    } catch (e) {
      return Response.json({ 
        error: 'Failed to parse Claude response',
        raw: fullText.slice(0, 1000)
      }, { status: 500 })
    }

    // Generate image URL from Unsplash
    const imageUrl = `https://source.unsplash.com/1200x630/?${encodeURIComponent(keywords)}`
    
    // Generate slug
    const slug = generateSlug(parsed.title) + '-' + Date.now().toString(36)

    // Return preview (don't save yet)
    return Response.json({
      success: true,
      preview: true,
      post: {
        title: parsed.title,
        slug,
        excerpt: parsed.excerpt,
        content: parsed.content,
        category: parsed.category || 'scene-news',
        tags: parsed.tags || [],
        keywords: parsed.keywords || [],
        meta_title: parsed.metaTitle,
        meta_description: parsed.metaDescription,
        image_url: imageUrl,
        image_credit: 'Unsplash',
        format_detected: format,
        original_topic: topic
      },
      web_search_used: true
    })

  } catch (error) {
    console.error('[v0] Manual blog generation error:', error)
    return Response.json({ 
      error: 'Generation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Publish endpoint
export async function PUT(req: Request) {
  try {
    const post = await req.json()
    
    if (!post.title || !post.content || !post.slug) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Save to Supabase
    const response = await fetch(`${SUPABASE_URL}/rest/v1/wcr_blog_posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        category: post.category || 'scene-news',
        tags: post.tags || [],
        keywords: post.keywords || [],
        meta_title: post.meta_title,
        meta_description: post.meta_description,
        image_url: post.image_url,
        image_credit: post.image_credit || 'Unsplash',
        status: 'published',
        published_at: new Date().toISOString(),
        ai_generated: true,
        generation_prompt: post.original_topic || null
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      return Response.json({ error: 'Failed to save to database', details: errorText }, { status: 500 })
    }

    const saved = await response.json()
    
    return Response.json({
      success: true,
      post: saved[0],
      url: `/blog/${post.slug}`
    })

  } catch (error) {
    console.error('[v0] Publish error:', error)
    return Response.json({ 
      error: 'Publish failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
