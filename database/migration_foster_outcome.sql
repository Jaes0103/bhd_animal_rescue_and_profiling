-- Migration: Add outcome tracking to foster_care table
-- Run this migration to add better foster outcome tracking

-- Add outcome column to track foster results
-- 'pending' - foster still active
-- 'returned' - animal returned to shelter (successful foster)
-- 'adopted_by_foster' - foster parent adopted (foster failure - good outcome!)
ALTER TABLE foster_care
ADD COLUMN IF NOT EXISTS outcome VARCHAR(30)
DEFAULT 'pending'
CHECK (outcome IN ('pending', 'returned', 'adopted_by_foster'));

-- Add additional tracking columns that were in the controller but missing from schema
ALTER TABLE foster_care
ADD COLUMN IF NOT EXISTS weight_before DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS weight_after DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS condition_before TEXT,
ADD COLUMN IF NOT EXISTS condition_after TEXT;

-- Update existing records to set outcome based on status
UPDATE foster_care
SET outcome = CASE
  WHEN status = 'active' THEN 'pending'
  WHEN status = 'returned' THEN 'returned'
  WHEN status = 'completed' THEN 'returned'
  ELSE 'pending'
END
WHERE outcome = 'pending';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Foster care table migration completed successfully!';
  RAISE NOTICE '📝 Added outcome tracking column and weight/condition fields';
END $$;
