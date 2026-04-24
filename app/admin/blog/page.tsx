'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, Sparkles, RefreshCw } from 'lucide-react'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  category: string
  published_at: string
}

interface GenerationStatus {
  date: string
  posts_generated: number
  topics_used: string[]
  remaining: number
}

export default function BlogAdminPage() {
  const [generating, setGenerating] = useState(false)
  const [status, setStatus] = useState<GenerationStatus | null>(null)
  const [lastPost, setLastPost] = useState<BlogPost | null>(null)
  const [error, setError] = useState<string | null>(null)

  const checkStatus = async () => {
    try {
      const res = await fetch('/api/generate-blog')
      const data = await res.json()
      setStatus(data)
    } catch (err) {
      console.error('Failed to check status:', err)
    }
  }

  const generatePost = async () => {
    setGenerating(true)
    setError(null)
    
    try {
      const res = await fetch('/api/generate-blog?test=true', {
        method: 'POST',
      })
      
      const data = await res.json()
      
      if (data.error) {
        setError(data.error + (data.details ? `: ${data.details}` : ''))
      } else if (data.post) {
        setLastPost(data.post)
        await checkStatus()
      } else if (data.message) {
        setError(data.message)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Blog Content Generator</h1>
        <p className="text-gray-600">Generate AI-powered blog posts about Chicago EDM scene</p>
      </div>

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
              <p className="text-sm text-gray-600">Remaining Today</p>
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

      {/* Generate Button */}
      <div className="bg-gradient-to-r from-red-50 to-cyan-50 border border-gray-200 rounded-xl p-6 mb-6">
        <div className="text-center">
          <h2 className="font-semibold text-gray-900 mb-2">Generate New Post</h2>
          <p className="text-gray-600 text-sm mb-4">
            AI will create an SEO-optimized blog post about Chicago EDM events, venues, or artists
          </p>
          <Button 
            onClick={generatePost} 
            disabled={generating}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Blog Post
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <p className="text-red-700 font-medium">Error</p>
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Last Generated Post */}
      {lastPost && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Last Generated Post</h2>
          <div className="space-y-3">
            <div>
              <span className="text-xs font-medium text-red-600 uppercase bg-red-50 px-2 py-1 rounded">
                {lastPost.category}
              </span>
            </div>
            <h3 className="text-xl font-bold text-gray-900">{lastPost.title}</h3>
            <p className="text-gray-600">{lastPost.excerpt}</p>
            <div className="pt-4 border-t border-gray-100">
              <a 
                href={`/blog/${lastPost.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-600 hover:text-red-700 font-medium text-sm"
              >
                View Post →
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
