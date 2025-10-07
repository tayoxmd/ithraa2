-- Add pinned_to_homepage column to hotels table
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS pinned_to_homepage BOOLEAN DEFAULT FALSE;

-- Add index for faster queries on pinned hotels
CREATE INDEX IF NOT EXISTS idx_hotels_pinned ON hotels(pinned_to_homepage) WHERE pinned_to_homepage = TRUE;