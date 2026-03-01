-- Migration: Add 3-phase tracking to foster care system
-- Phase 1: BEFORE (Baseline), Phase 2: DURING (Updates), Phase 3: AFTER (Exit Assessment)

-- Add baseline assessment columns (BEFORE FOSTER)
ALTER TABLE foster_care
ADD COLUMN IF NOT EXISTS baseline_weight DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS baseline_body_condition INTEGER CHECK (baseline_body_condition BETWEEN 1 AND 9),
ADD COLUMN IF NOT EXISTS baseline_coat_condition VARCHAR(20) CHECK (baseline_coat_condition IN ('poor', 'fair', 'good', 'excellent')),
ADD COLUMN IF NOT EXISTS baseline_health_notes TEXT,
ADD COLUMN IF NOT EXISTS baseline_socialization VARCHAR(30) CHECK (baseline_socialization IN ('fearful', 'shy', 'neutral', 'friendly', 'very_friendly')),
ADD COLUMN IF NOT EXISTS baseline_behavior_notes TEXT,
ADD COLUMN IF NOT EXISTS baseline_with_people VARCHAR(30) CHECK (baseline_with_people IN ('fearful', 'anxious', 'calm', 'excited')),
ADD COLUMN IF NOT EXISTS baseline_with_animals VARCHAR(30),
ADD COLUMN IF NOT EXISTS baseline_food_aggression BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS baseline_medical_status JSONB DEFAULT '{}';

-- Add exit assessment columns (AFTER FOSTER)
ALTER TABLE foster_care
ADD COLUMN IF NOT EXISTS exit_weight DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS exit_body_condition INTEGER CHECK (exit_body_condition BETWEEN 1 AND 9),
ADD COLUMN IF NOT EXISTS exit_coat_condition VARCHAR(20) CHECK (exit_coat_condition IN ('poor', 'fair', 'good', 'excellent')),
ADD COLUMN IF NOT EXISTS exit_health_notes TEXT,
ADD COLUMN IF NOT EXISTS exit_socialization VARCHAR(30) CHECK (exit_socialization IN ('fearful', 'shy', 'neutral', 'friendly', 'very_friendly')),
ADD COLUMN IF NOT EXISTS exit_behavior_notes TEXT,
ADD COLUMN IF NOT EXISTS exit_skills_learned TEXT,
ADD COLUMN IF NOT EXISTS exit_remaining_issues TEXT,
ADD COLUMN IF NOT EXISTS exit_ideal_home TEXT,
ADD COLUMN IF NOT EXISTS exit_adoption_ready BOOLEAN,
ADD COLUMN IF NOT EXISTS exit_foster_parent_rating INTEGER CHECK (exit_foster_parent_rating BETWEEN 1 AND 5),
ADD COLUMN IF NOT EXISTS exit_foster_parent_feedback TEXT,
ADD COLUMN IF NOT EXISTS exit_recommendations TEXT,
ADD COLUMN IF NOT EXISTS exit_would_foster_again BOOLEAN,
ADD COLUMN IF NOT EXISTS early_return_reason TEXT;

-- Create foster_updates table for DURING FOSTER tracking
CREATE TABLE IF NOT EXISTS foster_updates (
  id SERIAL PRIMARY KEY,
  foster_care_id INTEGER REFERENCES foster_care(id) ON DELETE CASCADE,
  update_date DATE NOT NULL DEFAULT CURRENT_DATE,
  week_number INTEGER,

  -- Physical updates
  current_weight DECIMAL(5,2),
  body_condition_notes TEXT,
  health_observations TEXT,
  vet_visits TEXT,

  -- Behavioral progress
  socialization_progress TEXT,
  behaviors_learned TEXT,
  problem_behaviors TEXT,
  interaction_with_family TEXT,
  interaction_with_pets TEXT,
  training_progress TEXT,

  -- Daily living
  eating_habits TEXT,
  house_training_status VARCHAR(30) CHECK (house_training_status IN ('not_started', 'in_progress', 'mostly_trained', 'fully_trained')),
  sleep_patterns TEXT,
  energy_level VARCHAR(20) CHECK (energy_level IN ('low', 'moderate', 'high', 'very_high')),
  play_preferences TEXT,

  -- Foster parent input
  concerns TEXT,
  positive_observations TEXT,
  support_needed TEXT,
  photos JSONB DEFAULT '[]',

  recorded_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_foster_updates_foster_care_id ON foster_updates(foster_care_id);
CREATE INDEX IF NOT EXISTS idx_foster_updates_update_date ON foster_updates(update_date);

-- Update existing outcome values if needed
UPDATE foster_care
SET outcome = 'returned'
WHERE outcome IS NULL AND status = 'returned';

UPDATE foster_care
SET outcome = 'adopted_by_foster'
WHERE outcome IS NULL AND status = 'completed' AND reason_for_return IS NULL;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Foster care 3-phase tracking migration completed successfully!';
  RAISE NOTICE '📝 Added baseline assessment fields (BEFORE)';
  RAISE NOTICE '📝 Created foster_updates table (DURING)';
  RAISE NOTICE '📝 Added exit assessment fields (AFTER)';
  RAISE NOTICE '';
  RAISE NOTICE '🐾 Foster Care Phases:';
  RAISE NOTICE '   1. BEFORE: Baseline assessment when animal enters foster';
  RAISE NOTICE '   2. DURING: Regular progress updates via foster_updates table';
  RAISE NOTICE '   3. AFTER: Exit assessment when foster ends';
END $$;
