-- =============================================================
-- EXTENSIONS
-- =============================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- for gen_random_uuid()

-- =============================================================
-- ROLE
-- =============================================================
CREATE TABLE role (
    kuid            CHAR(32)     NOT NULL DEFAULT REPLACE(gen_random_uuid()::text, '-', ''),
    user_kuid       CHAR(32)     NOT NULL,
    assigned_hostel VARCHAR(255),
    hostel_branch   VARCHAR(255),
    name            VARCHAR(20)  NOT NULL CHECK (name IN ('OWNER', 'WARDEN', 'CUSTOMER')),
    is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    PRIMARY KEY (kuid),
    CONSTRAINT fk_role_user FOREIGN KEY (user_kuid) REFERENCES "user" (kuid) ON DELETE CASCADE
);

CREATE INDEX idx_role_user_kuid ON role (user_kuid);

-- =============================================================
-- ROLE_PERMISSION
-- =============================================================
CREATE TABLE role_permission (
    kuid             CHAR(32)    NOT NULL DEFAULT REPLACE(gen_random_uuid()::text, '-', ''),
    role_kuid        CHAR(32)    NOT NULL,
    permission_kuid  CHAR(32)    NOT NULL,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (kuid),
    UNIQUE (role_kuid, permission_kuid),
    CONSTRAINT fk_rp_role       FOREIGN KEY (role_kuid)       REFERENCES role       (kuid) ON DELETE CASCADE,
    CONSTRAINT fk_rp_permission FOREIGN KEY (permission_kuid) REFERENCES permission (kuid) ON DELETE CASCADE
);

CREATE INDEX idx_rp_role_kuid       ON role_permission (role_kuid);
CREATE INDEX idx_rp_permission_kuid ON role_permission (permission_kuid);

-- =============================================================
-- HOSTEL_BRANCH
-- =============================================================
CREATE TABLE hostel_branch (
    kuid           CHAR(32)     NOT NULL DEFAULT REPLACE(gen_random_uuid()::text, '-', ''),
    hostel_kuid    CHAR(32)     NOT NULL,
    branch_number  VARCHAR(50)  NOT NULL,
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    PRIMARY KEY (kuid),
    UNIQUE (hostel_kuid, branch_number),
    CONSTRAINT fk_hb_hostel FOREIGN KEY (hostel_kuid) REFERENCES hostel (kuid) ON DELETE CASCADE
);

CREATE INDEX idx_hb_hostel_kuid ON hostel_branch (hostel_kuid);

-- =============================================================
-- ROOM
-- =============================================================
CREATE TABLE room (
    kuid            CHAR(32)       NOT NULL DEFAULT REPLACE(gen_random_uuid()::text, '-', ''),
    hostel_kuid     CHAR(32)       NOT NULL,
    room_type       VARCHAR(10)    NOT NULL CHECK (room_type IN ('1', '2', '3', '4', '5')),
    room_no         VARCHAR(50)    NOT NULL,
    floor_no        VARCHAR(20),
    room_size       VARCHAR(50),
    status          VARCHAR(20)    NOT NULL DEFAULT 'full' CHECK (status IN ('FULL', 'PARTIAL_OCCUPIED', 'EMPTY')),
    photos          TEXT[],
    is_active       BOOLEAN        NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    PRIMARY KEY (kuid),
    UNIQUE (hostel_kuid, room_no),
    CONSTRAINT fk_room_hostel FOREIGN KEY (hostel_kuid) REFERENCES hostel (kuid) ON DELETE CASCADE
);

CREATE INDEX idx_room_hostel_kuid ON room (hostel_kuid);

-- =============================================================
-- BED
-- =============================================================
CREATE TABLE bed (
    kuid              CHAR(32)    NOT NULL DEFAULT REPLACE(gen_random_uuid()::text, '-', ''),
    room_kuid         CHAR(32)    NOT NULL,
    bed_no            VARCHAR(50) NOT NULL,
    monthly_rent      NUMERIC(15,2),
    bed_photos_url    TEXT[],
    bed_occupied_enum VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE' CHECK (bed_occupied_enum IN ('OCCUPIED', 'RESERVED', 'AVAILABLE')),
    is_active         BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (kuid),
    UNIQUE (room_kuid, bed_no),
    CONSTRAINT fk_bed_room FOREIGN KEY (room_kuid) REFERENCES room (kuid) ON DELETE CASCADE
);

CREATE INDEX idx_bed_room_kuid ON bed (room_kuid);

