const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Required for Railway & Render combo
  },
});

// Attach DB to app for access in routes
app.set('db', pool);

// Routes
app.use('/api/patients', require('./routes/patients'));
app.use('/api/auth', require('./routes/auth'));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
