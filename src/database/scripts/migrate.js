// Load environment variables from .env file
require('dotenv').config();

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// ============================================================
// Configuration - Load from environment variables
// ============================================================
const config = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
};

// Validate required environment variables
const requiredVars = ['DB_NAME', 'DB_USER', 'DB_PASSWORD'];
const missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('\n❌ Missing required environment variables:');
  missingVars.forEach(varName => {
    console.error(`   - ${varName}`);
  });
  console.error('\n💡 Please create a .env file in the project root with the following variables:');
  console.error('   DB_HOST=localhost');
  console.error('   DB_PORT=5432');
  console.error('   DB_NAME=your_database_name');
  console.error('   DB_USER=your_username');
  console.error('   DB_PASSWORD=your_password');
  console.error('\n');
  process.exit(1);
}

const MIGRATIONS_DIR = path.join(__dirname, '../migrations');
const MIGRATIONS_TABLE = 'schema_migrations';

// ============================================================
// Helper Functions
// ============================================================

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// ============================================================
// Main Migration Function
// ============================================================

async function runMigrations() {
  const pool = new Pool(config);

  try {
    // Ensure migrations tracking table exists (in the database, so each env has its own history)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE} (
        filename VARCHAR(255) PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // Get list of applied migrations from the database
    const result = await pool.query(
      `SELECT filename FROM ${MIGRATIONS_TABLE} ORDER BY applied_at`
    );
    const appliedMigrations = result.rows.map(row => row.filename);

    // Get all migration files
    const migrationFiles = fs.readdirSync(MIGRATIONS_DIR)
      .filter(f => f.endsWith('.sql'))
      .sort();

    log('=======================================', 'blue');
    log('Running Database Migrations', 'blue');
    log('=======================================', 'blue');
    console.log('');

    let newCount = 0;

    for (const file of migrationFiles) {
      // Check if already applied (in this database)
      if (appliedMigrations.includes(file)) {
        log(`⊘ Skipping (already applied): ${file}`, 'yellow');
        continue;
      }

      log(`→ Running: ${file}`, 'green');

      // Read migration file
      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');

      try {
        // Run migration
        await pool.query(sql);

        // Record as applied in this database
        await pool.query(
          `INSERT INTO ${MIGRATIONS_TABLE} (filename) VALUES ($1)`,
          [file]
        );

        log(`✓ Success: ${file}`, 'green');
        newCount++;
        appliedMigrations.push(file);
      } catch (error) {
        // Check if error is due to objects already existing (migration already applied)
        const errorMessage = error.message.toLowerCase();
        const isAlreadyExistsError =
          errorMessage.includes('already exists') ||
          errorMessage.includes('duplicate') ||
          (errorMessage.includes('relation') && errorMessage.includes('already'));

        // Check if error is due to objects not existing (migration already applied in different way)
        const isDoesNotExistError =
          errorMessage.includes('does not exist') &&
          (errorMessage.includes('column') ||
            errorMessage.includes('constraint') ||
            errorMessage.includes('index'));

        if (isAlreadyExistsError || isDoesNotExistError) {
          log(`⊘ Skipping (already applied): ${file}`, 'yellow');
          log(`   Note: ${error.message}`, 'yellow');

          // Mark as applied in DB so we don't try again
          try {
            await pool.query(
              `INSERT INTO ${MIGRATIONS_TABLE} (filename) VALUES ($1) ON CONFLICT (filename) DO NOTHING`,
              [file]
            );
          } catch (insertErr) {
            // ignore duplicate key
          }
          appliedMigrations.push(file);
          continue;
        }

        // For other errors, fail
        log(`✗ Failed: ${file}`, 'red');
        log(`Error: ${error.message}`, 'red');
        log('Migration failed! Fix the error and run again.', 'red');
        process.exit(1);
      }

      console.log('');
    }

    log('=======================================', 'blue');
    if (newCount === 0) {
      log('No new migrations to apply!', 'yellow');
    } else {
      log(`Successfully applied ${newCount} new migration(s)!`, 'green');
    }
    log('=======================================', 'blue');

  } catch (error) {
    log('Error connecting to database:', 'red');
    log(error.message, 'red');
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// ============================================================
// Run
// ============================================================

runMigrations().catch(error => {
  console.error('Unexpected error:', error);
  process.exit(1);
});