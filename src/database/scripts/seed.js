require('dotenv').config();

const { Pool } = require('pg');

// ============================================================
// Configuration
// ============================================================
const config = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
};

const requiredVars = ['DB_NAME', 'DB_USER', 'DB_PASSWORD'];
const missingVars = requiredVars.filter((v) => !process.env[v]);

if (missingVars.length > 0) {
  console.error('\n❌ Missing required environment variables:');
  missingVars.forEach((v) => console.error(`   - ${v}`));
  process.exit(1);
}

// ============================================================
// Colors
// ============================================================
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// ============================================================
// Seed Data
// ============================================================
const COMPLAINT_CATEGORIES = [
  'Maintenance',
  'Cleanliness',
  'Food',
  'Safety',
  'Noise',
  'Other',
];

const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

// ============================================================
// Main
// ============================================================
async function seed() {
  const pool = new Pool(config);
  const client = await pool.connect();

  try {
    log('=======================================', 'blue');
    log('Running Database Seed', 'blue');
    log('=======================================', 'blue');
    console.log('');

    await client.query('BEGIN');

    // Complaint categories
    log('→ Seeding complaint categories...', 'green');
    for (const name of COMPLAINT_CATEGORIES) {
      await client.query(
        `INSERT INTO complaintcategory (category_name)
         VALUES ($1)
         ON CONFLICT (category_name) DO NOTHING`,
        [name],
      );
    }
    log(`  ✓ ${COMPLAINT_CATEGORIES.length} categories`, 'green');

    // Priorities
    log('→ Seeding priorities...', 'green');
    for (const name of PRIORITIES) {
      await client.query(
        `INSERT INTO priority (priority_name)
         VALUES ($1)
         ON CONFLICT (priority_name) DO NOTHING`,
        [name],
      );
    }
    log(`  ✓ ${PRIORITIES.length} priorities`, 'green');

    await client.query('COMMIT');

    console.log('');
    log('=======================================', 'blue');
    log('Seed completed successfully!', 'green');
    log('=======================================', 'blue');
  } catch (error) {
    await client.query('ROLLBACK');
    log(`\n✗ Seed failed: ${error.message}`, 'red');
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
