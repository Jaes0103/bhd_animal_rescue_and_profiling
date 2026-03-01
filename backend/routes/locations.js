const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Get all locations
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { type, is_active } = req.query;

    let query = `
      SELECT l.*,
        (SELECT COUNT(*) FROM animals WHERE location_id = l.id) as current_count
      FROM locations l
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (type) {
      paramCount++;
      query += ` AND type = $${paramCount}`;
      params.push(type);
    }

    if (is_active !== undefined) {
      paramCount++;
      query += ` AND is_active = $${paramCount}`;
      params.push(is_active === 'true');
    }

    query += ' ORDER BY name ASC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ error: 'Failed to fetch locations' });
  }
});

// Get single location by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT l.*,
        (SELECT COUNT(*) FROM animals WHERE location_id = l.id) as current_count
       FROM locations l
       WHERE l.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Location not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching location:', error);
    res.status(500).json({ error: 'Failed to fetch location' });
  }
});

// Get animals at a location
router.get('/:id/animals', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT a.*,
        (SELECT json_agg(json_build_object('id', ap.id, 'photo_url', ap.photo_url, 'is_primary', ap.is_primary))
         FROM animal_photos ap WHERE ap.animal_id = a.id) as photos
       FROM animals a
       WHERE a.location_id = $1
       ORDER BY a.intake_date DESC`,
      [id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching animals at location:', error);
    res.status(500).json({ error: 'Failed to fetch animals' });
  }
});

// Create new location (admin only)
router.post('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const {
      name,
      type,
      address,
      city,
      contact_person,
      contact_phone,
      contact_email,
      capacity,
      notes
    } = req.body;

    // Validation
    if (!name || !type) {
      return res.status(400).json({ error: 'Name and type are required' });
    }

    const result = await pool.query(
      `INSERT INTO locations (name, type, address, city, contact_person, contact_phone,
       contact_email, capacity, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [name, type, address, city, contact_person, contact_phone, contact_email, capacity, notes]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating location:', error);
    res.status(500).json({ error: 'Failed to create location' });
  }
});

// Update location (admin only)
router.put('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      type,
      address,
      city,
      contact_person,
      contact_phone,
      contact_email,
      capacity,
      notes,
      is_active
    } = req.body;

    const result = await pool.query(
      `UPDATE locations
       SET name = COALESCE($1, name),
           type = COALESCE($2, type),
           address = COALESCE($3, address),
           city = COALESCE($4, city),
           contact_person = COALESCE($5, contact_person),
           contact_phone = COALESCE($6, contact_phone),
           contact_email = COALESCE($7, contact_email),
           capacity = COALESCE($8, capacity),
           notes = COALESCE($9, notes),
           is_active = COALESCE($10, is_active),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $11
       RETURNING *`,
      [name, type, address, city, contact_person, contact_phone, contact_email,
       capacity, notes, is_active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Location not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating location:', error);
    res.status(500).json({ error: 'Failed to update location' });
  }
});

// Delete location (admin only)
router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if location has animals
    const animalCheck = await pool.query(
      'SELECT COUNT(*) FROM animals WHERE location_id = $1',
      [id]
    );

    if (parseInt(animalCheck.rows[0].count) > 0) {
      return res.status(400).json({
        error: 'Cannot delete location with animals. Please transfer animals first.'
      });
    }

    const result = await pool.query(
      'DELETE FROM locations WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Location not found' });
    }

    res.json({ message: 'Location deleted successfully' });
  } catch (error) {
    console.error('Error deleting location:', error);
    res.status(500).json({ error: 'Failed to delete location' });
  }
});

// Transfer animal to different location
router.post('/transfer', authenticateToken, authorizeRoles('admin', 'staff'), async (req, res) => {
  try {
    const { animal_id, to_location_id, reason, notes } = req.body;

    if (!animal_id || !to_location_id) {
      return res.status(400).json({ error: 'Animal ID and destination location are required' });
    }

    // Get current location
    const animalResult = await pool.query(
      'SELECT location_id FROM animals WHERE id = $1',
      [animal_id]
    );

    if (animalResult.rows.length === 0) {
      return res.status(404).json({ error: 'Animal not found' });
    }

    const from_location_id = animalResult.rows[0].location_id;

    // Update animal location
    await pool.query(
      'UPDATE animals SET location_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [to_location_id, animal_id]
    );

    // Record in location history
    await pool.query(
      `INSERT INTO location_history (animal_id, from_location_id, to_location_id, reason, notes, transferred_by)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [animal_id, from_location_id, to_location_id, reason, notes, req.user.id]
    );

    res.json({ message: 'Animal transferred successfully' });
  } catch (error) {
    console.error('Error transferring animal:', error);
    res.status(500).json({ error: 'Failed to transfer animal' });
  }
});

// Get location transfer history
router.get('/:id/history', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT lh.*,
        a.name as animal_name,
        fl.name as from_location_name,
        tl.name as to_location_name,
        u.full_name as transferred_by_name
       FROM location_history lh
       LEFT JOIN animals a ON lh.animal_id = a.id
       LEFT JOIN locations fl ON lh.from_location_id = fl.id
       LEFT JOIN locations tl ON lh.to_location_id = tl.id
       LEFT JOIN users u ON lh.transferred_by = u.id
       WHERE lh.to_location_id = $1 OR lh.from_location_id = $1
       ORDER BY lh.transfer_date DESC
       LIMIT 50`,
      [id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching location history:', error);
    res.status(500).json({ error: 'Failed to fetch location history' });
  }
});

module.exports = router;
