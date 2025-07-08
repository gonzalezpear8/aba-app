const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const upload = multer({ dest: 'uploads/' });

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/hello', async (req, res) => {
  res.json({ message: 'Hello from the backend!' });
});

// Example: get all users (if you have a users table)
app.get('/api/users', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM users');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = rows[0];
    if (!user) {
      console.log('No user found for', username);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('DB password:', user.password, user.password.length);
    console.log('Input password:', password, password.length);

    const valid = await bcrypt.compare(password, user.password);
    console.log('Password valid?', valid);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create JWT
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      'your_jwt_secret', // Replace with process.env.JWT_SECRET in production!
      { expiresIn: '1h' }
    );

    res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// JWT middleware for admin-only routes
function adminAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    if (decoded.role !== 'admin') return res.status(403).json({ error: 'Forbidden: Admins only' });
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Admin: Create therapist (protected)
app.post('/api/admin/create-therapist', adminAuth, async (req, res) => {
  const { username, password } = req.body;
  try {
    const { rows: existing } = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    const hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      'INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING id, username, role',
      [username, hash, 'therapist']
    );
    res.status(201).json({ user: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: Create patient (protected)
app.post('/api/admin/create-patient', adminAuth, async (req, res) => {
  const { name, dob } = req.body;
  try {
    const { rows } = await pool.query(
      'INSERT INTO patients (name, dob) VALUES ($1, $2) RETURNING id, name, dob',
      [name, dob]
    );
    res.status(201).json({ patient: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: Assign therapist to patient (protected)
app.post('/api/admin/assign-therapist', adminAuth, async (req, res) => {
  const { therapist_id, patient_id } = req.body;
  try {
    // Check if assignment already exists
    const { rows: existing } = await pool.query(
      'SELECT id FROM therapist_patient WHERE therapist_id = $1 AND patient_id = $2',
      [therapist_id, patient_id]
    );
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Assignment already exists' });
    }
    const { rows } = await pool.query(
      'INSERT INTO therapist_patient (therapist_id, patient_id) VALUES ($1, $2) RETURNING id, therapist_id, patient_id',
      [therapist_id, patient_id]
    );
    res.status(201).json({ assignment: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: Get all therapists (protected)
app.get('/api/admin/therapists', adminAuth, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, username FROM users WHERE role = $1', ['therapist']);
    res.json({ therapists: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: Get all patients (protected)
app.get('/api/admin/patients', adminAuth, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, name, dob FROM patients');
    res.json({ patients: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Therapist: Get assigned patients (protected)
function therapistAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    if (decoded.role !== 'therapist') return res.status(403).json({ error: 'Forbidden: Therapists only' });
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

app.get('/api/therapist/patients', therapistAuth, async (req, res) => {
  try {
    const therapistId = req.user.id;
    const { rows } = await pool.query(
      `SELECT p.id, p.name, p.dob
       FROM patients p
       JOIN therapist_patient tp ON tp.patient_id = p.id
       WHERE tp.therapist_id = $1`,
      [therapistId]
    );
    res.json({ patients: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Therapist: Get patient profile (protected)
app.get('/api/therapist/patient/:id', therapistAuth, async (req, res) => {
  try {
    const therapistId = req.user.id;
    const patientId = req.params.id;
    // Check assignment
    const { rows: assigned } = await pool.query(
      'SELECT 1 FROM therapist_patient WHERE therapist_id = $1 AND patient_id = $2',
      [therapistId, patientId]
    );
    if (assigned.length === 0) {
      return res.status(403).json({ error: 'Not assigned to this patient' });
    }
    // Get patient info
    const { rows: patientRows } = await pool.query(
      'SELECT id, name, dob FROM patients WHERE id = $1',
      [patientId]
    );
    if (patientRows.length === 0) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    const patient = patientRows[0];
    // Get assigned goals
    const { rows: goals } = await pool.query(
      `SELECT g.id, g.name
       FROM goals g
       JOIN patient_goals pg ON pg.goal_id = g.id
       WHERE pg.patient_id = $1`,
      [patientId]
    );
    res.json({ patient, goals });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Therapist: Get all goals (protected)
app.get('/api/therapist/goals', therapistAuth, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, name FROM goals');
    res.json({ goals: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Therapist: Assign goal to patient (protected)
app.post('/api/therapist/assign-goal', therapistAuth, async (req, res) => {
  const { patient_id, goal_id, image_ids } = req.body;
  try {
    // Check assignment
    const { rows: assigned } = await pool.query(
      'SELECT 1 FROM therapist_patient WHERE therapist_id = $1 AND patient_id = $2',
      [req.user.id, patient_id]
    );
    if (assigned.length === 0) {
      return res.status(403).json({ error: 'Not assigned to this patient' });
    }
    // Assign goal to patient
    await pool.query(
      'INSERT INTO patient_goals (patient_id, goal_id, assigned_by) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
      [patient_id, goal_id, req.user.id]
    );
    // Optionally, associate images with the goal (if needed)
    // (You can expand this logic as you add image upload/select features)
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Therapist: Create a new goal with images (protected)
app.post('/api/therapist/create-goal', therapistAuth, async (req, res) => {
  const { name, description, images } = req.body; // images: [{url, label, isCorrect}]
  if (!name || !images || !Array.isArray(images) || images.length < 2) {
    return res.status(400).json({ error: 'Name and at least 2 images are required.' });
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // Create goal
    const goalRes = await client.query(
      'INSERT INTO goals (name, description, created_by) VALUES ($1, $2, $3) RETURNING id, name, description',
      [name, description || '', req.user.id]
    );
    const goal = goalRes.rows[0];
    // Insert images
    const imageValues = [];
    const imageParams = [];
    let paramIdx = 1;
    for (const img of images) {
      imageValues.push(`($${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++})`);
      imageParams.push(goal.id, img.url, img.label, !!img.isCorrect);
    }
    const imagesRes = await client.query(
      `INSERT INTO goal_images (goal_id, image_url, label, is_correct) VALUES ${imageValues.join(', ')} RETURNING id, image_url, label, is_correct`,
      imageParams
    );
    await client.query('COMMIT');
    res.status(201).json({ goal, images: imagesRes.rows });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

// Therapist: Upload image (protected)
app.post('/api/therapist/upload-image', therapistAuth, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  // Return the URL to the uploaded image
  const url = `/uploads/${req.file.filename}`;
  res.json({ url });
});

// Therapist: Get goal details (images) for a patient
app.get('/api/therapist/goal/:goalId', therapistAuth, async (req, res) => {
  try {
    const { goalId } = req.params;
    const { rows: images } = await pool.query(
      'SELECT id, image_url, label, is_correct FROM goal_images WHERE goal_id = $1',
      [goalId]
    );
    res.json({ images });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Therapist: Remove goal from patient (protected)
app.delete('/api/therapist/unassign-goal', therapistAuth, async (req, res) => {
  const { patient_id, goal_id } = req.body;
  try {
    // Check assignment
    const { rows: assigned } = await pool.query(
      'SELECT 1 FROM therapist_patient WHERE therapist_id = $1 AND patient_id = $2',
      [req.user.id, patient_id]
    );
    if (assigned.length === 0) {
      return res.status(403).json({ error: 'Not assigned to this patient' });
    }
    await pool.query(
      'DELETE FROM patient_goals WHERE patient_id = $1 AND goal_id = $2',
      [patient_id, goal_id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Therapist: List all their goals with images
app.get('/api/therapist/my-goals', therapistAuth, async (req, res) => {
  try {
    const { rows: goals } = await pool.query(
      'SELECT id, name, description FROM goals WHERE created_by = $1',
      [req.user.id]
    );
    // For each goal, get images
    const goalsWithImages = [];
    for (const goal of goals) {
      const { rows: images } = await pool.query(
        'SELECT id, image_url, label, is_correct FROM goal_images WHERE goal_id = $1',
        [goal.id]
      );
      goalsWithImages.push({ ...goal, images });
    }
    res.json({ goals: goalsWithImages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Therapist: List all their images (from their goals)
app.get('/api/therapist/my-images', therapistAuth, async (req, res) => {
  try {
    const { rows: images } = await pool.query(
      `SELECT gi.id, gi.image_url, gi.label, gi.is_correct
       FROM goal_images gi
       JOIN goals g ON gi.goal_id = g.id
       WHERE g.created_by = $1`,
      [req.user.id]
    );
    res.json({ images });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Therapist: Edit a goal (name, description, images, correct answer)
app.put('/api/therapist/goal/:id', therapistAuth, async (req, res) => {
  const goalId = req.params.id;
  const { name, description, images } = req.body; // images: [{id, url, label, isCorrect}]
  if (!name || !images || !Array.isArray(images) || images.length < 2) {
    return res.status(400).json({ error: 'Name and at least 2 images are required.' });
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // Check ownership
    const { rows: goalRows } = await client.query('SELECT id FROM goals WHERE id = $1 AND created_by = $2', [goalId, req.user.id]);
    if (goalRows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(403).json({ error: 'Not your goal' });
    }
    // Update goal
    await client.query('UPDATE goals SET name = $1, description = $2 WHERE id = $3', [name, description || '', goalId]);
    // Remove old images
    await client.query('DELETE FROM goal_images WHERE goal_id = $1', [goalId]);
    // Insert new images
    const imageValues = [];
    const imageParams = [];
    let paramIdx = 1;
    for (const img of images) {
      imageValues.push(`($${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++})`);
      imageParams.push(goalId, img.url, img.label, !!img.isCorrect);
    }
    const imagesRes = await client.query(
      `INSERT INTO goal_images (goal_id, image_url, label, is_correct) VALUES ${imageValues.join(', ')} RETURNING id, image_url, label, is_correct`,
      imageParams
    );
    await client.query('COMMIT');
    res.json({ success: true, goal: { id: goalId, name, description }, images: imagesRes.rows });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

// Therapist: Delete a goal
app.delete('/api/therapist/goal/:id', therapistAuth, async (req, res) => {
  const goalId = req.params.id;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // Check ownership
    const { rows: goalRows } = await client.query('SELECT id FROM goals WHERE id = $1 AND created_by = $2', [goalId, req.user.id]);
    if (goalRows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(403).json({ error: 'Not your goal' });
    }
    // Delete goal images first (foreign key constraint)
    await client.query('DELETE FROM goal_images WHERE goal_id = $1', [goalId]);
    // Delete goal
    await client.query('DELETE FROM goals WHERE id = $1', [goalId]);
    await client.query('COMMIT');
    res.json({ success: true, message: 'Goal deleted successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

// Therapist: Get images for a specific goal
app.get('/api/therapist/goal/:id/images', therapistAuth, async (req, res) => {
  const goalId = req.params.id;
  try {
    // Optionally, check that the goal belongs to this therapist
    const { rows: goalRows } = await pool.query(
      'SELECT id FROM goals WHERE id = $1 AND created_by = $2',
      [goalId, req.user.id]
    );
    if (goalRows.length === 0) {
      return res.status(403).json({ error: 'Not your goal' });
    }
    const { rows: images } = await pool.query(
      'SELECT id, image_url, label, is_correct FROM goal_images WHERE goal_id = $1',
      [goalId]
    );
    res.json({ images });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
