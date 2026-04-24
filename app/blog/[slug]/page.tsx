import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Calendar, Tag, MapPin, User, Share2 } from 'lucide-react'

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

  return {
    title: post.meta_title || `${post.title} | Chicago EDM Blog | Windy City Raves`,
    description: post.meta_description || post.excerpt,
    keywords: post.keywords || ['Chicago EDM', 'Chicago raves', 'electronic music'],
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.published_at,
      images: post.featured_image ? [post.featured_image] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: post.featured_image ? [post.featured_image] : [],
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
  'event-preview': 'bg-cyan-100 text-cyan-700',
  'event-recap': 'bg-purple-100 text-purple-700',
  'artist-spotlight': 'bg-red-100 text-red-700',
  'venue-guide': 'bg-amber-100 text-amber-700',
  'scene-news': 'bg-emerald-100 text-emerald-700',
  'industry-news': 'bg-blue-100 text-blue-700',
  'festival-news': 'bg-pink-100 text-pink-700',
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getBlogPost(slug)
  
  if (!post) {
    notFound()
  }

  const relatedPosts = await getRelatedPosts(post.category, slug)

  // JSON-LD structured data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: post.featured_image,
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
      
      <main className="min-h-screen bg-white">
        {/* Hero */}
        <article>
          <header className="relative">
            {(post.image_url || post.featured_image) ? (
              <div className="relative h-[40vh] md:h-[50vh]">
                <Image
                  src={post.image_url || post.featured_image || ''}
                  alt={post.title}
                  fill
                  className="object-cover"
                  priority
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                {post.image_credit && (
                  <div className="absolute bottom-4 right-4 text-white/70 text-xs">
                    Photo: {post.image_credit}
                  </div>
                )}
              </div>
            ) : (
              <div className="h-[30vh] bg-gradient-to-br from-red-500 to-cyan-500" />
            )}
            
            <div className="max-w-4xl mx-auto px-4 -mt-32 relative z-10">
              <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
                <Link 
                  href="/blog" 
                  className="inline-flex items-center gap-2 text-gray-500 hover:text-red-500 mb-6 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Blog
                </Link>
                
                <div className="flex items-center gap-3 mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${categoryColors[post.category]}`}>
                    {categoryLabels[post.category]}
                  </span>
                  <span className="text-gray-400">|</span>
                  <time className="text-gray-500 text-sm flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(post.published_at).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </time>
                </div>
                
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-6 leading-tight">
                  {post.title}
                </h1>
                
                <p className="text-xl text-gray-600 leading-relaxed">
                  {post.excerpt}
                </p>
                
                {(post.related_artist || post.related_venue) && (
                  <div className="flex flex-wrap gap-4 mt-6 pt-6 border-t border-gray-100">
                    {post.related_artist && (
                      <span className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="w-4 h-4 text-red-500" />
                        {post.related_artist}
                      </span>
                    )}
                    {post.related_venue && (
                      <span className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 text-cyan-500" />
                        {post.related_venue}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="max-w-4xl mx-auto px-4 py-12">
            <div 
              className="prose prose-lg prose-gray max-w-none prose-headings:font-bold prose-a:text-red-500 prose-a:no-underline hover:prose-a:underline"
              dangerouslySetInnerHTML={{ __html: post.content }}
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
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Posts</h2>
              <div className="grid md:grid-cols-3 gap-8">
                {relatedPosts.map((relatedPost) => (
                  <Link key={relatedPost.id} href={`/blog/${relatedPost.slug}`} className="group">
                    <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-gray-200 mb-4">
                      {relatedPost.featured_image ? (
                        <Image
                          src={relatedPost.featured_image}
                          alt={relatedPost.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-cyan-500" />
                      )}
                    </div>
                    <h3 className="font-bold text-gray-900 group-hover:text-red-500 transition-colors line-clamp-2">
                      {relatedPost.title}
                    </h3>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Find Your Next Event</h2>
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