-- =============================================================
-- RESIDENT
-- =============================================================
CREATE TABLE resident (
    kuid                 CHAR(32)    NOT NULL DEFAULT REPLACE(gen_random_uuid()::text, '-', ''),
    user_kuid            CHAR(32)    NOT NULL,
    assigned_bed_kuid    CHAR(32),                      
    type                 VARCHAR(10) NOT NULL CHECK (type IN ('ONLINE', 'WALK-IN')),
    emergency_contact_1  VARCHAR(20),
    emergency_contact_2  VARCHAR(20),
    is_active            BOOLEAN     NOT NULL DEFAULT TRUE,
    check_in_date        DATE,
    checkout_out_date    DATE,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (kuid),
    CONSTRAINT fk_resident_user FOREIGN KEY (user_kuid) REFERENCES "user" (kuid) ON DELETE RESTRICT,
    CONSTRAINT fk_resident_bed  FOREIGN KEY (assigned_bed_kuid) REFERENCES bed (kuid) ON DELETE SET NULL
);

CREATE INDEX idx_resident_user_kuid ON resident (user_kuid);
CREATE INDEX idx_resident_bed_kuid  ON resident (assigned_bed_kuid);

-- =============================================================
-- RESIDENT_MONTHLY_RENT
-- =============================================================
CREATE TABLE resident_monthly_rent (
    kuid             CHAR(32)       NOT NULL DEFAULT REPLACE(gen_random_uuid()::text, '-', ''),
    resident_kuid    CHAR(32)       NOT NULL,
    rent_period      CHAR(7)        NOT NULL,  -- format: YYYY-MM
    total_amount     NUMERIC(10, 2) NOT NULL,
    due_date         DATE           NOT NULL,
    status           VARCHAR(10)    NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PAID')),
    created_at       TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    PRIMARY KEY (kuid),
    UNIQUE (resident_kuid, rent_period),
    CONSTRAINT fk_rmr_resident FOREIGN KEY (resident_kuid) REFERENCES resident (kuid) ON DELETE RESTRICT
);

CREATE INDEX idx_rmr_resident_kuid ON resident_monthly_rent (resident_kuid);


-- =============================================================
-- PAYMENT_ACCOUNT
-- =============================================================
CREATE TABLE payment_account (
    kuid              CHAR(32)     NOT NULL DEFAULT REPLACE(gen_random_uuid()::text, '-', ''),
    hostel_kuid       CHAR(32)     NOT NULL,
    account_type_kuid CHAR(32)     NOT NULL,
    account_title     VARCHAR(255) NOT NULL,
    account_number    VARCHAR(50)  NOT NULL,
    bank_name         VARCHAR(255),
    is_active         BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    PRIMARY KEY (kuid),
    CONSTRAINT fk_pa_account_type FOREIGN KEY (account_type_kuid) REFERENCES account_type (kuid) ON DELETE RESTRICT,
    CONSTRAINT fk_pa_hostel FOREIGN KEY (hostel_kuid) REFERENCES hostel (kuid) ON DELETE CASCADE
);

CREATE INDEX idx_pa_hostel_kuid       ON payment_account (hostel_kuid);
CREATE INDEX idx_pa_account_type_kuid ON payment_account (account_type_kuid);

-- =============================================================
-- PAYMENT
-- =============================================================
CREATE TABLE payment (
    kuid                   CHAR(32)      NOT NULL DEFAULT REPLACE(gen_random_uuid()::text, '-', ''),
    user_kuid              CHAR(32)      NOT NULL,
    payment_type_kuid      CHAR(32)      NOT NULL,
    payment_account_kuid   CHAR(32)      NOT NULL,
    hostel_kuid            CHAR(32)      NOT NULL,
    room_kuid              CHAR(32)      NOT NULL,
    bed_kuid               CHAR(32)      NOT NULL,
    payment_method         VARCHAR(50),
    amount                 NUMERIC(15,2) NOT NULL,
    payment_attachment_url TEXT,
    txn_reference          VARCHAR(255)  UNIQUE,
    status                 VARCHAR(20)   NOT NULL DEFAULT 'PENDING'
                            CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED')),
    reviewed_by_user_kuid  CHAR(32),
    reviewed_at            TIMESTAMPTZ,
    verification_status    VARCHAR(20)
                               CHECK (verification_status IN ('UNDER-REVIEW', 'APPROVED', 'REJECTED')),
    rejection_reason       TEXT,
    created_at             TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at             TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    PRIMARY KEY (kuid),
    CONSTRAINT fk_payment_user         FOREIGN KEY (user_kuid)            REFERENCES "user"        (kuid) ON DELETE RESTRICT,
    CONSTRAINT fk_payment_type         FOREIGN KEY (payment_type_kuid)    REFERENCES payment_type  (kuid) ON DELETE RESTRICT,
    CONSTRAINT fk_payment_account      FOREIGN KEY (payment_account_kuid) REFERENCES payment_account (kuid) ON DELETE RESTRICT,
    CONSTRAINT fk_payment_hostel       FOREIGN KEY (hostel_kuid)         REFERENCES hostel       (kuid) ON DELETE RESTRICT,
    CONSTRAINT fk_payment_room         FOREIGN KEY (room_kuid)           REFERENCES room         (kuid) ON DELETE RESTRICT,
    CONSTRAINT fk_payment_bed          FOREIGN KEY (bed_kuid)            REFERENCES bed          (kuid) ON DELETE RESTRICT,
    CONSTRAINT fk_payment_reviewed_by  FOREIGN KEY (reviewed_by_user_kuid) REFERENCES "user"       (kuid) ON DELETE SET NULL
);

