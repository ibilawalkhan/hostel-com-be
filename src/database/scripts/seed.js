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

// Fixed kuids so other developers / Postman collections can rely on them.
// Provided reference kuid from the user for the seed OWNER account.
const OWNER_USER_KUID = '3831ceb8e4d846f8a58c3d2b964b4ecf';
const HOSTEL_A_KUID = '11111111111111111111111111111111';

// Fixed txn references to keep payment seeds idempotent.
const PAYMENT_SEED_TXNS = {
  CREATE_API: 'SEED-PAYMENT-CREATE-001',
  REVIEW_API: 'SEED-PAYMENT-REVIEW-001',
  STATS_API: 'SEED-PAYMENT-STATS-001',
  LIST_API: 'SEED-PAYMENT-LIST-001',
};

const COMPLAINT_CATEGORIES = [
  'Maintenance',
  'Cleanliness',
  'Food',
  'Safety',
  'Noise',
  'Other',
];

const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

const PERMISSIONS = [
  { name: 'MANAGE_HOSTELS', description: 'Can create, update and delete hostels' },
  { name: 'MANAGE_ROOMS', description: 'Can manage rooms and beds' },
  { name: 'MANAGE_WARDENS', description: 'Can add/edit/delete wardens' },
];

const FACILITIES = [
  { name: 'WiFi', icon: 'wifi', scope: 'hostel' },
  { name: 'Laundry', icon: 'laundry', scope: 'hostel' },
  { name: 'AC Room', icon: 'ac', scope: 'room' },
  { name: 'Heater', icon: 'heater', scope: 'room' },
  { name: 'Attached Washroom', icon: 'washroom', scope: 'washroom' },
];

const PAYMENT_TYPES = [
  { name: 'Cash', description: 'Cash payments' },
  { name: 'Bank Transfer', description: 'Online bank transfer' },
  { name: 'Credit Card', description: 'Card payments' },
];

