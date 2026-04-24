-- Add image_url, image_credit, and tags fields to blog posts table
ALTER TABLE wcr_blog_posts 
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS image_credit TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT[];

-- Create index for tags search
CREATE INDEX IF NOT EXISTS idx_blog_posts_tags ON wcr_blog_posts USING gin(tags);

-- Update the category constraint to include more types
ALTER TABLE wcr_blog_posts 
DROP CONSTRAINT IF EXISTS wcr_blog_posts_category_check;

ALTER TABLE wcr_blog_posts 
ADD CONSTRAINT wcr_blog_posts_category_check 
CHECK (category IN ('event-preview', 'event-recap', 'artist-spotlight', 'venue-guide', 'scene-news', 'industry-news', 'festival-news'));
