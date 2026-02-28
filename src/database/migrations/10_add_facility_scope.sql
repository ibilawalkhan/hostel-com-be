CREATE TYPE facility_scope_enum AS ENUM ('hostel', 'room', 'washroom');

ALTER TABLE facilities
ADD COLUMN scope facility_scope_enum NOT NULL;