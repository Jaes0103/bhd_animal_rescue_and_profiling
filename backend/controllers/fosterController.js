const pool = require('../config/db');

const getFosterRecords = async (req, res) => {
  try {
    const { status } = req.query;

    let query = `
      SELECT f.*, a.name as animal_name, a.species, u.full_name as assigned_by_name
      FROM foster_care f
      LEFT JOIN animals a ON f.animal_id = a.id
      LEFT JOIN users u ON f.assigned_by = u.id
      WHERE 1=1
    `;

    const params = [];
    if (status) {
      query += ' AND f.status = $1';
      params.push(status);
    }

    query += ' ORDER BY f.start_date DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get foster records error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getActiveFosterByAnimal = async (req, res) => {
  try {
    const { animalId } = req.params;

    const result = await pool.query(
      `SELECT f.*, u.full_name as assigned_by_name
       FROM foster_care f
       LEFT JOIN users u ON f.assigned_by = u.id
       WHERE f.animal_id = $1 AND f.status = 'active'
       ORDER BY f.start_date DESC
       LIMIT 1`,
      [animalId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No active foster record found for this animal' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get active foster record error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const createFosterRecord = async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const {
      animal_id, foster_parent_name, foster_parent_email, foster_parent_phone,
      foster_parent_address, start_date, notes, status, outcome,
      // Baseline assessment fields
      baseline_weight, baseline_body_condition, baseline_coat_condition,
      baseline_health_notes, baseline_socialization, baseline_behavior_notes,
      baseline_with_people, baseline_with_animals, baseline_food_aggression,
      baseline_medical_status
    } = req.body;

    // Create foster record with baseline assessment
    const result = await client.query(
      `INSERT INTO foster_care (
        animal_id, foster_parent_name, foster_parent_email, foster_parent_phone,
        foster_parent_address, start_date, notes, status, outcome, assigned_by,
        baseline_weight, baseline_body_condition, baseline_coat_condition,
        baseline_health_notes, baseline_socialization, baseline_behavior_notes,
        baseline_with_people, baseline_with_animals, baseline_food_aggression,
        baseline_medical_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
      RETURNING *`,
      [
        animal_id, foster_parent_name, foster_parent_email, foster_parent_phone,
        foster_parent_address, start_date, notes, status || 'active', outcome || 'pending', req.user.id,
        baseline_weight, baseline_body_condition, baseline_coat_condition,
        baseline_health_notes, baseline_socialization, baseline_behavior_notes,
        baseline_with_people, baseline_with_animals, baseline_food_aggression,
        JSON.stringify(baseline_medical_status || {})
      ]
    );

    // Get animal name for activity log
    const animal = await client.query('SELECT name FROM animals WHERE id = $1', [animal_id]);
    const animalName = animal.rows[0]?.name || 'Unknown';

    // Log activity
    await client.query(
      'INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, 'assigned_foster', 'foster_care', result.rows[0].id, `${animalName} assigned to foster parent ${foster_parent_name}`]
    );

    await client.query('COMMIT');
    res.status(201).json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create foster record error:', error);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
};

const updateFosterRecord = async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { id } = req.params;
    const {
      status, outcome, end_date, reason_for_return, notes,
      // Exit assessment fields
      exit_weight, exit_body_condition, exit_coat_condition, exit_health_notes,
      exit_socialization, exit_behavior_notes, exit_skills_learned,
      exit_remaining_issues, exit_ideal_home, exit_adoption_ready,
      exit_foster_parent_rating, exit_foster_parent_feedback,
      exit_recommendations, exit_would_foster_again, early_return_reason
    } = req.body;

    const result = await client.query(
      `UPDATE foster_care
       SET status = $1, outcome = $2, end_date = $3, reason_for_return = $4, notes = $5,
           exit_weight = $6, exit_body_condition = $7, exit_coat_condition = $8,
           exit_health_notes = $9, exit_socialization = $10, exit_behavior_notes = $11,
           exit_skills_learned = $12, exit_remaining_issues = $13, exit_ideal_home = $14,
           exit_adoption_ready = $15, exit_foster_parent_rating = $16,
           exit_foster_parent_feedback = $17, exit_recommendations = $18,
           exit_would_foster_again = $19, early_return_reason = $20,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $21
       RETURNING *`,
      [
        status, outcome, end_date, reason_for_return, notes,
        exit_weight, exit_body_condition, exit_coat_condition, exit_health_notes,
        exit_socialization, exit_behavior_notes, exit_skills_learned,
        exit_remaining_issues, exit_ideal_home, exit_adoption_ready,
        exit_foster_parent_rating, exit_foster_parent_feedback,
        exit_recommendations, exit_would_foster_again, early_return_reason,
        id
      ]
    );

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Foster record not found' });
    }

    // Get animal info for activity log
    const animal = await client.query('SELECT name FROM animals WHERE id = $1', [result.rows[0].animal_id]);
    const animalName = animal.rows[0]?.name || 'Unknown';

    // Update animal status based on the foster outcome
    if (outcome === 'returned') {
      // Animal returned to shelter - update based on adoption readiness
      const newStatus = exit_adoption_ready ? 'available_for_adoption' : 'healthy';
      await client.query(
        'UPDATE animals SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [newStatus, result.rows[0].animal_id]
      );

      // Log activity
      await client.query(
        'INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details) VALUES ($1, $2, $3, $4, $5)',
        [req.user.id, 'foster_completed', 'foster_care', id, `${animalName} returned from foster - ${exit_adoption_ready ? 'Ready for adoption' : 'Needs more time'}`]
      );
    } else if (outcome === 'adopted_by_foster') {
      // Foster parent adopted (foster failure - good outcome!)
      await client.query(
        'UPDATE animals SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        ['adopted', result.rows[0].animal_id]
      );

      // Log activity
      await client.query(
        'INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details) VALUES ($1, $2, $3, $4, $5)',
        [req.user.id, 'foster_failure_adoption', 'foster_care', id, `${animalName} adopted by foster parent (foster failure - success!)`]
      );
    }

    await client.query('COMMIT');
    res.json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Update foster record error:', error);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
};

const addFosterUpdate = async (req, res) => {
  try {
    const { foster_care_id } = req.params;
    const updateData = req.body;

    // Calculate week number based on foster start date
    const foster = await pool.query('SELECT start_date FROM foster_care WHERE id = $1', [foster_care_id]);
    if (foster.rows.length === 0) {
      return res.status(404).json({ error: 'Foster care record not found' });
    }

    const startDate = new Date(foster.rows[0].start_date);
    const updateDate = new Date(updateData.update_date || new Date());
    const weekNumber = Math.floor((updateDate - startDate) / (1000 * 60 * 60 * 24 * 7)) + 1;

    const result = await pool.query(
      `INSERT INTO foster_updates (
        foster_care_id, update_date, week_number,
        current_weight, body_condition_notes, health_observations, vet_visits,
        socialization_progress, behaviors_learned, problem_behaviors,
        interaction_with_family, interaction_with_pets, training_progress,
        eating_habits, house_training_status, sleep_patterns, energy_level, play_preferences,
        concerns, positive_observations, support_needed, photos,
        recorded_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
      RETURNING *`,
      [
        foster_care_id, updateData.update_date || new Date(), weekNumber,
        updateData.current_weight, updateData.body_condition_notes, updateData.health_observations, updateData.vet_visits,
        updateData.socialization_progress, updateData.behaviors_learned, updateData.problem_behaviors,
        updateData.interaction_with_family, updateData.interaction_with_pets, updateData.training_progress,
        updateData.eating_habits, updateData.house_training_status, updateData.sleep_patterns, updateData.energy_level, updateData.play_preferences,
        updateData.concerns, updateData.positive_observations, updateData.support_needed, JSON.stringify(updateData.photos || []),
        req.user.id
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Add foster update error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getFosterUpdates = async (req, res) => {
  try {
    const { foster_care_id } = req.params;

    const result = await pool.query(
      `SELECT fu.*, u.full_name as recorded_by_name
       FROM foster_updates fu
       LEFT JOIN users u ON fu.recorded_by = u.id
       WHERE fu.foster_care_id = $1
       ORDER BY fu.update_date DESC`,
      [foster_care_id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get foster updates error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getFosterRecords,
  getActiveFosterByAnimal,
  createFosterRecord,
  updateFosterRecord,
  addFosterUpdate,
  getFosterUpdates
};
