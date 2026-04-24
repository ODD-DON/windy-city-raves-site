import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Calendar, Tag, MapPin, User } from 'lucide-react'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

type BlogPost = {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  category: string
  featured_image: string | null
  image_url: string | null
  image_credit: string | null
  tags: string[] | null
  meta_title: string | null
  meta_description: string | null
  keywords: string[] | null
  related_event_id: string | null
  related_artist: string | null
  related_venue: string | null
  published_at: string
  created_at: string
}

async function getBlogPost(slug: string): Promise<BlogPost | null> {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/wcr_blog_posts?slug=eq.${slug}&status=eq.published&limit=1`,
    {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      next: { revalidate: 300 }
    }
  )
  
  if (!res.ok) return null
  const posts = await res.json()
  return posts[0] || null
}

async function getRelatedPosts(category: string, currentSlug: string): Promise<BlogPost[]> {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/wcr_blog_posts?category=eq.${category}&slug=neq.${currentSlug}&status=eq.published&order=published_at.desc&limit=3`,
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
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = await getBlogPost(slug)
  
  if (!post) {
    return { title: 'Post Not Found | Windy City Raves' }
  }

  const imageUrl = post.image_url || post.featured_image

  return {
    title: post.meta_title || `${post.title} | Chicago EDM Blog | Windy City Raves`,
    description: post.meta_description || post.excerpt,
    keywords: post.keywords || ['Chicago EDM', 'Chicago raves', 'electronic music'],
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.published_at,
      images: imageUrl ? [imageUrl] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: imageUrl ? [imageUrl] : [],
    },
  }
}

const categoryLabels: Record<string, string> = {
  'event-preview': 'Event Preview',
  'event-recap': 'Event Recap',
  'artist-spotlight': 'Artist Spotlight',
  'venue-guide': 'Venue Guide',
  'scene-news': 'Scene News',
  'industry-news': 'Industry News',
  'festival-news': 'Festival News',
}

const categoryColors: Record<string, string> = {
  'event-preview': 'bg-cyan-500 text-white',
  'event-recap': 'bg-purple-500 text-white',
  'artist-spotlight': 'bg-red-500 text-white',
  'venue-guide': 'bg-amber-500 text-white',
  'scene-news': 'bg-emerald-500 text-white',
  'industry-news': 'bg-blue-500 text-white',
  'festival-news': 'bg-pink-500 text-white',
}

