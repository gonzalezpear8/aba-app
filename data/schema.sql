-- Users (admin, therapist)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'therapist')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Patients
CREATE TABLE IF NOT EXISTS patients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    dob DATE,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Therapist-Patient Assignment
CREATE TABLE IF NOT EXISTS therapist_patient (
    id SERIAL PRIMARY KEY,
    therapist_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
    UNIQUE (therapist_id, patient_id)
);

-- Goals Repository
CREATE TABLE IF NOT EXISTS goals (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Images for Goals
CREATE TABLE IF NOT EXISTS goal_images (
    id SERIAL PRIMARY KEY,
    goal_id INTEGER REFERENCES goals(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    label VARCHAR(100),
    is_correct BOOLEAN DEFAULT false
);

-- Assigned Goals to Patients
CREATE TABLE IF NOT EXISTS patient_goals (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
    goal_id INTEGER REFERENCES goals(id) ON DELETE CASCADE,
    assigned_by INTEGER REFERENCES users(id),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sessions (Goal Running)
CREATE TABLE IF NOT EXISTS sessions (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
    therapist_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- e.g. "Session 2024-06-08 #3"
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    note TEXT
);

-- Session Results
CREATE TABLE IF NOT EXISTS session_results (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES sessions(id) ON DELETE CASCADE,
    goal_id INTEGER REFERENCES goals(id) ON DELETE CASCADE,
    outcome BOOLEAN
);

-- Create initial admin user (password: admin123, hashed with bcrypt for example)
INSERT INTO users (username, password, role)
VALUES ('admin', '$2b$10$rMbGJRzp6qQrBj.FiBI0H.tFYG8kxGBqIhqJHNqnU4DPWt0yRg2Hy', 'admin')
ON CONFLICT (username) DO NOTHING;