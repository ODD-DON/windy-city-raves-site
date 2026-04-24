-- Create the admin overrides table for featured events
-- This only stores admin metadata, NOT event data (EDMTrain is the source of truth)

CREATE TABLE IF NOT EXISTS wcr_event_calendar_event_admin_overrides (
  id SERIAL PRIMARY KEY,
  edmtrain_event_id INTEGER NOT NULL UNIQUE,
  featured BOOLEAN DEFAULT FALSE,
  featured_style TEXT,
  featured_rank INTEGER,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_wcr_event_calendar_overrides_event_id 
ON wcr_event_calendar_event_admin_overrides(edmtrain_event_id);

CREATE INDEX IF NOT EXISTS idx_wcr_event_calendar_overrides_featured 
ON wcr_event_calendar_event_admin_overrides(featured) 
WHERE featured = TRUE;

-- Add trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_wcr_event_calendar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_wcr_event_calendar_updated_at ON wcr_event_calendar_event_admin_overrides;

CREATE TRIGGER trigger_wcr_event_calendar_updated_at
BEFORE UPDATE ON wcr_event_calendar_event_admin_overrides
FOR EACH ROW
EXECUTE FUNCTION update_wcr_event_calendar_updated_at();
