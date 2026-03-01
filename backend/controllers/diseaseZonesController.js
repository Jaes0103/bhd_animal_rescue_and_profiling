const pool = require('../config/db');

// Get all disease zones
const getDiseaseZones = async (req, res) => {
  try {
    const { status, disease_type } = req.query;

    let query = `
      SELECT
        dz.*,
        u.full_name as marked_by_name
      FROM disease_zones dz
      LEFT JOIN users u ON dz.marked_by = u.id
    `;

    const conditions = [];
    const values = [];

    if (status) {
      conditions.push(`dz.status = $${conditions.length + 1}`);
      values.push(status);
    }

    if (disease_type) {
      conditions.push(`dz.disease_type = $${conditions.length + 1}`);
      values.push(disease_type);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ` ORDER BY dz.created_at DESC`;

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching disease zones:', error);
    res.status(500).json({ error: 'Failed to fetch disease zones' });
  }
};

// Get single disease zone
const getDiseaseZone = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT
        dz.*,
        u.full_name as marked_by_name
      FROM disease_zones dz
      LEFT JOIN users u ON dz.marked_by = u.id
      WHERE dz.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Disease zone not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching disease zone:', error);
    res.status(500).json({ error: 'Failed to fetch disease zone' });
  }
};

// Create disease zone
const createDiseaseZone = async (req, res) => {
  try {
    const {
      disease_type,
      latitude,
      longitude,
      radius_km = 1.0,
      area_name,
      confirmed_cases = 1,
      description,
      severity = 'medium',
      first_case_date,
      last_case_date
    } = req.body;

    if (!disease_type || !latitude || !longitude) {
      return res.status(400).json({ error: 'Disease type, latitude, and longitude are required' });
    }

    const result = await pool.query(`
      INSERT INTO disease_zones
        (disease_type, latitude, longitude, radius_km, area_name, confirmed_cases,
         description, severity, marked_by, first_case_date, last_case_date)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, [disease_type, latitude, longitude, radius_km, area_name, confirmed_cases,
        description, severity, req.user.id, first_case_date, last_case_date]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating disease zone:', error);
    res.status(500).json({ error: 'Failed to create disease zone' });
  }
};

// Update disease zone
const updateDiseaseZone = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      status,
      severity,
      confirmed_cases,
      description,
      notes,
      radius_km,
      last_case_date
    } = req.body;

    const updates = [];
    const values = [];
    let paramCount = 1;

    if (status !== undefined) {
      updates.push(`status = $${paramCount++}`);
      values.push(status);
    }
    if (severity !== undefined) {
      updates.push(`severity = $${paramCount++}`);
      values.push(severity);
    }
    if (confirmed_cases !== undefined) {
      updates.push(`confirmed_cases = $${paramCount++}`);
      values.push(confirmed_cases);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(description);
    }
    if (notes !== undefined) {
      updates.push(`notes = $${paramCount++}`);
      values.push(notes);
    }
    if (radius_km !== undefined) {
      updates.push(`radius_km = $${paramCount++}`);
      values.push(radius_km);
    }
    if (last_case_date !== undefined) {
      updates.push(`last_case_date = $${paramCount++}`);
      values.push(last_case_date);
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE disease_zones
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Disease zone not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating disease zone:', error);
    res.status(500).json({ error: 'Failed to update disease zone' });
  }
};

// Delete disease zone
const deleteDiseaseZone = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      DELETE FROM disease_zones
      WHERE id = $1
      RETURNING id
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Disease zone not found' });
    }

    res.json({ message: 'Disease zone deleted successfully' });
  } catch (error) {
    console.error('Error deleting disease zone:', error);
    res.status(500).json({ error: 'Failed to delete disease zone' });
  }
};

module.exports = {
  getDiseaseZones,
  getDiseaseZone,
  createDiseaseZone,
  updateDiseaseZone,
  deleteDiseaseZone
};
