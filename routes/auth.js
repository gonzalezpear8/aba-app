const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const router = express.Router();

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const db = req.app.get('db'); // Grab DB from app context

  try {
    // Look up user
    const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create JWT
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '1d'
    });

    res.json({ token, role: user.role, id: user.id });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

router.post('/register', async (req, res) => {
  const { username, password, role, name, dob } = req.body;
  const db = req.app.get('db');

  try {
    // Check if username exists
    const userCheck = await db.query('SELECT * FROM users WHERE username = $1', [username]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Start transaction
    await db.query('BEGIN');

    // Create user
    const userResult = await db.query(
      'INSERT INTO users (username, password, role, created_at) VALUES ($1, $2, $3, NOW()) RETURNING id',
      [username, hashedPassword, role]
    );
    
    const userId = userResult.rows[0].id;

    // If role is patient or therapist, create their profile
    if (role === 'patient') {
      await db.query(
        'INSERT INTO patients (name, dob, user_id) VALUES ($1, $2, $3)',
        [name, dob, userId]
      );
    } else if (role === 'therapist') {
      await db.query(
        'INSERT INTO therapists (name, user_id) VALUES ($1, $2)',
        [name, userId]
      );
    }

    // Commit transaction
    await db.query('COMMIT');

    // Create JWT
    const token = jwt.sign({ id: userId, username, role }, process.env.JWT_SECRET, {
      expiresIn: '1d'
    });

    res.json({ token, role, id: userId });
  } catch (err) {
    await db.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

module.exports = router;
