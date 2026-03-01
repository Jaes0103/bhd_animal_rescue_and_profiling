-- Bantay Hayop Davao Database Initialization Script
-- This script runs automatically when the PostgreSQL container starts for the first time
-- It only creates tables and indexes. Data seeding is handled by the backend.

-- Create tables
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'volunteer' CHECK (role IN ('admin', 'staff', 'driver', 'volunteer', 'public')),
  full_name VARCHAR(100),
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS locations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(30) NOT NULL CHECK (type IN ('shelter', 'clinic', 'foster_home', 'other')),
  address TEXT,
  city VARCHAR(50) DEFAULT 'Davao City',
  contact_person VARCHAR(100),
  contact_phone VARCHAR(20),
  contact_email VARCHAR(100),
  capacity INTEGER,
  current_occupancy INTEGER DEFAULT 0,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS animals (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  species VARCHAR(50) NOT NULL CHECK (species IN ('dog', 'cat', 'other')),
  breed VARCHAR(100),
  age_years INTEGER,
  age_months INTEGER,
  gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'unknown')),
  color VARCHAR(50),
  weight DECIMAL(5,2),
  size VARCHAR(20) CHECK (size IN ('small', 'medium', 'large', 'extra_large')),
  description TEXT,
  intake_date DATE NOT NULL,
  intake_type VARCHAR(50) CHECK (intake_type IN ('rescue', 'surrender', 'stray', 'transfer')),
  status VARCHAR(30) DEFAULT 'healthy' CHECK (status IN ('healthy', 'stable', 'treatment', 'on_clinic', 'fostered', 'available_for_adoption', 'adopted', 'deceased')),
  area VARCHAR(30) DEFAULT 'quarantine' CHECK (area IN ('quarantine', 'under_observation', 'in_treatment', 'medical_hold', 'free_roaming', 'caged')),
  housing_status VARCHAR(20) DEFAULT 'caged' CHECK (housing_status IN ('free_roaming', 'caged')),
  adoption_fee DECIMAL(10,2),
  spayed_neutered BOOLEAN DEFAULT false,
  vaccinated BOOLEAN DEFAULT false,
  microchipped BOOLEAN DEFAULT false,
  special_needs TEXT,
  behavior_notes TEXT,
  location VARCHAR(100),
  location_id INTEGER REFERENCES locations(id),
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS animal_photos (
  id SERIAL PRIMARY KEY,
  animal_id INTEGER REFERENCES animals(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  caption TEXT,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS medical_records (
  id SERIAL PRIMARY KEY,
  animal_id INTEGER REFERENCES animals(id) ON DELETE CASCADE,
  record_type VARCHAR(50) CHECK (record_type IN ('vaccination', 'checkup', 'surgery', 'treatment', 'medication', 'other')),
  date DATE NOT NULL,
  veterinarian VARCHAR(100),
  clinic VARCHAR(100),
  diagnosis TEXT,
  treatment TEXT,
  medication TEXT,
  notes TEXT,
  cost DECIMAL(10,2),
  next_appointment DATE,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS adoption_applications (
  id SERIAL PRIMARY KEY,
  animal_id INTEGER REFERENCES animals(id) ON DELETE CASCADE,
  applicant_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  address TEXT NOT NULL,
  occupation VARCHAR(100),
  household_members INTEGER,
  has_children BOOLEAN,
  has_pets BOOLEAN,
  pet_details TEXT,
  housing_type VARCHAR(50) CHECK (housing_type IN ('house', 'apartment', 'condo', 'other')),
  housing_owned BOOLEAN,
  landlord_approval BOOLEAN,
  yard_fenced BOOLEAN,
  previous_pets TEXT,
  veterinarian_reference VARCHAR(200),
  reason_for_adoption TEXT,
  application_status VARCHAR(20) DEFAULT 'pending' CHECK (application_status IN ('pending', 'approved', 'rejected', 'withdrawn')),
  reviewed_by INTEGER REFERENCES users(id),
  review_notes TEXT,
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS adoptions (
  id SERIAL PRIMARY KEY,
  animal_id INTEGER REFERENCES animals(id) ON DELETE CASCADE,
  application_id INTEGER REFERENCES adoption_applications(id),
  adopter_name VARCHAR(100) NOT NULL,
  adopter_email VARCHAR(100) NOT NULL,
  adopter_phone VARCHAR(20) NOT NULL,
  adopter_address TEXT NOT NULL,
  adoption_date DATE NOT NULL,
  adoption_fee DECIMAL(10,2),
  contract_signed BOOLEAN DEFAULT false,
  follow_up_date DATE,
  notes TEXT,
  processed_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS foster_care (
  id SERIAL PRIMARY KEY,
  animal_id INTEGER REFERENCES animals(id) ON DELETE CASCADE,
  foster_parent_name VARCHAR(100) NOT NULL,
  foster_parent_email VARCHAR(100),
  foster_parent_phone VARCHAR(20) NOT NULL,
  foster_parent_address TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'returned')),
  reason_for_return TEXT,
  notes TEXT,
  assigned_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS donations (
  id SERIAL PRIMARY KEY,
  donor_name VARCHAR(100) NOT NULL,
  donor_email VARCHAR(100),
  donor_phone VARCHAR(20),
  donation_type VARCHAR(20) CHECK (donation_type IN ('cash', 'supplies', 'services', 'other')),
  amount DECIMAL(10,2),
  items_description TEXT,
  donation_date DATE NOT NULL,
  payment_method VARCHAR(50),
  receipt_issued BOOLEAN DEFAULT false,
  notes TEXT,
  recorded_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS animal_observations (
  id SERIAL PRIMARY KEY,
  animal_id INTEGER REFERENCES animals(id) ON DELETE CASCADE,
  observation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  observed_by INTEGER REFERENCES users(id),
  observation_type VARCHAR(30) CHECK (observation_type IN ('behavior', 'health', 'feeding', 'exercise', 'socialization', 'other')),
  notes TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS location_history (
  id SERIAL PRIMARY KEY,
  animal_id INTEGER REFERENCES animals(id) ON DELETE CASCADE,
  from_location_id INTEGER REFERENCES locations(id),
  to_location_id INTEGER REFERENCES locations(id),
  transfer_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reason VARCHAR(100),
  notes TEXT,
  transferred_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS activity_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id INTEGER,
  details TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_animals_species ON animals(species);
CREATE INDEX IF NOT EXISTS idx_animals_status ON animals(status);
CREATE INDEX IF NOT EXISTS idx_animals_area ON animals(area);
CREATE INDEX IF NOT EXISTS idx_animal_photos_animal_id ON animal_photos(animal_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_animal_id ON medical_records(animal_id);
CREATE INDEX IF NOT EXISTS idx_adoption_applications_animal_id ON adoption_applications(animal_id);
CREATE INDEX IF NOT EXISTS idx_adoption_applications_status ON adoption_applications(application_status);
CREATE INDEX IF NOT EXISTS idx_adoptions_animal_id ON adoptions(animal_id);
CREATE INDEX IF NOT EXISTS idx_foster_care_animal_id ON foster_care(animal_id);
CREATE INDEX IF NOT EXISTS idx_foster_care_status ON foster_care(status);
CREATE INDEX IF NOT EXISTS idx_animal_observations_animal_id ON animal_observations(animal_id);
CREATE INDEX IF NOT EXISTS idx_animal_observations_date ON animal_observations(observation_date);
CREATE INDEX IF NOT EXISTS idx_location_history_animal_id ON location_history(animal_id);
CREATE INDEX IF NOT EXISTS idx_location_history_to_location ON location_history(to_location_id);
CREATE INDEX IF NOT EXISTS idx_animals_location_id ON animals(location_id);
CREATE INDEX IF NOT EXISTS idx_locations_type ON locations(type);
CREATE INDEX IF NOT EXISTS idx_locations_is_active ON locations(is_active);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Bantay Hayop Davao database tables created successfully!';
  RAISE NOTICE '📦 Data seeding will be handled by the backend application on startup.';
END $$;
