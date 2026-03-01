const pool = require('../config/db');

const getMedicalRecords = async (req, res) => {
  try {
    const { animal_id } = req.params;

    const result = await pool.query(
      `SELECT m.*, u.full_name as created_by_name
       FROM medical_records m
       LEFT JOIN users u ON m.created_by = u.id
       WHERE m.animal_id = $1
       ORDER BY m.date DESC`,
      [animal_id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get medical records error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const createMedicalRecord = async (req, res) => {
  try {
    const {
      animal_id, record_type, date, veterinarian, clinic, diagnosis,
      treatment, medication, notes, cost, next_appointment
    } = req.body;

    const result = await pool.query(
      `INSERT INTO medical_records (
        animal_id, record_type, date, veterinarian, clinic, diagnosis,
        treatment, medication, notes, cost, next_appointment, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [animal_id, record_type, date, veterinarian, clinic, diagnosis,
       treatment, medication, notes, cost, next_appointment, req.user.id]
    );

    // Log activity
    await pool.query(
      'INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, 'added_medical_record', 'medical_record', result.rows[0].id, `Animal ID: ${animal_id}`]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create medical record error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const updateMedicalRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const fields = req.body;

    const setClause = Object.keys(fields)
      .map((key, index) => `${key} = $${index + 1}`)
      .join(', ');

    const values = [...Object.values(fields), id];

    const result = await pool.query(
      `UPDATE medical_records SET ${setClause} WHERE id = $${values.length} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Medical record not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update medical record error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const deleteMedicalRecord = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM medical_records WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Medical record not found' });
    }

    res.json({ message: 'Medical record deleted successfully' });
  } catch (error) {
    console.error('Delete medical record error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getMedicalRecords,
  createMedicalRecord,
  updateMedicalRecord,
  deleteMedicalRecord
};
