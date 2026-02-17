-- =============================================================
-- EXTENSIONS
-- =============================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- for gen_random_uuid()


-- =============================================================
-- WeeklyMenu
-- =============================================================
CREATE TABLE weeklymenu (
    id             SERIAL,
    kuid           CHAR(32)     NOT NULL DEFAULT REPLACE(gen_random_uuid()::text, '-', ''),
    hostel_kuid    CHAR(32)     NOT NULL,
    description    TEXT,
    week_start_date DATE,
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    PRIMARY KEY (id),
    UNIQUE (kuid),
    CONSTRAINT fk_weeklymenu_hostel FOREIGN KEY (hostel_kuid) REFERENCES hostel (kuid) ON DELETE CASCADE
);

CREATE INDEX idx_weeklymenu_hostel_kuid ON weeklymenu (hostel_kuid);


-- =============================================================
-- MenuItem
-- =============================================================
CREATE TABLE menuitem (
    id          SERIAL,
    kuid        CHAR(32)        NOT NULL DEFAULT REPLACE(gen_random_uuid()::text, '-', ''),
    menu_kuid   CHAR(32)        NOT NULL,
    day_of_week VARCHAR(10)     NOT NULL CHECK (day_of_week IN ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY')),
    meal_type   VARCHAR(20)     NOT NULL CHECK (meal_type IN ('BREAKFAST', 'LUNCH', 'DINNER')),
    description TEXT,
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    PRIMARY KEY (id),
    UNIQUE (kuid),
    CONSTRAINT fk_menuitem_menu FOREIGN KEY (menu_kuid) REFERENCES weeklymenu (kuid) ON DELETE CASCADE
);

CREATE INDEX idx_menuitem_menu_kuid ON menuitem (menu_kuid);

-- =============================================================
-- Kitchen
-- =============================================================
CREATE TABLE kitchen (
    id           SERIAL,
    kuid         CHAR(32)     NOT NULL DEFAULT REPLACE(gen_random_uuid()::text, '-', ''),
    hostel_kuid  CHAR(32)     NOT NULL,
    menu_kuid    CHAR(32)     NOT NULL,
    branch       VARCHAR(255),
    name         VARCHAR(255),
    capacity     INTEGER,
    no_of_staff  INTEGER,
    status       VARCHAR(50),
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    PRIMARY KEY (id),
    UNIQUE (kuid),
    CONSTRAINT fk_kitchen_hostel FOREIGN KEY (hostel_kuid) REFERENCES hostel (kuid) ON DELETE CASCADE,
    CONSTRAINT fk_kitchen_menu   FOREIGN KEY (menu_kuid)   REFERENCES weeklymenu (kuid) ON DELETE CASCADE
);

CREATE INDEX idx_kitchen_hostel_kuid ON kitchen (hostel_kuid);
CREATE INDEX idx_kitchen_menu_kuid   ON kitchen (menu_kuid);

-- =============================================================
-- KitchenMenuAssignment
-- =============================================================
CREATE TABLE kitchenmenuassignment (
    id          SERIAL,
    kuid        CHAR(32)     NOT NULL DEFAULT REPLACE(gen_random_uuid()::text, '-', ''),
    kitchen_kuid CHAR(32)    NOT NULL,
    menu_kuid   CHAR(32)     NOT NULL,
    is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    PRIMARY KEY (id),
    UNIQUE (kuid),
    CONSTRAINT fk_kma_kitchen FOREIGN KEY (kitchen_kuid) REFERENCES kitchen (kuid) ON DELETE CASCADE,
    CONSTRAINT fk_kma_menu    FOREIGN KEY (menu_kuid)   REFERENCES weeklymenu (kuid) ON DELETE CASCADE
);

CREATE INDEX idx_kma_kitchen_kuid ON kitchenmenuassignment (kitchen_kuid);
CREATE INDEX idx_kma_menu_kuid    ON kitchenmenuassignment (menu_kuid);