// Process content to add drop cap and ensure proper paragraph formatting
function processContent(content: string): string {
  let processed = content
  
  // If content doesn't have <p> tags, wrap paragraphs
  if (!processed.includes('<p>')) {
    // Split by double newlines or single newlines
    const paragraphs = processed.split(/\n\n+|\n/).filter(p => p.trim())
    processed = paragraphs.map(p => `<p>${p.trim()}</p>`).join('\n')
  }
  
  // Clean up any empty paragraphs
  processed = processed.replace(/<p>\s*<\/p>/g, '')
  
  // Ensure paragraphs aren't nested or malformed
  processed = processed.replace(/<p><p>/g, '<p>')
  processed = processed.replace(/<\/p><\/p>/g, '</p>')
  
  // Add drop cap to first paragraph
  processed = processed.replace(
    /<p>([A-Za-z])/,
    '<p><span class="drop-cap">$1</span>'
  )
  
  return processed
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getBlogPost(slug)
  
  if (!post) {
    notFound()
  }

  const relatedPosts = await getRelatedPosts(post.category, slug)
  const imageUrl = post.image_url || post.featured_image
  const processedContent = processContent(post.content)

  // JSON-LD structured data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: imageUrl,
    datePublished: post.published_at,
    dateModified: post.published_at,
    author: {
      '@type': 'Organization',
      name: 'Windy City Raves',
      url: 'https://windycityraves.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Windy City Raves',
      logo: {
        '@type': 'ImageObject',
        url: 'https://windycityraves.com/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://windycityraves.com/blog/${slug}`,
    },
    keywords: post.keywords?.join(', ') || 'Chicago EDM, Chicago raves',
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* Drop cap and article styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        .drop-cap {
          float: left;
          font-family: var(--font-playfair), Georgia, serif;
          font-size: 4.5rem;
          line-height: 0.8;
          font-weight: 700;
          color: #dc2626;
          padding-right: 0.75rem;
          padding-top: 0.25rem;
        }
        
        .article-body p {
          margin-bottom: 1.75rem !important;
          line-height: 1.85;
          color: #374151;
        }
        
        .article-body p:last-child {
          margin-bottom: 0 !important;
        }
        
        .article-body h2 {
          font-family: var(--font-playfair), Georgia, serif;
          font-size: 1.75rem;
          font-weight: 700;
          color: #111827;
          margin-top: 2.5rem;
          margin-bottom: 1rem;
        }
        
        .article-body h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
          margin-top: 2rem;
          margin-bottom: 0.75rem;
        }
        
        .article-body strong, .article-body b {
          font-weight: 600;
          color: #111827;
        }
        
        .article-body em, .article-body i {
          font-style: italic;
          color: #4b5563;
        }
        
        .article-body a {
          color: #dc2626;
          text-decoration: none;
          border-bottom: 1px solid transparent;
          transition: border-color 0.2s;
        }
        
        .article-body a:hover {
          border-bottom-color: #dc2626;
        }
        
        .article-body blockquote {
          border-left: 4px solid #8b5cf6;
          background: #f9fafb;
          padding: 1.5rem 2rem;
          margin: 2rem 0;
          font-size: 1.25rem;
          font-style: italic;
          color: #4b5563;
          border-radius: 0 0.5rem 0.5rem 0;
        }
        
        .article-body blockquote p {
          margin-bottom: 0;
        }
        
        .article-body ul, .article-body ol {
          margin-bottom: 1.5rem;
          padding-left: 1.5rem;
        }
        
        .article-body li {
          margin-bottom: 0.5rem;
        }
        
        .article-body .embed-container {
          margin: 2rem 0;
          border-radius: 0.75rem;
          overflow: hidden;
        }
        
        .article-body iframe {
          width: 100%;
          border-radius: 0.75rem;
        }
      `}} />
      
      <main className="min-h-screen bg-white">
        <article>
          {/* Reading flow: Category -> Headline -> Subtitle -> Byline -> Hero Image -> Body */}
          
          {/* Header Section */}
          <header className="pt-8 pb-6">
            <div className="max-w-2xl mx-auto px-4">
              {/* Back link */}
              <Link 
                href="/blog" 
                className="inline-flex items-center gap-2 text-gray-500 hover:text-red-500 mb-8 transition-colors text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Blog
              </Link>
              
              {/* 1. Category Tag */}
              <div className="mb-4">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${categoryColors[post.category]}`}>
                  {categoryLabels[post.category]}
                </span>
              </div>
              
              {/* 2. Headline - Display font */}
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                {post.title}
              </h1>
              
              {/* 3. Subtitle/Excerpt */}
              <p className="text-xl text-gray-600 leading-relaxed mb-6">
                {post.excerpt}
              </p>
              
              {/* 4. Byline */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 pb-6 border-b border-gray-100">
                <span className="font-medium text-gray-900">Windy City Raves</span>
                <span className="text-gray-300">|</span>
                <time className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {new Date(post.published_at).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </time>
                {post.related_artist && (
                  <>
                    <span className="text-gray-300">|</span>
                    <span className="flex items-center gap-1.5">
                      <User className="w-4 h-4 text-red-500" />
                      {post.related_artist}
                    </span>
                  </>
                )}
                {post.related_venue && (
                  <>
                    <span className="text-gray-300">|</span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-cyan-500" />
                      {post.related_venue}
                    </span>
                  </>
                )}
              </div>
            </div>
          </header>

          {/* 5. Hero Image - Full width */}
          {imageUrl && (
            <div className="relative w-full max-w-4xl mx-auto px-4 mb-12">
              <div className="relative aspect-[16/9] rounded-xl overflow-hidden">
                <Image
                  src={imageUrl}
                  alt={post.title}
                  fill
                  className="object-cover"
                  priority
                  unoptimized
                />
              </div>
              {post.image_credit && (
                <p className="text-xs text-gray-400 mt-2 text-right">
                  Photo: {post.image_credit}
                </p>
              )}
            </div>
          )}

          {/* 6. Body Content - Constrained width for readability */}
          <div className="max-w-2xl mx-auto px-4 pb-16">
            <div 
              className="article-body text-lg text-gray-800 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: processedContent }}
            />
            
            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-12 pt-8 border-t border-gray-100">
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag className="w-4 h-4 text-gray-400" />
                  {post.tags.map((tag) => (
                    <span 
                      key={tag}
                      className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-sm font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Keywords for SEO */}
            {post.keywords && post.keywords.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center gap-2 flex-wrap">
                  {post.keywords.map((keyword) => (
                    <span 
                      key={keyword}
                      className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-xs"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </article>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="bg-gray-50 py-16 px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-serif text-2xl font-bold text-gray-900 mb-8">More from the Scene</h2>
              <div className="grid md:grid-cols-3 gap-8">
                {relatedPosts.map((relatedPost) => {
                  const relatedImage = relatedPost.image_url || relatedPost.featured_image
                  return (
                    <Link key={relatedPost.id} href={`/blog/${relatedPost.slug}`} className="group">
                      <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-gray-200 mb-4">
                        {relatedImage ? (
                          <Image
                            src={relatedImage}
                            alt={relatedPost.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            unoptimized
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-cyan-500" />
                        )}
                      </div>
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium mb-2 ${categoryColors[relatedPost.category]}`}>
                        {categoryLabels[relatedPost.category]}
                      </span>
                      <h3 className="font-bold text-gray-900 group-hover:text-red-500 transition-colors line-clamp-2">
                        {relatedPost.title}
                      </h3>
                    </Link>
                  )
                })}
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="py-16 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-serif text-2xl font-bold text-gray-900 mb-4">Find Your Next Event</h2>
            <p className="text-gray-600 mb-8">
              Discover what&apos;s happening tonight and this weekend in Chicago&apos;s EDM scene.
            </p>
            <Link 
              href="/events"
              className="inline-flex items-center gap-2 bg-red-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-red-600 transition-colors"
            >
              Browse Events
            </Link>
          </div>
        </section>
      </main>
    </>
  )
}
