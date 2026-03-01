const pool = require('../config/db');

// Get all medications with optional filters
const getMedications = async (req, res) => {
  try {
    const { animal_id, status, active_only } = req.query;

    let query = `
      SELECT m.*, a.name as animal_name, a.species, u.full_name as created_by_name
      FROM animal_medications m
      LEFT JOIN animals a ON m.animal_id = a.id
      LEFT JOIN users u ON m.created_by = u.id
      WHERE 1=1
    `;

    const params = [];
    let paramIndex = 1;

    if (animal_id) {
      query += ` AND m.animal_id = $${paramIndex}`;
      params.push(animal_id);
      paramIndex++;
    }

    if (status) {
      query += ` AND m.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (active_only === 'true') {
      query += ` AND m.status = 'active'`;
      query += ` AND (m.end_date IS NULL OR m.end_date >= CURRENT_DATE)`;
    }

    query += ' ORDER BY m.created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get medications error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get medications due today or overdue
const getMedicationsDueToday = async (req, res) => {
  try {
    const query = `
      SELECT m.*, a.name as animal_name, a.species, a.id as animal_id,
             COALESCE(
               (SELECT MAX(given_date)::date
                FROM medication_log ml
                WHERE ml.medication_id = m.id),
               m.start_date
             ) as last_given_date
      FROM animal_medications m
      LEFT JOIN animals a ON m.animal_id = a.id
      WHERE m.status = 'active'
        AND (m.end_date IS NULL OR m.end_date >= CURRENT_DATE)
        AND m.start_date <= CURRENT_DATE
      ORDER BY a.name, m.medicine_name
    `;

    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Get medications due today error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get medication by ID
const getMedicationById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT m.*, a.name as animal_name, a.species
       FROM animal_medications m
       LEFT JOIN animals a ON m.animal_id = a.id
       WHERE m.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Medication not found' });
    }

    // Get medication log
    const logResult = await pool.query(
      `SELECT ml.*, u.full_name as given_by_name
       FROM medication_log ml
       LEFT JOIN users u ON ml.given_by = u.id
       WHERE ml.medication_id = $1
       ORDER BY ml.given_date DESC`,
      [id]
    );

    res.json({
      ...result.rows[0],
      logs: logResult.rows
    });
  } catch (error) {
    console.error('Get medication by ID error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create new medication
const createMedication = async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const {
      animal_id, medicine_name, dosage, frequency, instructions,
      start_date, end_date, prescribed_by, medical_record_id, notes
    } = req.body;

    if (!animal_id || !medicine_name) {
      return res.status(400).json({ error: 'Animal ID and medicine name are required' });
    }

    const result = await client.query(
      `INSERT INTO animal_medications (
        animal_id, medicine_name, dosage, frequency, instructions,
        start_date, end_date, prescribed_by, medical_record_id, notes, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [animal_id, medicine_name, dosage, frequency, instructions,
       start_date || new Date().toISOString().split('T')[0], end_date,
       prescribed_by, medical_record_id, notes, req.user.id]
    );

    // Log activity
    await client.query(
      'INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, 'add_medication', 'medication', result.rows[0].id, `Added ${medicine_name} for animal ID: ${animal_id}`]
    );

    await client.query('COMMIT');
    res.status(201).json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create medication error:', error);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
};

// Update medication
const updateMedication = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      medicine_name, dosage, frequency, instructions,
      start_date, end_date, status, prescribed_by, notes
    } = req.body;

    const result = await pool.query(
      `UPDATE animal_medications
       SET medicine_name = $1, dosage = $2, frequency = $3, instructions = $4,
           start_date = $5, end_date = $6, status = $7, prescribed_by = $8,
           notes = $9, updated_at = CURRENT_TIMESTAMP
       WHERE id = $10
       RETURNING *`,
      [medicine_name, dosage, frequency, instructions, start_date, end_date,
       status, prescribed_by, notes, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Medication not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update medication error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete medication
const deleteMedication = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM animal_medications WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Medication not found' });
    }

    res.json({ message: 'Medication deleted successfully' });
  } catch (error) {
    console.error('Delete medication error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Mark medication as given (log administration)
const markMedicationAsGiven = async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { medication_id, notes } = req.body;

    if (!medication_id) {
      return res.status(400).json({ error: 'Medication ID is required' });
    }

    // Verify medication exists and is active
    const medCheck = await client.query(
      'SELECT id, medicine_name, animal_id FROM animal_medications WHERE id = $1 AND status = $2',
      [medication_id, 'active']
    );

    if (medCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Active medication not found' });
    }

    // Log the administration
    const result = await client.query(
      `INSERT INTO medication_log (medication_id, given_by, notes)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [medication_id, req.user.id, notes]
    );

    // Log activity
    await client.query(
      'INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, 'administer_medication', 'medication', medication_id,
       `Administered ${medCheck.rows[0].medicine_name} to animal ID: ${medCheck.rows[0].animal_id}`]
    );

    await client.query('COMMIT');
    res.status(201).json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Mark medication as given error:', error);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
};

// Get medication history for an animal
const getAnimalMedicationHistory = async (req, res) => {
  try {
    const { animalId } = req.params;

    const result = await pool.query(
      `SELECT m.*,
              (SELECT COUNT(*) FROM medication_log WHERE medication_id = m.id) as doses_given,
              (SELECT MAX(given_date) FROM medication_log WHERE medication_id = m.id) as last_given
       FROM animal_medications m
       WHERE m.animal_id = $1
       ORDER BY m.created_at DESC`,
      [animalId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get animal medication history error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getMedications,
  getMedicationsDueToday,
  getMedicationById,
  createMedication,
  updateMedication,
  deleteMedication,
  markMedicationAsGiven,
  getAnimalMedicationHistory
};
