const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const bcrypt = require('bcrypt');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Get all users (admin only)
router.get('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, email, full_name, phone, role, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new user (admin only)
router.post('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  const client = await pool.connect();
  try {
    const { username, email, password, full_name, phone, role } = req.body;

    // Validation
    if (!username || !email || !password || !full_name || !role) {
      return res.status(400).json({ error: 'Username, email, password, full name, and role are required' });
    }

    // Check if username or email already exists
    const checkUser = await client.query(
      'SELECT id FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (checkUser.rows.length > 0) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    await client.query('BEGIN');

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await client.query(
      `INSERT INTO users (username, email, password, full_name, phone, role)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, username, email, full_name, phone, role, created_at`,
      [username, email, hashedPassword, full_name, phone, role]
    );

    // Log activity
    await client.query(
      'INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, 'create_user', 'user', result.rows[0].id, `Created user: ${username} with role: ${role}`]
    );

    await client.query('COMMIT');
    res.status(201).json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

// Update user role (admin only)
router.put('/:id/role', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Prevent admin from changing their own role
    if (parseInt(id) === req.user.id) {
      return res.status(403).json({ error: 'Cannot change your own role' });
    }

    await client.query('BEGIN');

    const result = await client.query(
      'UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, username, email, full_name, role',
      [role, id]
    );

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'User not found' });
    }

    // Log activity
    await client.query(
      'INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, 'update_user_role', 'user', id, `Changed user role to: ${role}`]
    );

    await client.query('COMMIT');
    res.json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Update user role error:', error);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

// Delete user (admin only)
router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (parseInt(id) === req.user.id) {
      return res.status(403).json({ error: 'Cannot delete your own account' });
    }

    await client.query('BEGIN');

    const result = await client.query(
      'DELETE FROM users WHERE id = $1 RETURNING username',
      [id]
    );

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'User not found' });
    }

    // Log activity
    await client.query(
      'INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, 'delete_user', 'user', id, `Deleted user: ${result.rows[0].username}`]
    );

    await client.query('COMMIT');
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

module.exports = router;