CREATE INDEX idx_payment_user_kuid            ON payment (user_kuid);
CREATE INDEX idx_payment_type_kuid            ON payment (payment_type_kuid);
CREATE INDEX idx_payment_account_kuid         ON payment (payment_account_kuid);
CREATE INDEX idx_payment_hostel_kuid          ON payment (hostel_kuid);
CREATE INDEX idx_payment_room_kuid            ON payment (room_kuid);
CREATE INDEX idx_payment_bed_kuid             ON payment (bed_kuid);
CREATE INDEX idx_payment_reviewed_by_user_kuid ON payment (reviewed_by_user_kuid);


-- =============================================================
-- BED_LOCK
-- =============================================================
CREATE TABLE bed_lock (
    kuid                CHAR(32)    NOT NULL DEFAULT REPLACE(gen_random_uuid()::text, '-', ''),
    bed_kuid            CHAR(32)    NOT NULL,
    locked_by_user_kuid CHAR(32)    NOT NULL,
    lock_reason         VARCHAR(20) NOT NULL CHECK (lock_reason IN ('ONLINE_BOOKING', 'ADMIN_HOLD')),
    status              VARCHAR(10) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','EXPIRED','RELEASED')),
    locked_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at          TIMESTAMPTZ NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (kuid),
    CONSTRAINT fk_bl_bed             FOREIGN KEY (bed_kuid)            REFERENCES bed (kuid) ON DELETE CASCADE,
    CONSTRAINT fk_bl_locked_by_user  FOREIGN KEY (locked_by_user_kuid) REFERENCES "user" (kuid) ON DELETE RESTRICT
);

CREATE INDEX idx_bl_bed_kuid            ON bed_lock (bed_kuid);
CREATE INDEX idx_bl_locked_by_user_kuid ON bed_lock (locked_by_user_kuid);

-- =============================================================
-- BED_BOOKING
-- =============================================================
CREATE TABLE bed_booking (
    kuid                    CHAR(32)    NOT NULL DEFAULT REPLACE(gen_random_uuid()::text, '-', ''),
    user_kuid               CHAR(32)    NOT NULL,
    hostel_kuid             CHAR(32)    NOT NULL,
    bed_kuid                CHAR(32)    NOT NULL,
    booking_type            VARCHAR(10) NOT NULL CHECK (booking_type IN ('ONLINE','WALK_IN')),
    status                  VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','CONFIRMED','CANCELLED','EXPIRED')),
    check_in_date           DATE,
    expected_checkin_before TIMESTAMPTZ,
    bed_lock_kuid           CHAR(32),
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (kuid),
    CONSTRAINT fk_bb_user     FOREIGN KEY (user_kuid)     REFERENCES "user"    (kuid) ON DELETE RESTRICT,
    CONSTRAINT fk_bb_hostel   FOREIGN KEY (hostel_kuid)   REFERENCES hostel    (kuid) ON DELETE RESTRICT,
    CONSTRAINT fk_bb_bed      FOREIGN KEY (bed_kuid)      REFERENCES bed       (kuid) ON DELETE RESTRICT,
    CONSTRAINT fk_bb_bed_lock FOREIGN KEY (bed_lock_kuid) REFERENCES bed_lock (kuid) ON DELETE SET NULL
);

CREATE INDEX idx_bb_user_kuid     ON bed_booking (user_kuid);
CREATE INDEX idx_bb_hostel_kuid   ON bed_booking (hostel_kuid);
CREATE INDEX idx_bb_bed_kuid      ON bed_booking (bed_kuid);
CREATE INDEX idx_bb_bed_lock_kuid ON bed_booking (bed_lock_kuid);

-- =============================================================
-- HOSTEL_FACILITY
-- =============================================================
CREATE TABLE hostel_facility (
    kuid          CHAR(32)    NOT NULL DEFAULT REPLACE(gen_random_uuid()::text, '-', ''),
    hostel_kuid   CHAR(32)    NOT NULL,
    facility_kuid CHAR(32)    NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (kuid),
    UNIQUE (hostel_kuid, facility_kuid),
    CONSTRAINT fk_hf_hostel   FOREIGN KEY (hostel_kuid)   REFERENCES hostel     (kuid) ON DELETE CASCADE,
    CONSTRAINT fk_hf_facility FOREIGN KEY (facility_kuid) REFERENCES facilities (kuid) ON DELETE CASCADE
);

