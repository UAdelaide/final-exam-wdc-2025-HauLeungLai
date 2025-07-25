const express = require('express');
const router = express.Router();
const db = require('../models/db');

// GET all users (for admin/testing)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT user_id, username, email, role FROM Users');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// POST a new user (simple signup)
router.post('/register', async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    const [result] = await db.query(`
      INSERT INTO Users (username, email, password_hash, role)
      VALUES (?, ?, ?, ?)
    `, [username, email, password, role]);

    res.status(201).json({ message: 'User registered', user_id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.get('/me', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  res.json({
    user_id: req.session.user.user_id,
    username: req.session.user.username,
    role: req.session.user.role
  });
});

// POST login (dummy version)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await db.query(`
      SELECT user_id, username, role FROM Users
      WHERE email = ? AND password_hash = ?
    `, [email, password]);

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.json({ message: 'Login successful', user: rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Return list of dogs for current logged in owner
router.get('/choosedog', async (req, res) => {
  // Check if the user is logged in
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not login yet'});
  }
  try {
    const [rows] = await db.query(
      // Query dogs that belong to the logged in user based on username
      `SELECT d.dog_id, d.name FROM Dogs d JOIN Users u ON d.owner_id = u.user_id WHERE u.username = ?`,
      [req.session.user.username]
    );
    res.json(rows); //return the list of owned dogs
  }catch (err) {
    console.error ('Fetch dog list fail', err); //for debugging
    res.status(500).json({error: 'Server Error'});
  }
});

module.exports = router;