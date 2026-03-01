const pool = require('../config/db');

const getDonations = async (req, res) => {
  try {
    const { donation_type, start_date, end_date } = req.query;

    let query = `
      SELECT d.*, u.full_name as recorded_by_name
      FROM donations d
      LEFT JOIN users u ON d.recorded_by = u.id
      WHERE 1=1
    `;

    const params = [];
    let paramIndex = 1;

    if (donation_type) {
      query += ` AND d.donation_type = $${paramIndex}`;
      params.push(donation_type);
      paramIndex++;
    }

    if (start_date) {
      query += ` AND d.donation_date >= $${paramIndex}`;
      params.push(start_date);
      paramIndex++;
    }

    if (end_date) {
      query += ` AND d.donation_date <= $${paramIndex}`;
      params.push(end_date);
      paramIndex++;
    }

    query += ' ORDER BY d.donation_date DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get donations error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const createDonation = async (req, res) => {
  try {
    const {
      donor_name, donor_email, donor_phone, donation_type, amount,
      items_description, donation_date, payment_method, receipt_issued, notes
    } = req.body;

    const result = await pool.query(
      `INSERT INTO donations (
        donor_name, donor_email, donor_phone, donation_type, amount,
        items_description, donation_date, payment_method, receipt_issued, notes, recorded_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [donor_name, donor_email, donor_phone, donation_type, amount,
       items_description, donation_date, payment_method, receipt_issued, notes, req.user.id]
    );

    // Log activity
    await pool.query(
      'INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, 'recorded_donation', 'donation', result.rows[0].id, `Type: ${donation_type}`]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create donation error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getDonationStats = async (req, res) => {
  try {
    const cashTotal = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as total
       FROM donations
       WHERE donation_type = 'cash'`
    );

    const monthlyDonations = await pool.query(
      `SELECT
         TO_CHAR(donation_date, 'YYYY-MM') as month,
         donation_type,
         COUNT(*) as count,
         COALESCE(SUM(amount), 0) as total_amount
       FROM donations
       WHERE donation_date >= CURRENT_DATE - INTERVAL '12 months'
       GROUP BY TO_CHAR(donation_date, 'YYYY-MM'), donation_type
       ORDER BY month DESC`
    );

    res.json({
      total_cash: cashTotal.rows[0].total,
      monthly_breakdown: monthlyDonations.rows
    });
  } catch (error) {
    console.error('Get donation stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getDonations,
  createDonation,
  getDonationStats
};
