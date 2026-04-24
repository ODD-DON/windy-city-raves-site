import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Calendar, MapPin } from 'lucide-react'

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
  'event-preview': 'PREVIEW',
  'event-recap': 'RECAP',
  'artist-spotlight': 'ARTIST',
  'venue-guide': 'VENUE',
  'scene-news': 'NEWS',
  'industry-news': 'INDUSTRY',
  'festival-news': 'FESTIVAL',
}

// Process content to strip markdown and ensure proper paragraph formatting
function processContent(content: string): string {
  let processed = content
  
  // Strip any leftover markdown and convert to HTML
  processed = processed.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  processed = processed.replace(/\*([^*]+)\*/g, '<em>$1</em>')
  processed = processed.replace(/__([^_]+)__/g, '<strong>$1</strong>')
  processed = processed.replace(/_([^_]+)_/g, '<em>$1</em>')
  processed = processed.replace(/^### (.+)$/gm, '<h3>$1</h3>')
  processed = processed.replace(/^## (.+)$/gm, '<h2>$1</h2>')
  processed = processed.replace(/^# (.+)$/gm, '<h2>$1</h2>')
  
  // If content doesn't have <p> tags, wrap paragraphs
  if (!processed.includes('<p>')) {
    const paragraphs = processed.split(/\n\n+|\n/).filter(p => p.trim())
    processed = paragraphs.map(p => {
      const trimmed = p.trim()
      if (trimmed.startsWith('<h') || trimmed.startsWith('<blockquote') || trimmed.startsWith('<ul') || trimmed.startsWith('<ol') || trimmed.startsWith('<div')) {
        return trimmed
      }
      return `<p>${trimmed}</p>`
    }).join('\n')
  }
  
  // Clean up
  processed = processed.replace(/<p>\s*<\/p>/g, '')
  processed = processed.replace(/<p><p>/g, '<p>')
  processed = processed.replace(/<\/p><\/p>/g, '</p>')
  
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

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: imageUrl,
    datePublished: post.published_at,
    dateModified: post.published_at,
    author: { '@type': 'Organization', name: 'Windy City Raves', url: 'https://windycityraves.com' },
    publisher: { '@type': 'Organization', name: 'Windy City Raves' },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `https://windycityraves.com/blog/${slug}` },
    keywords: post.keywords?.join(', ') || 'Chicago EDM, Chicago raves',
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* WCR Underground Blog Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        .wcr-body p {
          margin-bottom: 1.75rem;
          font-size: 1.125rem;
          line-height: 1.9;
          color: #e5e5e5;
        }
        
        .wcr-body h2 {
          font-size: 1.5rem;
          font-weight: 800;
          color: #fff;
          margin-top: 3rem;
          margin-bottom: 1.25rem;
          text-transform: uppercase;
          letter-spacing: 0.025em;
        }
        
        .wcr-body h3 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #f5f5f5;
          margin-top: 2rem;
          margin-bottom: 1rem;
        }
        
        .wcr-body strong, .wcr-body b {
          font-weight: 700;
          color: #fff;
        }
        
        .wcr-body em, .wcr-body i {
          font-style: italic;
          color: #a3a3a3;
        }
        
        .wcr-body a {
          color: #ef4444;
          text-decoration: none;
          border-bottom: 1px solid transparent;
          transition: border-color 0.2s;
        }
        
        .wcr-body a:hover {
          border-bottom-color: #ef4444;
        }
        
        .wcr-body blockquote {
          border-left: 3px solid #ef4444;
          background: rgba(239, 68, 68, 0.1);
          padding: 1.25rem 1.5rem;
          margin: 2rem 0;
          font-size: 1.25rem;
          font-style: normal;
          color: #fafafa;
          border-radius: 0 0.5rem 0.5rem 0;
        }
        
        .wcr-body blockquote p {
          margin-bottom: 0;
          font-size: 1.25rem;
        }
        
        .wcr-body ul, .wcr-body ol {
          margin-bottom: 1.75rem;
          padding-left: 1.5rem;
        }
        
        .wcr-body li {
          margin-bottom: 0.75rem;
          color: #e5e5e5;
        }
        
        .wcr-body ol {
          list-style-type: decimal;
        }
        
        .wcr-body ol li::marker {
          color: #ef4444;
          font-weight: 700;
        }
        
        .wcr-body .embed-container {
          margin: 2rem 0;
          border-radius: 0.75rem;
          overflow: hidden;
        }
        
        .wcr-body iframe {
          width: 100%;
          border-radius: 0.75rem;
        }
      `}} />
      
      <main className="min-h-screen bg-zinc-950">
        <article>
          {/* Hero Image - Full bleed */}
          {imageUrl && (
            <div className="relative w-full h-[50vh] md:h-[60vh]">
              <Image
                src={imageUrl}
                alt={post.title}
                fill
                className="object-cover"
                priority
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent" />
              
              {/* Back button overlay */}
              <div className="absolute top-6 left-6 z-10">
                <Link 
                  href="/blog" 
                  className="inline-flex items-center gap-2 text-white/80 hover:text-white bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Link>
              </div>
              
              {post.image_credit && (
                <p className="absolute bottom-4 right-4 text-xs text-white/50">
                  {post.image_credit}
                </p>
              )}
            </div>
          )}

          {/* Header - overlapping hero */}
          <header className={`relative ${imageUrl ? '-mt-32' : 'pt-24'} pb-8 z-10`}>
            <div className="max-w-3xl mx-auto px-6">
              {/* Category */}
              <span className="inline-block px-3 py-1 bg-red-500 text-white text-xs font-bold uppercase tracking-wider rounded mb-4">
                {categoryLabels[post.category]}
              </span>
              
              {/* Title - Bold, impactful */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight mb-6 tracking-tight">
                {post.title}
              </h1>
              
              {/* Meta line */}
              <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-400">
                <span className="text-red-400 font-semibold">WCR</span>
                <span className="text-zinc-600">/</span>
                <time className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(post.published_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </time>
                {post.related_venue && (
                  <>
                    <span className="text-zinc-600">/</span>
                    <span className="flex items-center gap-1.5 text-cyan-400">
                      <MapPin className="w-3.5 h-3.5" />
                      {post.related_venue}
                    </span>
                  </>
                )}
              </div>
            </div>
          </header>

          {/* Body Content */}
          <div className="max-w-3xl mx-auto px-6 pb-20">
            {/* Excerpt as lead */}
            <p className="text-xl md:text-2xl text-zinc-300 leading-relaxed mb-12 font-medium">
              {post.excerpt}
            </p>
            
            {/* Article body */}
            <div 
              className="wcr-body"
              dangerouslySetInnerHTML={{ __html: processedContent }}
            />
            
            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-16 pt-8 border-t border-zinc-800">
                <div className="flex items-center gap-2 flex-wrap">
                  {post.tags.map((tag) => (
                    <span 
                      key={tag}
                      className="px-3 py-1.5 bg-zinc-900 text-zinc-400 rounded-full text-sm font-medium border border-zinc-800 hover:border-red-500/50 hover:text-red-400 transition-colors cursor-default"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </article>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="bg-zinc-900 py-16 px-6">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-xs font-bold uppercase tracking-widest text-red-400 mb-8">More from WCR</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {relatedPosts.map((relatedPost) => {
                  const relatedImage = relatedPost.image_url || relatedPost.featured_image
                  return (
                    <Link key={relatedPost.id} href={`/blog/${relatedPost.slug}`} className="group">
                      <div className="relative aspect-[16/10] rounded-lg overflow-hidden bg-zinc-800 mb-4">
                        {relatedImage ? (
                          <Image
                            src={relatedImage}
                            alt={relatedPost.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            unoptimized
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-cyan-600" />
                        )}
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2 block">
                        {categoryLabels[relatedPost.category]}
                      </span>
                      <h3 className="font-bold text-white group-hover:text-red-400 transition-colors line-clamp-2 leading-snug">
                        {relatedPost.title}
                      </h3>
                    </Link>
                  )
                })}
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="py-20 px-6 text-center">
          <p className="text-zinc-500 uppercase tracking-widest text-xs font-bold mb-4">What&apos;s Next</p>
          <h2 className="text-2xl md:text-3xl font-black text-white mb-8">Find your next show</h2>
          <Link 
            href="/events"
            className="inline-flex items-center gap-2 bg-red-500 text-white px-8 py-4 rounded-full font-bold uppercase tracking-wider text-sm hover:bg-red-600 transition-colors"
          >
            Browse Events
          </Link>
        </section>
      </main>
    </>
  )
}