CREATE INDEX idx_hf_hostel_kuid   ON hostel_facility (hostel_kuid);
CREATE INDEX idx_hf_facility_kuid ON hostel_facility (facility_kuid);

-- =============================================================
-- ROOM_FACILITY
-- =============================================================
CREATE TABLE room_facility (
    kuid          CHAR(32)    NOT NULL DEFAULT REPLACE(gen_random_uuid()::text, '-', ''),
    room_kuid     CHAR(32)    NOT NULL,
    facility_kuid CHAR(32)    NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (kuid),
    UNIQUE (room_kuid, facility_kuid),
    CONSTRAINT fk_rf_facility FOREIGN KEY (facility_kuid) REFERENCES facilities (kuid) ON DELETE CASCADE,
    CONSTRAINT fk_rf_room     FOREIGN KEY (room_kuid)     REFERENCES room       (kuid) ON DELETE CASCADE
);

CREATE INDEX idx_rf_room_kuid     ON room_facility (room_kuid);
CREATE INDEX idx_rf_facility_kuid ON room_facility (facility_kuid);


-- =============================================================
-- ROOM_FACILITY_CHARGE
-- =============================================================
CREATE TABLE room_facility_charge (
    kuid          CHAR(32)       NOT NULL DEFAULT REPLACE(gen_random_uuid()::text, '-', ''),
    room_kuid     CHAR(32)       NOT NULL,
    facility_kuid CHAR(32)       NOT NULL,
    billing_logic VARCHAR(50)    NOT NULL CHECK (billing_logic IN ('INCLUDED_IN_FEE', 'UNIT_BASED_BILL')),
    fixed_amount  NUMERIC(15,2),
    rate_per_unit NUMERIC(15,2),
    unit_type     VARCHAR(50),
    created_at    TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    PRIMARY KEY (kuid),
    UNIQUE (room_kuid, facility_kuid),
    CONSTRAINT fk_rfc_room     FOREIGN KEY (room_kuid)     REFERENCES room       (kuid) ON DELETE CASCADE,
    CONSTRAINT fk_rfc_facility FOREIGN KEY (facility_kuid) REFERENCES facilities (kuid) ON DELETE CASCADE
);

CREATE INDEX idx_rfc_room_kuid     ON room_facility_charge (room_kuid);
CREATE INDEX idx_rfc_facility_kuid ON room_facility_charge (facility_kuid);


-- =============================================================
-- WASHROOM
-- =============================================================
CREATE TABLE washroom (
    kuid        CHAR(32)     NOT NULL DEFAULT REPLACE(gen_random_uuid()::text, '-', ''),
    room_kuid   CHAR(32)     NOT NULL,
    name        VARCHAR(100),
    photos      TEXT[],
    is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    PRIMARY KEY (kuid),
    CONSTRAINT fk_washroom_room FOREIGN KEY (room_kuid) REFERENCES room (kuid) ON DELETE CASCADE
);

CREATE INDEX idx_washroom_room_kuid ON washroom (room_kuid);


-- =============================================================
-- WASHROOM_FACILITIES
-- =============================================================
CREATE TABLE washroom_facilities (
    kuid          CHAR(32)    NOT NULL DEFAULT REPLACE(gen_random_uuid()::text, '-', ''),
    washroom_kuid CHAR(32)    NOT NULL,
    facility_kuid CHAR(32)    NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (kuid),
    UNIQUE (washroom_kuid, facility_kuid),
    CONSTRAINT fk_wf_facility  FOREIGN KEY (facility_kuid)  REFERENCES facilities (kuid) ON DELETE CASCADE,
    CONSTRAINT fk_wf_washroom  FOREIGN KEY (washroom_kuid) REFERENCES washroom   (kuid) ON DELETE CASCADE
);

CREATE INDEX idx_wf_washroom_kuid ON washroom_facilities (washroom_kuid);
CREATE INDEX idx_wf_facility_kuid ON washroom_facilities (facility_kuid);


-- =============================================================
-- BILLING_USAGE_LOG
-- =============================================================
CREATE TABLE billing_usage_log (
    kuid        CHAR(32)       NOT NULL DEFAULT REPLACE(gen_random_uuid()::text, '-', ''),
    room_kuid   CHAR(32)       NOT NULL,
    code        VARCHAR(50),
    units       NUMERIC(10,2),
    created_at  TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    PRIMARY KEY (kuid),
    CONSTRAINT fk_bul_room FOREIGN KEY (room_kuid) REFERENCES room (kuid) ON DELETE CASCADE
);

CREATE INDEX idx_bul_room_kuid ON billing_usage_log (room_kuid);
