const pool = require('./db');

const initDatabase = async () => {
  try {
    // Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'volunteer' CHECK (role IN ('admin', 'volunteer', 'public')),
        full_name VARCHAR(100),
        phone VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Animals table
    await pool.query(`
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
        status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'adopted', 'fostered', 'medical_hold', 'deceased')),
        adoption_fee DECIMAL(10,2),
        spayed_neutered BOOLEAN DEFAULT false,
        vaccinated BOOLEAN DEFAULT false,
        microchipped BOOLEAN DEFAULT false,
        special_needs TEXT,
        behavior_notes TEXT,
        location VARCHAR(100),
        location_id INTEGER,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Animal photos table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS animal_photos (
        id SERIAL PRIMARY KEY,
        animal_id INTEGER REFERENCES animals(id) ON DELETE CASCADE,
        photo_url TEXT NOT NULL,
        is_primary BOOLEAN DEFAULT false,
        caption TEXT,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Medical records table
    await pool.query(`
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
      )
    `);

    // Adoption applications table
    await pool.query(`
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
      )
    `);

    // Adoptions table
    await pool.query(`
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
      )
    `);

    // Foster care table
    await pool.query(`
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
      )
    `);

    // Donations table
    await pool.query(`
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
      )
    `);

    // Activity logs table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        action VARCHAR(100) NOT NULL,
        entity_type VARCHAR(50),
        entity_id INTEGER,
        details TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Locations table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS locations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        type VARCHAR(50) CHECK (type IN ('shelter', 'foster', 'clinic', 'other')),
        address TEXT,
        capacity INTEGER,
        current_occupancy INTEGER DEFAULT 0,
        contact_person VARCHAR(100),
        contact_phone VARCHAR(20),
        contact_email VARCHAR(100),
        notes TEXT,
        is_active BOOLEAN DEFAULT true,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add foreign key constraint for animals.location_id
    await pool.query(`
      DO $$ BEGIN
        ALTER TABLE animals ADD CONSTRAINT fk_animals_location
        FOREIGN KEY (location_id) REFERENCES locations(id);
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Animal observations table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS animal_observations (
        id SERIAL PRIMARY KEY,
        animal_id INTEGER REFERENCES animals(id) ON DELETE CASCADE,
        observation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        observation_type VARCHAR(50) CHECK (observation_type IN ('behavior', 'health', 'feeding', 'exercise', 'general', 'other')),
        description TEXT NOT NULL,
        severity VARCHAR(20) CHECK (severity IN ('normal', 'attention_needed', 'urgent')),
        observed_by INTEGER REFERENCES users(id),
        follow_up_required BOOLEAN DEFAULT false,
        follow_up_notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Location history table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS location_history (
        id SERIAL PRIMARY KEY,
        animal_id INTEGER REFERENCES animals(id) ON DELETE CASCADE,
        from_location_id INTEGER REFERENCES locations(id),
        to_location_id INTEGER REFERENCES locations(id),
        transfer_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        reason TEXT,
        transferred_by INTEGER REFERENCES users(id),
        notes TEXT
      )
    `);

    // Rescue Markers table - for marking stray animal locations
    await pool.query(`
      CREATE TABLE IF NOT EXISTS rescue_markers (
        id SERIAL PRIMARY KEY,
        latitude DECIMAL(10, 8) NOT NULL,
        longitude DECIMAL(11, 8) NOT NULL,
        animal_type VARCHAR(50),
        description TEXT,
        photo_url TEXT,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'rescued', 'cancelled')),
        priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
        marked_by INTEGER REFERENCES users(id),
        rescued_by INTEGER REFERENCES users(id),
        animal_id INTEGER REFERENCES animals(id),
        rescue_date TIMESTAMP,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Disease Zones table - for tracking rabies/distemper outbreak areas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS disease_zones (
        id SERIAL PRIMARY KEY,
        disease_type VARCHAR(20) NOT NULL CHECK (disease_type IN ('rabies', 'distemper', 'parvo', 'other')),
        latitude DECIMAL(10, 8) NOT NULL,
        longitude DECIMAL(11, 8) NOT NULL,
        radius_km DECIMAL(5, 2) NOT NULL DEFAULT 1.0,
        area_name VARCHAR(200),
        confirmed_cases INTEGER DEFAULT 1,
        description TEXT,
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'monitoring', 'contained', 'cleared')),
        severity VARCHAR(20) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
        marked_by INTEGER REFERENCES users(id),
        first_case_date DATE,
        last_case_date DATE,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Database tables created successfully!');

    // Create default admin user
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash('admin123', 10);

    await pool.query(`
      INSERT INTO users (username, email, password, role, full_name)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (username) DO NOTHING
    `, ['admin', 'admin@bantayhayop.ph', hashedPassword, 'admin', 'System Administrator']);

    console.log('✅ Default admin user created (username: admin, password: admin123)');
    console.log('⚠️  Please change the default password after first login!');

    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
};

initDatabase();
