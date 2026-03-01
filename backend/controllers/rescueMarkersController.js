const pool = require('../config/db');

// Get all rescue markers
const getRescueMarkers = async (req, res) => {
  try {
    const { status } = req.query;

    let query = `
      SELECT
        rm.*,
        u.full_name as marked_by_name,
        u2.full_name as rescued_by_name,
        a.name as animal_name
      FROM rescue_markers rm
      LEFT JOIN users u ON rm.marked_by = u.id
      LEFT JOIN users u2 ON rm.rescued_by = u2.id
      LEFT JOIN animals a ON rm.animal_id = a.id
    `;

    const conditions = [];
    const values = [];

    if (status) {
      conditions.push(`rm.status = $${conditions.length + 1}`);
      values.push(status);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ` ORDER BY rm.created_at DESC`;

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching rescue markers:', error);
    res.status(500).json({ error: 'Failed to fetch rescue markers' });
  }
};

// Get single rescue marker
const getRescueMarker = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT
        rm.*,
        u.full_name as marked_by_name,
        u2.full_name as rescued_by_name,
        a.name as animal_name
      FROM rescue_markers rm
      LEFT JOIN users u ON rm.marked_by = u.id
      LEFT JOIN users u2 ON rm.rescued_by = u2.id
      LEFT JOIN animals a ON rm.animal_id = a.id
      WHERE rm.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Rescue marker not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching rescue marker:', error);
    res.status(500).json({ error: 'Failed to fetch rescue marker' });
  }
};

// Create rescue marker
const createRescueMarker = async (req, res) => {
  try {
    const {
      latitude,
      longitude,
      animal_type,
      description,
      photo_url,
      priority = 'normal'
    } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const result = await pool.query(`
      INSERT INTO rescue_markers
        (latitude, longitude, animal_type, description, photo_url, priority, marked_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [latitude, longitude, animal_type, description, photo_url, priority, req.user.id]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating rescue marker:', error);
    res.status(500).json({ error: 'Failed to create rescue marker' });
  }
};

// Update rescue marker
const updateRescueMarker = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      status,
      priority,
      description,
      notes,
      animal_id
    } = req.body;

    const updates = [];
    const values = [];
    let paramCount = 1;

    if (status !== undefined) {
      updates.push(`status = $${paramCount++}`);
      values.push(status);
    }
    if (priority !== undefined) {
      updates.push(`priority = $${paramCount++}`);
      values.push(priority);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(description);
    }
    if (notes !== undefined) {
      updates.push(`notes = $${paramCount++}`);
      values.push(notes);
    }
    if (animal_id !== undefined) {
      updates.push(`animal_id = $${paramCount++}`);
      values.push(animal_id);
    }

    if (status === 'rescued') {
      updates.push(`rescued_by = $${paramCount++}`);
      values.push(req.user.id);
      updates.push(`rescue_date = CURRENT_TIMESTAMP`);
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE rescue_markers
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Rescue marker not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating rescue marker:', error);
    res.status(500).json({ error: 'Failed to update rescue marker' });
  }
};

// Delete rescue marker
const deleteRescueMarker = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      DELETE FROM rescue_markers
      WHERE id = $1
      RETURNING id
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Rescue marker not found' });
    }

    res.json({ message: 'Rescue marker deleted successfully' });
  } catch (error) {
    console.error('Error deleting rescue marker:', error);
    res.status(500).json({ error: 'Failed to delete rescue marker' });
  }
};

module.exports = {
  getRescueMarkers,
  getRescueMarker,
  createRescueMarker,
  updateRescueMarker,
  deleteRescueMarker
};
