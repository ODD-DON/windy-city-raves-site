-- Blog posts table for SEO content
CREATE TABLE IF NOT EXISTS wcr_blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('event-preview', 'event-recap', 'artist-spotlight', 'venue-guide', 'scene-news')),
  featured_image TEXT,
  
  -- SEO fields
  meta_title TEXT,
  meta_description TEXT,
  keywords TEXT[], -- Array of keywords for SEO
  
  -- Related content
  related_event_id TEXT, -- EDMTrain event ID if applicable
  related_artist TEXT,
  related_venue TEXT,
  
  -- Publishing
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled')),
  published_at TIMESTAMPTZ,
  scheduled_for TIMESTAMPTZ,
  
  -- AI generation tracking
  ai_generated BOOLEAN DEFAULT true,
  generation_prompt TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast slug lookups (SEO)
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON wcr_blog_posts(slug);

-- Index for category filtering
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON wcr_blog_posts(category);

-- Index for published posts ordered by date
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON wcr_blog_posts(status, published_at DESC) 
WHERE status = 'published';

-- Index for scheduled posts
CREATE INDEX IF NOT EXISTS idx_blog_posts_scheduled ON wcr_blog_posts(scheduled_for) 
WHERE status = 'scheduled';

-- Full text search index for content
CREATE INDEX IF NOT EXISTS idx_blog_posts_search ON wcr_blog_posts 
USING gin(to_tsvector('english', title || ' ' || content));

-- Enable RLS
ALTER TABLE wcr_blog_posts ENABLE ROW LEVEL SECURITY;

-- Public can read published posts
CREATE POLICY "Anyone can read published posts" ON wcr_blog_posts
  FOR SELECT USING (status = 'published');

-- Service role can do everything (for API/cron)
CREATE POLICY "Service role full access" ON wcr_blog_posts
  FOR ALL USING (auth.role() = 'service_role');

-- Blog generation log for tracking daily posts
CREATE TABLE IF NOT EXISTS wcr_blog_generation_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  posts_generated INTEGER DEFAULT 0,
  topics_used TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unique constraint on date to track daily generation
CREATE UNIQUE INDEX IF NOT EXISTS idx_blog_generation_log_date ON wcr_blog_generation_log(date);

-- Enable RLS
ALTER TABLE wcr_blog_generation_log ENABLE ROW LEVEL SECURITY;

-- Service role can manage generation log
CREATE POLICY "Service role full access to generation log" ON wcr_blog_generation_log
  FOR ALL USING (auth.role() = 'service_role');

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for auto-updating updated_at
DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON wcr_blog_posts;
CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON wcr_blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
