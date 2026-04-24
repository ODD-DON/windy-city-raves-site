'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, Plus, Edit3, Trash2, Eye, Save, X, Search } from 'lucide-react'
import Image from 'next/image'
import { supabaseClient } from '@/lib/supabase/client'

interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  category: string
  tags: string[] | null
  keywords: string[] | null
  meta_title: string | null
  meta_description: string | null
  image_url: string | null
  image_credit: string | null
  status: string
  published_at: string | null
  created_at: string
}

const categories = [
  { value: 'scene-news', label: 'Scene News' },
  { value: 'artist-spotlight', label: 'Artist Spotlight' },
  { value: 'event-preview', label: 'Event Preview' },
  { value: 'event-recap', label: 'Event Recap' },
  { value: 'venue-guide', label: 'Venue Guide' },
  { value: 'festival-news', label: 'Festival News' },
  { value: 'industry-news', label: 'Industry News' },
]

export default function BlogAdminPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  // Editor state
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: 'scene-news',
    tags: '',
    image_url: '',
    image_credit: '',
    meta_title: '',
    meta_description: '',
  })

  const supabase = supabaseClient

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('wcr_blog_posts')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setPosts(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch posts')
    } finally {
      setLoading(false)
    }
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 60) + '-' + Date.now().toString(36)
  }

  const startCreating = () => {
    setIsCreating(true)
    setEditingPost(null)
    setFormData({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      category: 'scene-news',
      tags: '',
      image_url: '',
      image_credit: '',
      meta_title: '',
      meta_description: '',
    })
  }

  const startEditing = (post: BlogPost) => {
    setEditingPost(post)
    setIsCreating(false)
    setFormData({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      category: post.category,
      tags: post.tags?.join(', ') || '',
      image_url: post.image_url || '',
      image_credit: post.image_credit || '',
      meta_title: post.meta_title || '',
      meta_description: post.meta_description || '',
    })
  }

  const cancelEditing = () => {
    setEditingPost(null)
    setIsCreating(false)
    setError(null)
  }

  const handleSave = async () => {
    if (!formData.title.trim()) {
      setError('Title is required')
      return
    }
    
    setSaving(true)
    setError(null)
    
    try {
      const slug = formData.slug || generateSlug(formData.title)
      const tags = formData.tags.split(',').map(t => t.trim()).filter(Boolean)
      
      const postData = {
        title: formData.title,
        slug,
        excerpt: formData.excerpt,
        content: formData.content,
        category: formData.category,
        tags,
        image_url: formData.image_url || null,
        image_credit: formData.image_credit || null,
        meta_title: formData.meta_title || formData.title,
        meta_description: formData.meta_description || formData.excerpt,
        keywords: tags,
        status: 'published',
        published_at: new Date().toISOString(),
      }
      
      if (editingPost) {
        // Update existing post
        const { error } = await supabase
          .from('wcr_blog_posts')
          .update(postData)
          .eq('id', editingPost.id)
        
        if (error) throw error
        setSuccess('Post updated successfully')
      } else {
        // Create new post
        const { error } = await supabase
          .from('wcr_blog_posts')
          .insert(postData)
        
        if (error) throw error
        setSuccess('Post created successfully')
      }
      
      await fetchPosts()
      cancelEditing()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save post')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (post: BlogPost) => {
    if (!confirm(`Delete "${post.title}"? This cannot be undone.`)) return
    
    setDeleting(post.id)
    setError(null)
    
    try {
      const { error } = await supabase
        .from('wcr_blog_posts')
        .delete()
        .eq('id', post.id)
      
      if (error) throw error
      setSuccess('Post deleted')
      await fetchPosts()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete post')
    } finally {
      setDeleting(null)
    }
  }

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Editor View
  if (isCreating || editingPost) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {editingPost ? 'Edit Post' : 'Create New Post'}
          </h1>
          <Button variant="outline" onClick={cancelEditing}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 text-xl font-semibold"
              placeholder="Your post title"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Slug (leave blank to auto-generate)
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-gray-900 font-mono text-sm"
              placeholder="your-post-slug"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-gray-900"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Excerpt</label>
            <textarea
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-gray-900"
              placeholder="A short summary for previews and social sharing"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Content (HTML)</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={15}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-gray-900 font-mono text-sm"
              placeholder="<p>Your content here...</p>"
            />
            <p className="mt-1 text-xs text-gray-500">
              Use HTML tags: &lt;p&gt; for paragraphs, &lt;h2&gt; for headings, &lt;strong&gt; for bold, &lt;em&gt; for italic
            </p>
          </div>

          {/* Image */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
              <input
                type="text"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-gray-900"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Image Credit</label>
              <input
                type="text"
                value={formData.image_credit}
                onChange={(e) => setFormData({ ...formData, image_credit: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-gray-900"
                placeholder="Unsplash"
              />
            </div>
          </div>

          {/* Preview image */}
          {formData.image_url && (
            <div className="relative h-48 bg-gray-100 rounded-lg overflow-hidden">
              <Image
                src={formData.image_url}
                alt="Preview"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          )}

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma-separated)</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-gray-900"
              placeholder="techno, chicago, house"
            />
          </div>

          {/* SEO */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="font-medium text-gray-900 mb-4">SEO (optional)</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Meta Title</label>
                <input
                  type="text"
                  value={formData.meta_title}
                  onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-gray-900"
                  placeholder="Leave blank to use post title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Meta Description</label>
                <textarea
                  value={formData.meta_description}
                  onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-gray-900"
                  placeholder="Leave blank to use excerpt"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={cancelEditing}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={saving}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {editingPost ? 'Update Post' : 'Publish Post'}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // List View
  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog Posts</h1>
          <p className="text-gray-600">Manage your blog content</p>
        </div>
        <Button onClick={startCreating} className="bg-red-600 hover:bg-red-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          New Post
        </Button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-green-700">{success}</p>
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900"
            placeholder="Search posts..."
          />
        </div>
      </div>

      {/* Posts List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <p className="text-gray-500 mb-4">No posts found</p>
          <Button onClick={startCreating} variant="outline">
            Create your first post
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map(post => (
            <div 
              key={post.id} 
              className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4 hover:border-gray-300 transition-colors"
            >
              {/* Thumbnail */}
              {post.image_url && (
                <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                  <Image
                    src={post.image_url}
                    alt={post.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              )}
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-red-600 uppercase bg-red-50 px-2 py-0.5 rounded">
                    {post.category}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded ${post.status === 'published' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {post.status}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 truncate">{post.title}</h3>
                <p className="text-sm text-gray-500 truncate">{post.excerpt}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(post.created_at).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </p>
              </div>
              
              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <a
                  href={`/blog/${post.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="View"
                >
                  <Eye className="w-5 h-5" />
                </a>
                <button
                  onClick={() => startEditing(post)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit"
                >
                  <Edit3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(post)}
                  disabled={deleting === post.id}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  title="Delete"
                >
                  {deleting === post.id ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Trash2 className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
