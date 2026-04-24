-- Custom events table for manually added events
-- These events will be merged with EDMTrain events and function identically

CREATE TABLE IF NOT EXISTS wcr_event_calendar_custom_events (
  id SERIAL PRIMARY KEY,
  -- Use negative IDs to avoid collision with EDMTrain event IDs
  event_id INTEGER UNIQUE NOT NULL DEFAULT (-(nextval('wcr_event_calendar_custom_events_id_seq')::int)),
  
  -- Event details (matches TransformedEvent structure)
  name TEXT NOT NULL,
  headliner TEXT NOT NULL,
  date DATE NOT NULL,
  start_time TEXT,
  end_time TEXT,
  ages TEXT,
  
  -- Venue info
  venue_id INTEGER NOT NULL,
  venue_name TEXT NOT NULL,
  venue_location TEXT DEFAULT 'Chicago, IL',
  venue_address TEXT,
  
  -- Artists (stored as JSON array)
  artists JSONB NOT NULL DEFAULT '[]',
  
  -- Event flags
  is_festival BOOLEAN DEFAULT FALSE,
  is_electronic BOOLEAN DEFAULT TRUE,
  
  -- Ticket info
  ticket_url TEXT,
  
  -- Image (optional - can use a default or uploaded image)
  image_url TEXT,
  
  -- Admin metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- Enable RLS
ALTER TABLE wcr_event_calendar_custom_events ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read custom events
CREATE POLICY "Allow read access" ON wcr_event_calendar_custom_events
  FOR SELECT USING (true);

-- Allow authenticated users to manage custom events (admin check happens in app)
CREATE POLICY "Allow authenticated insert" ON wcr_event_calendar_custom_events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated update" ON wcr_event_calendar_custom_events
  FOR UPDATE USING (true);

CREATE POLICY "Allow authenticated delete" ON wcr_event_calendar_custom_events
  FOR DELETE USING (true);

-- Index for date queries
CREATE INDEX IF NOT EXISTS idx_custom_events_date ON wcr_event_calendar_custom_events(date);
