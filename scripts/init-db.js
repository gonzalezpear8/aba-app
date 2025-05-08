require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for Railway PostgreSQL
  }
});

async function initDb() {
  try {
    // Read schema file
    const schema = fs.readFileSync(path.join(__dirname, '../data/schema.sql'), 'utf8');
    
    // Execute schema
    await pool.query(schema);
    
    console.log('Database initialized successfully');
  } catch (err) {
    console.error('Error initializing database:', err);
  } finally {
    await pool.end();
  }
}

initDb(); 