const pool = require('../config/db');

const getAllAnimals = async (req, res) => {
  try {
    const { status, species, search, limit = 50, offset = 0 } = req.query;

    let query = `
      SELECT a.*,
             json_agg(
               json_build_object('id', p.id, 'photo_url', p.photo_url, 'is_primary', p.is_primary)
               ORDER BY p.is_primary DESC, p.uploaded_at DESC
             ) FILTER (WHERE p.id IS NOT NULL) as photos
      FROM animals a
      LEFT JOIN animal_photos p ON a.id = p.animal_id
      WHERE 1=1
    `;

    const params = [];
    let paramIndex = 1;

    if (status) {
      query += ` AND a.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (species) {
      query += ` AND a.species = $${paramIndex}`;
      params.push(species);
      paramIndex++;
    }

    if (search) {
      query += ` AND (a.name ILIKE $${paramIndex} OR a.breed ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    query += ` GROUP BY a.id ORDER BY a.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get animals error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getAnimalById = async (req, res) => {
  try {
    const { id } = req.params;

    const animalResult = await pool.query(
      `SELECT a.*,
              json_agg(
                json_build_object('id', p.id, 'photo_url', p.photo_url, 'is_primary', p.is_primary, 'caption', p.caption)
                ORDER BY p.is_primary DESC, p.uploaded_at DESC
              ) FILTER (WHERE p.id IS NOT NULL) as photos
       FROM animals a
       LEFT JOIN animal_photos p ON a.id = p.animal_id
       WHERE a.id = $1
       GROUP BY a.id`,
      [id]
    );

    if (animalResult.rows.length === 0) {
      return res.status(404).json({ error: 'Animal not found' });
    }

    const medicalResult = await pool.query(
      'SELECT * FROM medical_records WHERE animal_id = $1 ORDER BY date DESC',
      [id]
    );

    const observationsResult = await pool.query(
      `SELECT o.*, u.full_name as observer_name, u.role as observer_role
       FROM animal_observations o
       LEFT JOIN users u ON o.observed_by = u.id
       WHERE o.animal_id = $1
       ORDER BY o.observation_date DESC, o.created_at DESC
       LIMIT 10`,
      [id]
    );

    res.json({
      ...animalResult.rows[0],
      medical_records: medicalResult.rows,
      observations: observationsResult.rows
    });
  } catch (error) {
    console.error('Get animal error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const createAnimal = async (req, res) => {
  try {
    const {
      name, species, breed, age_years, age_months, gender, color, weight, size,
      description, intake_date, intake_type, adoption_fee, spayed_neutered,
      vaccinated, microchipped, special_needs, behavior_notes, location
    } = req.body;

    const result = await pool.query(
      `INSERT INTO animals (
        name, species, breed, age_years, age_months, gender, color, weight, size,
        description, intake_date, intake_type, adoption_fee, spayed_neutered,
        vaccinated, microchipped, special_needs, behavior_notes, location, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
      RETURNING *`,
      [name, species, breed, age_years, age_months, gender, color, weight, size,
       description, intake_date, intake_type, adoption_fee, spayed_neutered,
       vaccinated, microchipped, special_needs, behavior_notes, location, req.user.id]
    );

    // Log activity
    await pool.query(
      'INSERT INTO activity_logs (user_id, action, entity_type, entity_id) VALUES ($1, $2, $3, $4)',
      [req.user.id, 'created_animal', 'animal', result.rows[0].id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create animal error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const updateAnimal = async (req, res) => {
  try {
    const { id } = req.params;
    const fields = req.body;

    // Get current animal data to track changes
    const currentAnimal = await pool.query('SELECT * FROM animals WHERE id = $1', [id]);
    if (currentAnimal.rows.length === 0) {
      return res.status(404).json({ error: 'Animal not found' });
    }

    const setClause = Object.keys(fields)
      .map((key, index) => `${key} = $${index + 1}`)
      .join(', ');

    const values = [...Object.values(fields), id];

    const result = await pool.query(
      `UPDATE animals SET ${setClause}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${values.length} RETURNING *`,
      values
    );

    // Build details of what changed
    const changedFields = [];
    const old = currentAnimal.rows[0];
    const updated = result.rows[0];

    Object.keys(fields).forEach(key => {
      if (old[key] !== updated[key]) {
        const fieldName = key.replace(/_/g, ' ');
        changedFields.push(`${fieldName}: "${old[key]}" → "${updated[key]}"`);
      }
    });

    const details = changedFields.length > 0
      ? `Updated ${updated.name}: ${changedFields.join(', ')}`
      : `Updated ${updated.name}`;

    // Log activity with details
    await pool.query(
      'INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, 'updated_animal', 'animal', id, details]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update animal error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const deleteAnimal = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM animals WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Animal not found' });
    }

    res.json({ message: 'Animal deleted successfully' });
  } catch (error) {
    console.error('Delete animal error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const addAnimalPhoto = async (req, res) => {
  try {
    const { animal_id, photo_url, is_primary, caption } = req.body;

    // If this is set as primary, unset other primary photos
    if (is_primary) {
      await pool.query(
        'UPDATE animal_photos SET is_primary = false WHERE animal_id = $1',
        [animal_id]
      );
    }

    const result = await pool.query(
      'INSERT INTO animal_photos (animal_id, photo_url, is_primary, caption) VALUES ($1, $2, $3, $4) RETURNING *',
      [animal_id, photo_url, is_primary, caption]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Add photo error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const updateAnimalStatus = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { status, area, notes } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const validStatuses = ['healthy', 'stable', 'treatment', 'on_clinic', 'fostered', 'available_for_adoption', 'dead'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const validAreas = ['quarantine', 'under_observation', 'in_treatment', 'medical_hold', 'free_roaming', 'caged'];
    if (area && !validAreas.includes(area)) {
      return res.status(400).json({ error: 'Invalid area' });
    }

    await client.query('BEGIN');

    let result;
    if (area) {
      result = await client.query(
        `UPDATE animals SET status = $1, area = $2, updated_at = CURRENT_TIMESTAMP
         WHERE id = $3 RETURNING *`,
        [status, area, id]
      );
    } else {
      result = await client.query(
        `UPDATE animals SET status = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2 RETURNING *`,
        [status, id]
      );
    }

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Animal not found' });
    }

    // Log activity
    const details = area
      ? `Changed status to ${status} and area to ${area}${notes ? ': ' + notes : ''}`
      : `Changed status to ${status}${notes ? ': ' + notes : ''}`;
    await client.query(
      'INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, 'update_animal_status', 'animal', id, details]
    );

    // If notes provided, add as observation
    if (notes) {
      const observationNote = area
        ? `Status changed to ${status}, area changed to ${area}. ${notes}`
        : `Status changed to ${status}. ${notes}`;
      await client.query(
        `INSERT INTO animal_observations (animal_id, observed_by, observation_type, notes)
         VALUES ($1, $2, $3, $4)`,
        [id, req.user.id, 'health', observationNote]
      );
    }

    await client.query('COMMIT');
    res.json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Update animal status error:', error);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
};

const getAnimalsNeedingAttention = async (req, res) => {
  try {
    const query = `
      SELECT a.*,
             json_agg(
               json_build_object('id', p.id, 'photo_url', p.photo_url, 'is_primary', p.is_primary)
               ORDER BY p.is_primary DESC, p.uploaded_at DESC
             ) FILTER (WHERE p.id IS NOT NULL) as photos,
             (SELECT COUNT(*) FROM animal_observations WHERE animal_id = a.id AND observation_date >= CURRENT_DATE - INTERVAL '7 days') as recent_observations_count,
             (SELECT MAX(observation_date) FROM animal_observations WHERE animal_id = a.id) as last_observation_date
      FROM animals a
      LEFT JOIN animal_photos p ON a.id = p.animal_id
      WHERE a.status NOT IN ('adopted', 'deceased')
      GROUP BY a.id
      ORDER BY a.intake_date DESC
    `;

    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Get animals needing attention error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getAllAnimals,
  getAnimalById,
  createAnimal,
  updateAnimal,
  deleteAnimal,
  addAnimalPhoto,
  updateAnimalStatus,
  getAnimalsNeedingAttention
};
