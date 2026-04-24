-- Create table for venue link overrides
CREATE TABLE IF NOT EXISTS wcr_event_calendar_venue_overrides (
  id SERIAL PRIMARY KEY,
  venue_id INTEGER NOT NULL UNIQUE,
  venue_name TEXT NOT NULL,
  custom_url TEXT,
  uses_google BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_venue_overrides_venue_id ON wcr_event_calendar_venue_overrides(venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_overrides_venue_name ON wcr_event_calendar_venue_overrides(venue_name);

-- Comment on table
COMMENT ON TABLE wcr_event_calendar_venue_overrides IS 'Stores custom ticket URL overrides for venues in the WCR event calendar';
