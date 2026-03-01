const pool = require('../config/db');

const getApplications = async (req, res) => {
  try {
    const { status, animal_id } = req.query;

    let query = `
      SELECT aa.*, a.name as animal_name, a.species, u.full_name as reviewed_by_name
      FROM adoption_applications aa
      LEFT JOIN animals a ON aa.animal_id = a.id
      LEFT JOIN users u ON aa.reviewed_by = u.id
      WHERE 1=1
    `;

    const params = [];
    let paramIndex = 1;

    if (status) {
      query += ` AND aa.application_status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (animal_id) {
      query += ` AND aa.animal_id = $${paramIndex}`;
      params.push(animal_id);
      paramIndex++;
    }

    query += ' ORDER BY aa.applied_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const createApplication = async (req, res) => {
  try {
    const {
      animal_id, applicant_name, email, phone, address, occupation,
      household_members, has_children, has_pets, pet_details, housing_type,
      housing_owned, landlord_approval, yard_fenced, previous_pets,
      veterinarian_reference, reason_for_adoption
    } = req.body;

    const result = await pool.query(
      `INSERT INTO adoption_applications (
        animal_id, applicant_name, email, phone, address, occupation,
        household_members, has_children, has_pets, pet_details, housing_type,
        housing_owned, landlord_approval, yard_fenced, previous_pets,
        veterinarian_reference, reason_for_adoption
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *`,
      [animal_id, applicant_name, email, phone, address, occupation,
       household_members, has_children, has_pets, pet_details, housing_type,
       housing_owned, landlord_approval, yard_fenced, previous_pets,
       veterinarian_reference, reason_for_adoption]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create application error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const reviewApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { application_status, review_notes } = req.body;

    const result = await pool.query(
      `UPDATE adoption_applications
       SET application_status = $1, review_notes = $2, reviewed_by = $3, reviewed_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING *`,
      [application_status, review_notes, req.user.id, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Log activity
    await pool.query(
      'INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, 'reviewed_application', 'adoption_application', id, `Status: ${application_status}`]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Review application error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getAdoptions = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ad.*, a.name as animal_name, a.species, u.full_name as processed_by_name
       FROM adoptions ad
       LEFT JOIN animals a ON ad.animal_id = a.id
       LEFT JOIN users u ON ad.processed_by = u.id
       ORDER BY ad.adoption_date DESC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get adoptions error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const createAdoption = async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const {
      animal_id, application_id, adopter_name, adopter_email, adopter_phone,
      adopter_address, adoption_date, adoption_fee, contract_signed, follow_up_date, notes
    } = req.body;

    // Create adoption record
    const adoptionResult = await client.query(
      `INSERT INTO adoptions (
        animal_id, application_id, adopter_name, adopter_email, adopter_phone,
        adopter_address, adoption_date, adoption_fee, contract_signed, follow_up_date, notes, processed_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [animal_id, application_id, adopter_name, adopter_email, adopter_phone,
       adopter_address, adoption_date, adoption_fee, contract_signed, follow_up_date, notes, req.user.id]
    );

    // Update animal status to adopted
    await client.query(
      'UPDATE animals SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      ['adopted', animal_id]
    );

    // If there's an application, mark it as approved
    if (application_id) {
      await client.query(
        'UPDATE adoption_applications SET application_status = $1, reviewed_by = $2, reviewed_at = CURRENT_TIMESTAMP WHERE id = $3',
        ['approved', req.user.id, application_id]
      );
    }

    // Log activity
    await client.query(
      'INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, 'completed_adoption', 'adoption', adoptionResult.rows[0].id, `Animal ID: ${animal_id}`]
    );

    await client.query('COMMIT');
    res.status(201).json(adoptionResult.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create adoption error:', error);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
};

module.exports = {
  getApplications,
  createApplication,
  reviewApplication,
  getAdoptions,
  createAdoption
};
