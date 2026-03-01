const pool = require('./db');
const bcrypt = require('bcrypt');

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Check if admin user already exists
    const adminCheck = await pool.query(
      'SELECT id FROM users WHERE username = $1',
      ['admin']
    );

    if (adminCheck.rows.length > 0) {
      console.log('✅ Admin user already exists. Skipping seed.');
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await pool.query(
      `INSERT INTO users (username, email, password, role, full_name)
       VALUES ($1, $2, $3, $4, $5)`,
      ['admin', 'admin@bantayhayop.ph', hashedPassword, 'admin', 'System Administrator']
    );

    console.log('✅ Default admin user created');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    console.log('   ⚠️  Please change this password after first login!');

    // Create staff user
    const staffPassword = await bcrypt.hash('staff123', 10);
    await pool.query(
      `INSERT INTO users (username, email, password, role, full_name, phone)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      ['staff1', 'staff@bantayhayop.ph', staffPassword, 'staff', 'Maria Santos', '09171234567']
    );

    // Create driver user
    const driverPassword = await bcrypt.hash('driver123', 10);
    await pool.query(
      `INSERT INTO users (username, email, password, role, full_name, phone)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      ['driver1', 'driver@bantayhayop.ph', driverPassword, 'driver', 'Juan dela Cruz', '09181234567']
    );

    // Create volunteer user
    const volunteerPassword = await bcrypt.hash('volunteer123', 10);
    await pool.query(
      `INSERT INTO users (username, email, password, role, full_name, phone)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      ['volunteer1', 'volunteer@bantayhayop.ph', volunteerPassword, 'volunteer', 'Pedro Reyes', '09191234567']
    );

    console.log('✅ Sample users created (staff, driver, volunteer)');

    // Seed locations
    const locationsCheck = await pool.query('SELECT COUNT(*) as count FROM locations');
    if (parseInt(locationsCheck.rows[0].count) === 0) {
      console.log('📍 Seeding locations...');

      const locations = [
        {
          name: 'Shrine Pet Care Center',
          type: 'clinic',
          address: 'Shrine Hills, Matina',
          city: 'Davao City',
          contact_person: 'Dr. Maria Santos',
          contact_phone: '082-123-4567',
          contact_email: 'shrine@petcare.ph',
          capacity: 20,
          notes: 'Primary veterinary clinic for medical procedures and treatments'
        },
        {
          name: 'Malagamot Shelter',
          type: 'shelter',
          address: 'Malagamot Road, Panacan',
          city: 'Davao City',
          contact_person: 'Juan dela Cruz',
          contact_phone: '09171234567',
          contact_email: 'malagamot@bantayhayop.ph',
          capacity: 50,
          notes: 'Main shelter facility for rescued animals'
        },
        {
          name: 'Catalunan Shelter',
          type: 'shelter',
          address: 'Catalunan Grande',
          city: 'Davao City',
          contact_person: 'Ana Reyes',
          contact_phone: '09181234567',
          contact_email: 'catalunan@bantayhayop.ph',
          capacity: 40,
          notes: 'Secondary shelter for overflow and long-term care'
        },
        {
          name: 'Davao Animal Clinic',
          type: 'clinic',
          address: 'J.P. Laurel Avenue',
          city: 'Davao City',
          contact_person: 'Dr. Pedro Garcia',
          contact_phone: '082-234-5678',
          contact_email: 'davao@animalclinic.ph',
          capacity: 15,
          notes: 'Partner clinic for routine checkups and vaccinations'
        },
        {
          name: 'Temporary Foster Network',
          type: 'foster_home',
          address: 'Various locations',
          city: 'Davao City',
          contact_person: 'Maria Santos',
          contact_phone: '09191234567',
          contact_email: 'foster@bantayhayop.ph',
          capacity: 30,
          notes: 'Network of approved foster homes throughout Davao City'
        }
      ];

      for (const loc of locations) {
        await pool.query(
          `INSERT INTO locations (name, type, address, city, contact_person, contact_phone,
           contact_email, capacity, notes)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [loc.name, loc.type, loc.address, loc.city, loc.contact_person, loc.contact_phone,
           loc.contact_email, loc.capacity, loc.notes]
        );
      }

      console.log('✅ Locations seeded');
    }

    // Seed sample animals
    const animalsCheck = await pool.query('SELECT COUNT(*) as count FROM animals');
    if (parseInt(animalsCheck.rows[0].count) === 0) {
      console.log('🐾 Seeding sample animals...');

      // Sample animals data
      const animals = [
        {
          name: 'Brownie',
          species: 'dog',
          breed: 'Aspin (Asong Pinoy)',
          age_years: 2,
          age_months: 6,
          gender: 'male',
          color: 'Brown',
          size: 'medium',
          description: 'Friendly and energetic dog. Great with kids and other pets. Loves to play fetch!',
          intake_date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
          intake_type: 'rescue',
          status: 'available',
          housing_status: 'free_roaming',
          adoption_fee: 500.00,
          spayed_neutered: true,
          vaccinated: true,
          location: 'Malagamot Shelter',
          location_id: 2,
          photo: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=500'
        },
        {
          name: 'Whiskers',
          species: 'cat',
          breed: 'Puspin (Pusang Pinoy)',
          age_years: 1,
          age_months: 3,
          gender: 'female',
          color: 'Orange Tabby',
          size: 'small',
          description: 'Sweet and affectionate cat. Loves cuddles and quiet environments.',
          intake_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          intake_type: 'surrender',
          status: 'available',
          housing_status: 'caged',
          adoption_fee: 300.00,
          spayed_neutered: true,
          vaccinated: true,
          location: 'Catalunan Shelter',
          location_id: 3,
          photo: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=500'
        },
        {
          name: 'Max',
          species: 'dog',
          breed: 'Aspin Mix',
          age_years: 4,
          age_months: 0,
          gender: 'male',
          color: 'Black and White',
          size: 'large',
          description: 'Calm and gentle giant. Perfect for families with space. Well-trained and obedient.',
          intake_date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
          intake_type: 'stray',
          status: 'fostered',
          housing_status: 'free_roaming',
          adoption_fee: 800.00,
          spayed_neutered: true,
          vaccinated: true,
          location: 'Temporary Foster Network',
          location_id: 5,
          photo: 'https://images.unsplash.com/photo-1568572933382-74d440642117?w=500'
        }
      ];

      for (const animal of animals) {
        const animalResult = await pool.query(
          `INSERT INTO animals (name, species, breed, age_years, age_months, gender, color, size,
           description, intake_date, intake_type, status, housing_status, adoption_fee, spayed_neutered,
           vaccinated, location, location_id, created_by)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
           RETURNING id`,
          [
            animal.name, animal.species, animal.breed, animal.age_years, animal.age_months,
            animal.gender, animal.color, animal.size, animal.description, animal.intake_date,
            animal.intake_type, animal.status, animal.housing_status || 'caged', animal.adoption_fee, animal.spayed_neutered,
            animal.vaccinated, animal.location, animal.location_id || 2, 1
          ]
        );

        // Add photo
        await pool.query(
          'INSERT INTO animal_photos (animal_id, photo_url, is_primary) VALUES ($1, $2, $3)',
          [animalResult.rows[0].id, animal.photo, true]
        );
      }

      console.log('✅ Sample animals seeded');

      // Seed sample medical records
      await pool.query(
        `INSERT INTO medical_records (animal_id, record_type, date, veterinarian, clinic, diagnosis, treatment, created_by)
         VALUES
         (1, 'vaccination', $1, 'Dr. Maria Santos', 'Davao Animal Clinic', 'Routine vaccination', '5-in-1 vaccine administered', 1),
         (2, 'checkup', $2, 'Dr. Juan Cruz', 'Davao Animal Clinic', 'General health check', 'Healthy, no issues found', 1),
         (3, 'surgery', $3, 'Dr. Maria Santos', 'Davao Animal Clinic', 'Neutering', 'Surgery successful, recovery normal', 1)`,
        [
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
          new Date(Date.now() - 45 * 24 * 60 * 60 * 1000)
        ]
      );

      // Seed foster record
      await pool.query(
        `INSERT INTO foster_care (animal_id, foster_parent_name, foster_parent_email, foster_parent_phone, start_date, status, notes, assigned_by)
         VALUES (3, 'Juan dela Cruz', 'juan@example.com', '09171234567', $1, 'active', 'Temporary foster until permanent adoption', 1)`,
        [new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)]
      );

      // Seed donations
      await pool.query(
        `INSERT INTO donations (donor_name, donor_email, donor_phone, donation_type, amount, donation_date, payment_method, receipt_issued, recorded_by)
         VALUES
         ('Maria Garcia', 'maria@example.com', '09187654321', 'cash', 5000.00, $1, 'Bank Transfer', true, 1),
         ('Pedro Reyes', 'pedro@example.com', '09191234567', 'supplies', NULL, $2, NULL, true, 1)`,
        [
          new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
        ]
      );

      // Seed observations
      await pool.query(
        `INSERT INTO animal_observations (animal_id, observation_date, observed_by, observation_type, notes)
         VALUES
         (1, $1, 2, 'behavior', 'Very friendly with visitors today. Played well with other dogs.'),
         (1, $2, 2, 'health', 'Eating well, no signs of illness. Energy levels normal.'),
         (2, $3, 2, 'health', 'Checked for fleas - all clear. Coat looking healthy.'),
         (3, $4, 2, 'socialization', 'Introduced to new foster family. Adapting well.')`,
        [
          new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        ]
      );

      console.log('✅ Sample data seeded successfully');
    }

    // Log activity
    await pool.query(
      'INSERT INTO activity_logs (user_id, action, details) VALUES ($1, $2, $3)',
      [1, 'database_seeded', 'Database seeded with initial data']
    );

    console.log('🎉 Database seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
};

module.exports = seedDatabase;
