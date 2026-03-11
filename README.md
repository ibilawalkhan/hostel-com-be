# Database Setup

### 1. Configure environment

Create a `.env` file (or ensure it already exists) with at least:

```bash
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hostelcom
DB_USER=postgres
DB_PASSWORD=your_password
```

These values are read by `src/database/scripts/migrate.js` and `src/database/scripts/seed.js`.

### 2. Run migrations

From the project root:

```bash
npm run migrate
```

This will connect to the database defined in `.env` and apply all SQL migrations in order.

### 3. Seed data

To insert initial data for **auth, hostel, rooms, lookup, and complaints**:

```bash
npm run seed
```

The seed script:

- Inserts complaint categories and priorities
- Inserts permissions and facilities
- Inserts payment types and account types
- Creates a **seed OWNER user** with a fixed `kuid` (`3831ceb8e4d846f8a58c3d2b964b4ecf`)
- Creates an OWNER role with core permissions
- Creates a sample **hostel**, **branch**, **room**, and **beds** for local testing

You can run `npm run seed` multiple times; it uses `ON CONFLICT DO NOTHING` and fixed identifiers so it is safe and idempotent.
