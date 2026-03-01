-- Migration: Add area field and fix status values for animals table
-- Run this migration to separate area (physical location) from status (health/adoption status)

-- Add area column to track physical location within shelter/clinic
ALTER TABLE animals
ADD COLUMN IF NOT EXISTS area VARCHAR(30)
DEFAULT 'quarantine'
CHECK (area IN ('quarantine', 'under_observation', 'in_treatment', 'medical_hold', 'free_roaming', 'caged'));

-- Update the status column constraint to use correct values
ALTER TABLE animals
DROP CONSTRAINT IF EXISTS animals_status_check;

ALTER TABLE animals
ADD CONSTRAINT animals_status_check
CHECK (status IN ('healthy', 'stable', 'treatment', 'on_clinic', 'fostered', 'available_for_adoption', 'adopted', 'deceased'));

-- Migrate existing housing_status values to area for animals that have it set
UPDATE animals
SET area = CASE
  WHEN housing_status = 'free_roaming' THEN 'free_roaming'
  WHEN housing_status = 'caged' THEN 'caged'
  ELSE area
END
WHERE housing_status IS NOT NULL;

-- Migrate old status values to new status values
UPDATE animals
SET status = CASE
  WHEN status = 'dead' THEN 'deceased'
  WHEN status = 'quarantine' THEN 'healthy'
  WHEN status = 'under_observation' THEN 'stable'
  WHEN status = 'in_treatment' THEN 'treatment'
  WHEN status = 'medical_hold' THEN 'treatment'
  WHEN status = 'available' THEN 'available_for_adoption'
  WHEN status = 'pending_adoption' THEN 'available_for_adoption'
  ELSE status
END
WHERE status IN ('dead', 'quarantine', 'under_observation', 'in_treatment', 'medical_hold', 'available', 'pending_adoption');

-- Migrate old area-like statuses to the area field
UPDATE animals
SET area = CASE
  WHEN status IN ('quarantine', 'under_observation', 'in_treatment', 'medical_hold') THEN status
  ELSE area
END,
status = CASE
  WHEN status = 'quarantine' THEN 'healthy'
  WHEN status = 'under_observation' THEN 'stable'
  WHEN status = 'in_treatment' THEN 'treatment'
  WHEN status = 'medical_hold' THEN 'treatment'
  ELSE status
END
WHERE status IN ('quarantine', 'under_observation', 'in_treatment', 'medical_hold');

-- Create index for better query performance on area
CREATE INDEX IF NOT EXISTS idx_animals_area ON animals(area);

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Animals table migration completed successfully!';
  RAISE NOTICE '📝 Added area field and updated status values';
  RAISE NOTICE '🔄 Status: healthy, stable, treatment, on_clinic, fostered, available_for_adoption, adopted, deceased';
  RAISE NOTICE '🏢 Area: quarantine, under_observation, in_treatment, medical_hold, free_roaming, caged';
END $$;