const ACCOUNT_TYPES = [
  { name: 'Current' },
  { name: 'Savings' },
];

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

    // Permissions
    log('→ Seeding permissions...', 'green');
    for (const perm of PERMISSIONS) {
      await client.query(
        `INSERT INTO permission (permission_name, description)
         VALUES ($1, $2)
         ON CONFLICT (permission_name) DO NOTHING`,
        [perm.name, perm.description],
      );
    }
    log(`  ✓ ${PERMISSIONS.length} permissions`, 'green');

    // Facilities
    log('→ Seeding facilities...', 'green');
    for (const f of FACILITIES) {
      await client.query(
        `INSERT INTO facilities (name, icon, scope)
         VALUES ($1, $2, $3)
         ON CONFLICT (name) DO NOTHING`,
        [f.name, f.icon, f.scope],
      );
    }
    log(`  ✓ ${FACILITIES.length} facilities`, 'green');

    // Payment types
    log('→ Seeding payment types...', 'green');
    for (const pt of PAYMENT_TYPES) {
      await client.query(
        `INSERT INTO payment_type (name, description)
         VALUES ($1, $2)
         ON CONFLICT (name) DO NOTHING`,
        [pt.name, pt.description],
      );
    }
    log(`  ✓ ${PAYMENT_TYPES.length} payment types`, 'green');

    // Account types
    log('→ Seeding account types...', 'green');
    for (const at of ACCOUNT_TYPES) {
      await client.query(
        `INSERT INTO account_type (name)
         VALUES ($1)
         ON CONFLICT (name) DO NOTHING`,
        [at.name],
      );
    }
    log(`  ✓ ${ACCOUNT_TYPES.length} account types`, 'green');

    // Seed owner user (AUTH) – uses fixed kuid so everyone shares the same owner
    log('→ Seeding owner user...', 'green');
    const ownerPasswordHash =
      '$2b$10$yGFWlqXz4FQpC6/1b9CH8u0mT7kCnK9pL2sQZpxpG0dYQy3P6vMda'; // bcrypt hash for "Owner@123" (example)

    await client.query(
      `INSERT INTO "user" (kuid, full_name, phone, email, password)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (kuid) DO NOTHING`,
      [
        OWNER_USER_KUID,
        'Seed Owner',
        '+923001234567',
        'owner.seed@example.com',
        ownerPasswordHash,
      ],
    );

    // Seed OWNER role
    const ownerRoleResult = await client.query(
      `INSERT INTO role (user_kuid, name, assigned_hostel_kuid, hostel_branch_kuid)
       VALUES ($1, 'OWNER', NULL, NULL)
       ON CONFLICT DO NOTHING
       RETURNING kuid`,
      [OWNER_USER_KUID],
    );
    const ownerRoleKuid =
      ownerRoleResult.rows[0]?.kuid ||
      (
        await client.query(
          `SELECT kuid FROM role WHERE user_kuid = $1 AND name = 'OWNER' LIMIT 1`,
          [OWNER_USER_KUID],
        )
      ).rows[0]?.kuid;

    // Attach all permissions to OWNER role
    if (ownerRoleKuid) {
      log('→ Attaching permissions to owner role...', 'green');
      const permRows = await client.query(
        `SELECT kuid FROM permission WHERE permission_name = ANY($1::text[])`,
        [PERMISSIONS.map((p) => p.name)],
      );
      for (const row of permRows.rows) {
        await client.query(
          `INSERT INTO role_permission (role_kuid, permission_kuid)
           VALUES ($1, $2)
           ON CONFLICT (role_kuid, permission_kuid) DO NOTHING`,
          [ownerRoleKuid, row.kuid],
        );
      }
    }

    // Seed a sample hostel for the owner
    log('→ Seeding sample hostel...', 'green');
    await client.query(
      `INSERT INTO hostel (
         kuid, owner_kuid, name, country, full_address_text,
         latitude, longitude, near_by, gender_allowed, type,
         visitor_policy, smoking, rules,
         admission_photos_url, reception_photos_url, mess_area_photos_url
       )
       VALUES (
         $1, $2, $3, 'PAKISTAN', $4,
         $5, $6, $7, $8, $9,
         $10, $11, $12,
         $13, $14, $15
       )
       ON CONFLICT (kuid) DO NOTHING`,
      [
        HOSTEL_A_KUID,
        OWNER_USER_KUID,
        'Seed Hostel A',
        'Seed Street 1, Seed City',
        33.6844,
        73.0479,
        'Near Seed Park',
        'MALE',
        'STUDENT',
        'ALLOWED',
        'NOT_ALLOWED',
        'No loud music after 10pm',
        ['https://example.com/hostel/admission.jpg'],
        ['https://example.com/hostel/reception.jpg'],
        ['https://example.com/hostel/mess.jpg'],
      ],
    );

    // Seed hostel branch
    log('→ Seeding hostel branch...', 'green');
    await client.query(
      `INSERT INTO hostel_branch (hostel_kuid, branch_number)
       VALUES ($1, $2)
       ON CONFLICT (hostel_kuid, branch_number) DO NOTHING`,
      [HOSTEL_A_KUID, 'Branch 1'],
    );

    // Seed one sample room with 2 beds
    log('→ Seeding sample room and beds...', 'green');
    const roomResult = await client.query(
      `INSERT INTO room (
         hostel_kuid, room_type, room_no, floor_no, room_size, status, photos
       )
       VALUES ($1, '2', '101', '1', '120 sq ft', 'PARTIAL_OCCUPIED', $2)
       ON CONFLICT (hostel_kuid, room_no) DO UPDATE
         SET room_type = EXCLUDED.room_type
       RETURNING kuid`,
      [HOSTEL_A_KUID, ['https://example.com/rooms/101.jpg']],
    );
    const roomKuid = roomResult.rows[0].kuid;

    // Beds for that room
    await client.query(
      `INSERT INTO bed (room_kuid, bed_no, monthly_rent, bed_occupied_enum)
       VALUES ($1, '1', 5000, 'OCCUPIED')
       ON CONFLICT (room_kuid, bed_no) DO NOTHING`,
      [roomKuid],
    );
    await client.query(
      `INSERT INTO bed (room_kuid, bed_no, monthly_rent, bed_occupied_enum)
       VALUES ($1, '2', 5000, 'AVAILABLE')
       ON CONFLICT (room_kuid, bed_no) DO NOTHING`,
      [roomKuid],
    );

    const bedOneResult = await client.query(
      `SELECT kuid FROM bed WHERE room_kuid = $1 AND bed_no = '1' LIMIT 1`,
      [roomKuid],
    );
    const bedTwoResult = await client.query(
      `SELECT kuid FROM bed WHERE room_kuid = $1 AND bed_no = '2' LIMIT 1`,
      [roomKuid],
    );
    const bedOneKuid = bedOneResult.rows[0]?.kuid;
    const bedTwoKuid = bedTwoResult.rows[0]?.kuid;

    // Seed a sample payment account for the owner
    log('→ Seeding payment account...', 'green');
    await client.query(
      `INSERT INTO payment_account (
         owner_kuid,
         hostel_kuid,
         account_type_kuid,
         account_title,
         account_number,
         bank_name
       )
       VALUES (
         $1,
         $2,
         (SELECT kuid FROM account_type WHERE name = 'Current' LIMIT 1),
         $3,
         $4,
         $5
       )
       ON CONFLICT ON CONSTRAINT payment_account_hostel_kuid_account_number_key DO NOTHING`,
      [
        OWNER_USER_KUID,
        HOSTEL_A_KUID,
        'Seed Owner Account',
        '1234567890',
        'Seed Bank',
      ],
    );

    const paymentAccountResult = await client.query(
      `SELECT kuid
       FROM payment_account
       WHERE owner_kuid = $1 AND hostel_kuid = $2 AND account_number = $3
       ORDER BY created_at ASC
       LIMIT 1`,
      [OWNER_USER_KUID, HOSTEL_A_KUID, '1234567890'],
    );
    const paymentTypeResult = await client.query(
      `SELECT kuid FROM payment_type WHERE name = 'Bank Transfer' LIMIT 1`,
    );

    const paymentAccountKuid = paymentAccountResult.rows[0]?.kuid;
    const paymentTypeKuid = paymentTypeResult.rows[0]?.kuid;

    if (paymentAccountKuid && paymentTypeKuid && bedOneKuid && bedTwoKuid) {
      // /payments (POST createPayment)
      await client.query(
        `INSERT INTO payment (
           user_kuid,
           payment_type_kuid,
           payment_account_kuid,
           hostel_kuid,
           room_kuid,
           bed_kuid,
           payment_method,
           amount,
           payment_attachment_url,
           txn_reference,
           status,
           verification_status
         ) VALUES (
           $1, $2, $3, $4, $5, $6,
           'BANK_TRANSFER',
           25000,
           'https://example.com/payments/create-proof.jpg',
           $7,
           'PENDING',
           'UNDER-REVIEW'
         )
         ON CONFLICT (txn_reference) DO NOTHING`,
        [
          OWNER_USER_KUID,
          paymentTypeKuid,
          paymentAccountKuid,
          HOSTEL_A_KUID,
          roomKuid,
          bedOneKuid,
          PAYMENT_SEED_TXNS.CREATE_API,
        ],
      );

      // /payments/:id (PATCH updatePaymentReview)
      await client.query(
        `INSERT INTO payment (
           user_kuid,
           payment_type_kuid,
           payment_account_kuid,
           hostel_kuid,
           room_kuid,
           bed_kuid,
           payment_method,
           amount,
           payment_attachment_url,
           txn_reference,
           status,
           verification_status,
           reviewed_by_user_kuid,
           reviewed_at,
           rejection_reason
         ) VALUES (
           $1, $2, $3, $4, $5, $6,
           'BANK_TRANSFER',
           26000,
           'https://example.com/payments/review-proof.jpg',
           $7,
           'COMPLETED',
           'APPROVED',
           $8,
           NOW(),
           NULL
         )
         ON CONFLICT (txn_reference) DO NOTHING`,
        [
          OWNER_USER_KUID,
          paymentTypeKuid,
          paymentAccountKuid,
          HOSTEL_A_KUID,
          roomKuid,
          bedTwoKuid,
          PAYMENT_SEED_TXNS.REVIEW_API,
          OWNER_USER_KUID,
        ],
      );

      // /payments/stats (GET getPaymentStats)
      await client.query(
        `INSERT INTO payment (
           user_kuid,
           payment_type_kuid,
           payment_account_kuid,
           hostel_kuid,
           room_kuid,
           bed_kuid,
           payment_method,
           amount,
           payment_attachment_url,
           txn_reference,
           status,
           verification_status,
           reviewed_by_user_kuid,
           reviewed_at,
           rejection_reason
         ) VALUES (
           $1, $2, $3, $4, $5, $6,
           'CASH',
           12000,
           'https://example.com/payments/stats-proof.jpg',
           $7,
           'FAILED',
           'REJECTED',
           $8,
           NOW(),
           'Seeded failed payment for stats checks'
         )
         ON CONFLICT (txn_reference) DO NOTHING`,
        [
          OWNER_USER_KUID,
          paymentTypeKuid,
          paymentAccountKuid,
          HOSTEL_A_KUID,
          roomKuid,
          bedOneKuid,
          PAYMENT_SEED_TXNS.STATS_API,
          OWNER_USER_KUID,
        ],
      );

      // /payments (GET findAllPayments and filtered listing)
      await client.query(
        `INSERT INTO payment (
           user_kuid,
           payment_type_kuid,
           payment_account_kuid,
           hostel_kuid,
           room_kuid,
           bed_kuid,
           payment_method,
           amount,
           payment_attachment_url,
           txn_reference,
           status,
           verification_status
         ) VALUES (
           $1, $2, $3, $4, $5, $6,
           'UPI',
           18000,
           'https://example.com/payments/list-proof.jpg',
           $7,
           'CANCELLED',
           'UNDER-REVIEW'
         )
         ON CONFLICT (txn_reference) DO NOTHING`,
        [
          OWNER_USER_KUID,
          paymentTypeKuid,
          paymentAccountKuid,
          HOSTEL_A_KUID,
          roomKuid,
          bedTwoKuid,
          PAYMENT_SEED_TXNS.LIST_API,
        ],
      );

      log('  ✓ Seeded payment records for all payments controller endpoints', 'green');
    } else {
      log('  ⚠ Skipped payment records seeding due to missing dependencies', 'yellow');
    }

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
