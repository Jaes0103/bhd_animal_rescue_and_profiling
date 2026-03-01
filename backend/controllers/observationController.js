const pool = require('../config/db');

const getObservations = async (req, res) => {
  try {
    const { animal_id, observation_type, limit = 50, offset = 0 } = req.query;

    let query = `
      SELECT o.*,
             u.full_name as observer_name,
             u.role as observer_role
      FROM animal_observations o
      LEFT JOIN users u ON o.observed_by = u.id
      WHERE 1=1
    `;

    const params = [];
    let paramIndex = 1;

    if (animal_id) {
      query += ` AND o.animal_id = $${paramIndex}`;
      params.push(animal_id);
      paramIndex++;
    }

    if (observation_type) {
      query += ` AND o.observation_type = $${paramIndex}`;
      params.push(observation_type);
      paramIndex++;
    }

    query += ` ORDER BY o.observation_date DESC, o.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get observations error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getObservationById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT o.*,
              u.full_name as observer_name,
              u.role as observer_role,
              a.name as animal_name
       FROM animal_observations o
       LEFT JOIN users u ON o.observed_by = u.id
       LEFT JOIN animals a ON o.animal_id = a.id
       WHERE o.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Observation not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get observation error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const createObservation = async (req, res) => {
  const client = await pool.connect();
  try {
    const { animal_id, observation_date, observation_type, notes } = req.body;

    if (!animal_id || !observation_type || !notes) {
      return res.status(400).json({ error: 'Animal ID, observation type, and notes are required' });
    }

    await client.query('BEGIN');

    const result = await client.query(
      `INSERT INTO animal_observations (animal_id, observation_date, observed_by, observation_type, notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [animal_id, observation_date || new Date(), req.user.id, observation_type, notes]
    );

    // Log activity
    await client.query(
      'INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, 'create_observation', 'observation', result.rows[0].id, `Created observation for animal ${animal_id}`]
    );

    await client.query('COMMIT');
    res.status(201).json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create observation error:', error);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
};

const updateObservation = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { observation_date, observation_type, notes } = req.body;

    // Check if observation exists and user has permission
    const checkResult = await client.query(
      'SELECT * FROM animal_observations WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Observation not found' });
    }

    // Only admin or the observer can update
    if (req.user.role !== 'admin' && checkResult.rows[0].observed_by !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this observation' });
    }

    await client.query('BEGIN');

    const result = await client.query(
      `UPDATE animal_observations
       SET observation_date = COALESCE($1, observation_date),
           observation_type = COALESCE($2, observation_type),
           notes = COALESCE($3, notes),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING *`,
      [observation_date, observation_type, notes, id]
    );

    // Log activity
    await client.query(
      'INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, 'update_observation', 'observation', id, `Updated observation ${id}`]
    );

    await client.query('COMMIT');
    res.json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Update observation error:', error);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
};

const deleteObservation = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;

    // Check if observation exists and user has permission
    const checkResult = await client.query(
      'SELECT * FROM animal_observations WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Observation not found' });
    }

    // Only admin or the observer can delete
    if (req.user.role !== 'admin' && checkResult.rows[0].observed_by !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this observation' });
    }

    await client.query('BEGIN');

    await client.query('DELETE FROM animal_observations WHERE id = $1', [id]);

    // Log activity
    await client.query(
      'INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, 'delete_observation', 'observation', id, `Deleted observation ${id}`]
    );

    await client.query('COMMIT');
    res.json({ message: 'Observation deleted successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Delete observation error:', error);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
};

module.exports = {
  getObservations,
  getObservationById,
  createObservation,
  updateObservation,
  deleteObservation
};
