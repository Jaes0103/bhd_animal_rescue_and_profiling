const pool = require('../config/db');

const getDashboardStats = async (req, res) => {
  try {
    // Total animals by status
    const animalStats = await pool.query(
      `SELECT
         COUNT(*) FILTER (WHERE status = 'healthy') as healthy,
         COUNT(*) FILTER (WHERE status = 'stable') as stable,
         COUNT(*) FILTER (WHERE status = 'treatment') as treatment,
         COUNT(*) FILTER (WHERE status = 'on_clinic') as on_clinic,
         COUNT(*) FILTER (WHERE status = 'fostered') as fostered,
         COUNT(*) FILTER (WHERE status = 'available_for_adoption') as available_for_adoption,
         COUNT(*) FILTER (WHERE status = 'adopted') as adopted,
         COUNT(*) FILTER (WHERE status != 'deceased') as total
       FROM animals`
    );

    // Animals by area/location
    const areaStats = await pool.query(
      `SELECT
         COUNT(*) FILTER (WHERE area = 'quarantine') as quarantine,
         COUNT(*) FILTER (WHERE area = 'under_observation') as under_observation,
         COUNT(*) FILTER (WHERE area = 'in_treatment') as in_treatment,
         COUNT(*) FILTER (WHERE area = 'medical_hold') as medical_hold,
         COUNT(*) FILTER (WHERE area = 'free_roaming') as free_roaming,
         COUNT(*) FILTER (WHERE area = 'caged') as caged
       FROM animals
       WHERE status != 'deceased'`
    );

    // Animals by species
    const speciesStats = await pool.query(
      `SELECT species, COUNT(*) as count
       FROM animals
       WHERE status != 'deceased'
       GROUP BY species`
    );

    // Recent intakes (last 30 days)
    const recentIntakes = await pool.query(
      `SELECT COUNT(*) as count
       FROM animals
       WHERE intake_date >= CURRENT_DATE - INTERVAL '30 days'`
    );

    // Pending adoption applications
    const pendingApplications = await pool.query(
      `SELECT COUNT(*) as count
       FROM adoption_applications
       WHERE application_status = 'pending'`
    );

    // Total adoptions this year
    const adoptionsThisYear = await pool.query(
      `SELECT COUNT(*) as count
       FROM adoptions
       WHERE EXTRACT(YEAR FROM adoption_date) = EXTRACT(YEAR FROM CURRENT_DATE)`
    );

    // Active foster placements
    const activeFosters = await pool.query(
      `SELECT COUNT(*) as count
       FROM foster_care
       WHERE status = 'active'`
    );

    // Total donations this month
    const donationsThisMonth = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as total
       FROM donations
       WHERE donation_type = 'cash'
       AND EXTRACT(MONTH FROM donation_date) = EXTRACT(MONTH FROM CURRENT_DATE)
       AND EXTRACT(YEAR FROM donation_date) = EXTRACT(YEAR FROM CURRENT_DATE)`
    );

    // Recent activity
    const recentActivity = await pool.query(
      `SELECT al.*, u.username, u.full_name
       FROM activity_logs al
       LEFT JOIN users u ON al.user_id = u.id
       ORDER BY al.created_at DESC
       LIMIT 10`
    );

    // Upcoming medical appointments
    const upcomingAppointments = await pool.query(
      `SELECT m.*, a.name as animal_name, a.species
       FROM medical_records m
       JOIN animals a ON m.animal_id = a.id
       WHERE m.next_appointment >= CURRENT_DATE
       AND m.next_appointment <= CURRENT_DATE + INTERVAL '7 days'
       ORDER BY m.next_appointment ASC`
    );

    res.json({
      animals: animalStats.rows[0],
      areas: areaStats.rows[0],
      species: speciesStats.rows,
      recent_intakes: recentIntakes.rows[0].count,
      pending_applications: pendingApplications.rows[0].count,
      adoptions_this_year: adoptionsThisYear.rows[0].count,
      active_fosters: activeFosters.rows[0].count,
      donations_this_month: donationsThisMonth.rows[0].total,
      recent_activity: recentActivity.rows,
      upcoming_appointments: upcomingAppointments.rows
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getDashboardStats };
