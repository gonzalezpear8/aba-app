#!/bin/bash

# Usage: ./reset-db.sh
# Drops, creates, and initializes the aba database using data/schema.sql

set -e

DB_NAME="aba"
DB_USER="postgres"
SCHEMA_FILE="data/schema.sql"

# Drop the database if it exists
psql -U "$DB_USER" -c "DROP DATABASE IF EXISTS $DB_NAME;"

# Create a new database
psql -U "$DB_USER" -c "CREATE DATABASE $DB_NAME;"

# Apply the schema
psql -U "$DB_USER" -d "$DB_NAME" -f "$SCHEMA_FILE"

echo "Database '$DB_NAME' has been reset and initialized!" 