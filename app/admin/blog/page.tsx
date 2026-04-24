'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, Sparkles, RefreshCw, Search, Edit3, Eye, Send, X, CheckCircle } from 'lucide-react'
import Image from 'next/image'

interface BlogPost {
  title: string
  slug: string
  excerpt: string
  content: string
  category: string
  tags: string[]
  keywords: string[]
  meta_title: string
  meta_description: string
  image_url: string
  image_credit: string
  format_detected?: string
  original_topic?: string
}

interface GenerationStatus {
  date: string
  posts_generated: number
  topics_used: string[]
  remaining: number
}

const formatLabels: Record<string, string> = {
  list: 'Ranked List',
  checklist: 'Checklist',
  guide: 'How-To Guide',
  editorial: 'Editorial'
}

const formatColors: Record<string, string> = {
  list: 'bg-purple-100 text-purple-700',
  checklist: 'bg-green-100 text-green-700',
  guide: 'bg-blue-100 text-blue-700',
  editorial: 'bg-gray-100 text-gray-700'
}

export default function BlogAdminPage() {
  const [generating, setGenerating] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [status, setStatus] = useState<GenerationStatus | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  // Manual generator state
  const [topic, setTopic] = useState('')
  const [preview, setPreview] = useState<BlogPost | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [editedTitle, setEditedTitle] = useState('')
  const [editedContent, setEditedContent] = useState('')
  const contentRef = useRef<HTMLDivElement>(null)

  const checkStatus = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/wcr_blog_generation_log?date=eq.${today}`, {
        headers: {
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
        }
      })
      const logs = await res.json()
      const todayLog = logs[0]
      setStatus({
        date: today,
        posts_generated: todayLog?.posts_generated || 0,
        topics_used: todayLog?.topics_used || [],
        remaining: 3 - (todayLog?.posts_generated || 0)
      })
    } catch (err) {
      console.error('Failed to check status:', err)
    }
  }

  const generateFromTopic = async () => {
    if (!topic.trim() || topic.trim().length < 5) {
      setError('Topic must be at least 5 characters')
      return
    }
    
    setGenerating(true)
    setError(null)
    setSuccess(null)
    setPreview(null)
    
    try {
      const res = await fetch('/api/generate-blog-manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topic.trim() })
      })
      
      const data = await res.json()
      
      if (data.error) {
        setError(data.error + (data.details ? `: ${data.details}` : ''))
      } else if (data.success && data.post) {
        setPreview({
          ...data.post,
          original_topic: topic.trim()
        })
        setEditedTitle(data.post.title)
        setEditedContent(data.post.content)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setGenerating(false)
    }
  }

  const publishPost = async () => {
    if (!preview) return
    
    setPublishing(true)
    setError(null)
    
    try {
      const postToPublish = {
        ...preview,
        title: editedTitle || preview.title,
        content: editedContent || preview.content,
      }
      
      const res = await fetch('/api/generate-blog-manual', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postToPublish)
      })
      
      const data = await res.json()
      
      if (data.error) {
        setError(data.error + (data.details ? `: ${data.details}` : ''))
      } else if (data.success) {
        setSuccess(`Published! View at /blog/${preview.slug}`)
        setPreview(null)
        setTopic('')
        setEditMode(false)
        await checkStatus()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setPublishing(false)
    }
  }

  const cancelPreview = () => {
    setPreview(null)
    setEditMode(false)
    setEditedTitle('')
    setEditedContent('')
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Blog Content Generator</h1>
        <p className="text-gray-600">Generate AI-powered blog posts about Chicago EDM scene</p>
      </div>

      {/* Manual Generator */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Edit3 className="w-5 h-5 text-red-600" />
          Write a Custom Post
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What should the post be about?
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. top ten sets to see at Electric Forest"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900"
                onKeyDown={(e) => e.key === 'Enter' && !generating && generateFromTopic()}
              />
              <Button 
                onClick={generateFromTopic} 
                disabled={generating || !topic.trim()}
                className="bg-red-600 hover:bg-red-700 text-white px-6"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Searching & Writing...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Generate
                  </>
                )}
              </Button>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 text-sm">
            <span className="text-gray-500">Try:</span>
            {[
              'top ten sets to see at Electric Forest',
              'Electric Forest packing checklist',
              'best Chicago techno tracks this month',
              'first time at Spybar guide'
            ].map((example) => (
              <button
                key={example}
                onClick={() => setTopic(example)}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
              >
                {example}
              </button>
            ))}
          </div>
          
          <p className="text-xs text-gray-500">
            AI auto-detects format: &quot;top ten&quot; = ranked list, &quot;checklist&quot; = checkbox list, &quot;guide/how to&quot; = step-by-step, else = editorial
          </p>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <p className="text-red-700 font-medium">Error</p>
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Success Display */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <div>
            <p className="text-green-700 font-medium">Success!</p>
            <p className="text-green-600 text-sm">{success}</p>
          </div>
        </div>
      )}

      {/* Preview */}
      {preview && (
        <div className="bg-white border-2 border-red-200 rounded-xl overflow-hidden mb-6">
          {/* Preview Header */}
          <div className="bg-red-50 px-6 py-4 border-b border-red-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Eye className="w-5 h-5 text-red-600" />
              <span className="font-semibold text-gray-900">Preview</span>
              {preview.format_detected && (
                <span className={`text-xs font-medium px-2 py-1 rounded ${formatColors[preview.format_detected] || 'bg-gray-100 text-gray-700'}`}>
                  {formatLabels[preview.format_detected] || preview.format_detected}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditMode(!editMode)}
              >
                <Edit3 className="w-4 h-4 mr-1" />
                {editMode ? 'Preview' : 'Edit'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={cancelPreview}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Hero Image */}
          {preview.image_url && (
            <div className="relative h-64 bg-gray-100">
              <Image
                src={preview.image_url}
                alt={preview.title}
                fill
                className="object-cover"
                unoptimized
              />
              <div className="absolute bottom-2 right-2 text-white/80 text-xs bg-black/50 px-2 py-1 rounded">
                {preview.image_credit}
              </div>
            </div>
          )}

          {/* Content */}
          <div className="p-6">
            {editMode ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-gray-900 font-serif text-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content (HTML)</label>
                  <textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    rows={20}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-gray-900 font-mono text-sm"
                  />
                </div>
              </div>
            ) : (
              <div>
                <div className="mb-4">
                  <span className="text-xs font-medium text-red-600 uppercase bg-red-50 px-2 py-1 rounded">
                    {preview.category}
                  </span>
                </div>
                <h2 className="font-serif text-3xl font-bold text-gray-900 mb-3">
                  {editedTitle || preview.title}
                </h2>
                <p className="text-gray-600 mb-6 text-lg">{preview.excerpt}</p>
                
                <div 
                  ref={contentRef}
                  className="prose prose-lg max-w-none
                    prose-headings:font-serif prose-headings:font-bold
                    prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
                    prose-p:mb-6 prose-p:leading-relaxed prose-p:text-gray-800
                    prose-strong:text-gray-900
                    prose-blockquote:border-l-4 prose-blockquote:border-purple-500 prose-blockquote:bg-gray-50 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:italic
                    prose-a:text-red-600 prose-a:no-underline hover:prose-a:underline
                    [&_.checklist-item]:flex [&_.checklist-item]:items-start [&_.checklist-item]:gap-3 [&_.checklist-item]:py-2
                    [&_.checklist-item_input]:mt-1 [&_.checklist-item_input]:w-5 [&_.checklist-item_input]:h-5 [&_.checklist-item_input]:accent-red-600
                    [&_.checklist-item_label]:font-medium [&_.checklist-item_label]:text-gray-900
                    [&_.item-note]:text-gray-500 [&_.item-note]:text-sm"
                  dangerouslySetInnerHTML={{ __html: editedContent || preview.content }}
                />
                
                {preview.tags && preview.tags.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-gray-100 flex flex-wrap gap-2">
                    {preview.tags.map(tag => (
                      <span key={tag} className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-sm font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Publish Bar */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Slug: <code className="bg-gray-200 px-2 py-0.5 rounded">{preview.slug}</code>
            </div>
            <Button
              onClick={publishPost}
              disabled={publishing}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {publishing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Publish to Blog
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Status Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Today&apos;s Generation Status</h2>
          <Button variant="outline" size="sm" onClick={checkStatus}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
        
        {status ? (
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-red-600">{status.posts_generated}</p>
              <p className="text-sm text-gray-600">Posts Generated</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-cyan-600">{status.remaining}</p>
              <p className="text-sm text-gray-600">Auto Posts Left</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{status.topics_used.length}</p>
              <p className="text-sm text-gray-600">Topics Used</p>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">Click refresh to load status</p>
        )}
      </div>

      {/* Auto-Generate from @TheFestiveOwl */}
      <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 border border-zinc-700 rounded-xl p-6">
        <div className="text-center">
          <h2 className="font-semibold text-white mb-2">@TheFestiveOwl Pipeline</h2>
          <p className="text-zinc-400 text-sm mb-4">
            Pull the last 3 tweets from @TheFestiveOwl and generate blog posts from each
          </p>
          <Button 
            onClick={async () => {
              setGenerating(true)
              setError(null)
              setSuccess(null)
              try {
                const res = await fetch('/api/cron/generate-blogs?test=true&limit=3', { method: 'POST' })
                const data = await res.json()
                if (data.error) {
                  setError(data.error + (data.details ? `: ${data.details}` : ''))
                } else if (data.success) {
                  const count = data.posts_created || 1
                  setSuccess(`Generated ${count} post${count > 1 ? 's' : ''} from @TheFestiveOwl`)
                  await checkStatus()
                } else if (data.message) {
                  setSuccess(data.message)
                }
              } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error')
              } finally {
                setGenerating(false)
              }
            }}
            disabled={generating}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Fetching tweets & generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Test: Generate from Last 3 Tweets
              </>
            )}
          </Button>
          <p className="text-zinc-500 text-xs mt-3">
            Source: nitter.poast.org/TheFestiveOwl/rss
          </p>
        </div>
      </div>
    </div>
  )
}
