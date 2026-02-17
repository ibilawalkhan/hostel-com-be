-- =============================================================
-- EXTENSIONS
-- =============================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- for gen_random_uuid()


-- =============================================================
-- USER
-- =============================================================
CREATE TABLE "user" (
    kuid          CHAR(32)      NOT NULL DEFAULT REPLACE(gen_random_uuid()::text, '-', ''),
    full_name     VARCHAR(255)  NOT NULL,
    phone         VARCHAR(20),
    email         VARCHAR(255)  UNIQUE,
    cnic          VARCHAR(20)   UNIQUE,
    is_active     BOOLEAN       NOT NULL DEFAULT TRUE,
    password      TEXT          NOT NULL,
    dob           DATE,
    gender        VARCHAR(10)   CHECK (gender IN ('MALE', 'FEMALE')),
    occupation    VARCHAR(100),
    created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    PRIMARY KEY (kuid)
);


-- =============================================================
-- HOSTEL
-- =============================================================
CREATE TABLE hostel (
    kuid                      CHAR(32)     NOT NULL DEFAULT REPLACE(gen_random_uuid()::text, '-', ''),
    owner_kuid                CHAR(32)     NOT NULL,
    name                      VARCHAR(255) NOT NULL,
    country                   VARCHAR(50)  CHECK (country IN ('PAKISTAN')),
    city                      VARCHAR(100),
    area                      VARCHAR(100),
    full_address_text         TEXT,
    latitude                  DECIMAL(10, 8),
    longitude                 DECIMAL(11, 8),
    near_by                   TEXT,
    gender_allowed            VARCHAR(10)  CHECK (gender_allowed IN ('MALE', 'FEMALE')),
    type                      VARCHAR(20)  CHECK (type IN ('STUDENT', 'PROFESSIONAL', 'MIXED')),
    visitor_policy            VARCHAR(20)  CHECK (visitor_policy IN ('ALLOWED', 'NOT_ALLOWED', 'LIMITED_HOURS')),
    smoking                   VARCHAR(20)  CHECK (smoking IN ('ALLOWED', 'NOT_ALLOWED')),
    rules                     TEXT,
    admission_photos_url      TEXT[],      -- array of URLs
    reception_photos_url      TEXT[],
    mess_area_photos_url      TEXT[],
    created_at                TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at                TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    PRIMARY KEY (kuid),
    CONSTRAINT fk_hostel_owner FOREIGN KEY (owner_kuid) REFERENCES "user" (kuid) ON DELETE RESTRICT
);

CREATE INDEX idx_hostel_owner_kuid ON hostel (owner_kuid);

-- =============================================================
-- PERMISSION
-- =============================================================
CREATE TABLE permission (
    kuid             CHAR(32)     NOT NULL DEFAULT REPLACE(gen_random_uuid()::text, '-', ''),
    permission_name  VARCHAR(100) NOT NULL UNIQUE,
    description      TEXT,
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    PRIMARY KEY (kuid)
);


-- =============================================================
-- PAYMENT_TYPE
-- =============================================================
CREATE TABLE payment_type (
    kuid         CHAR(32)     NOT NULL DEFAULT REPLACE(gen_random_uuid()::text, '-', ''),
    name         VARCHAR(100) NOT NULL UNIQUE,  
    description  TEXT,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    PRIMARY KEY (kuid)
);


-- =============================================================
-- ACCOUNT_TYPE
-- =============================================================
CREATE TABLE account_type (
    kuid        CHAR(32)     NOT NULL DEFAULT REPLACE(gen_random_uuid()::text, '-', ''),
    name        VARCHAR(100) NOT NULL UNIQUE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    PRIMARY KEY (kuid)
);


-- =============================================================
-- FACILITIES
-- =============================================================
CREATE TABLE facilities (
    kuid        CHAR(32)     NOT NULL DEFAULT REPLACE(gen_random_uuid()::text, '-', ''),
    name        VARCHAR(100) NOT NULL UNIQUE,
    icon        VARCHAR(255),
    is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    PRIMARY KEY (kuid)
);


-- =============================================================
-- ComplaintCategory
-- =============================================================
CREATE TABLE complaintcategory (
    id            SERIAL,
    kuid          CHAR(32)     NOT NULL DEFAULT REPLACE(gen_random_uuid()::text, '-', ''),
    category_name VARCHAR(255) NOT NULL,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    PRIMARY KEY (id),
    UNIQUE (kuid),
    UNIQUE (category_name)
);


-- =============================================================
-- Priority
-- =============================================================
CREATE TABLE priority (
    id            SERIAL,
    kuid          CHAR(32)     NOT NULL DEFAULT REPLACE(gen_random_uuid()::text, '-', ''),
    priority_name VARCHAR(50)  NOT NULL,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    PRIMARY KEY (id),
    UNIQUE (kuid),
    UNIQUE (priority_name)
);