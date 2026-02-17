-- =============================================================
-- EXTENSIONS
-- =============================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- for gen_random_uuid()


-- =============================================================
-- Complaint
-- =============================================================
CREATE TABLE complaint (
    id             SERIAL,
    kuid           CHAR(32)     NOT NULL DEFAULT REPLACE(gen_random_uuid()::text, '-', ''),
    hostel_kuid    CHAR(32)     NOT NULL,
    branch_kuid    CHAR(32)     NOT NULL,
    role_kuid      CHAR(32)     NOT NULL,
    category_kuid  CHAR(32)     NOT NULL,
    priority_kuid  CHAR(32)     NOT NULL,
    room_no        VARCHAR(50),
    title          VARCHAR(255),
    description    TEXT,
    attachment_url TEXT,
    status         VARCHAR(20)  NOT NULL DEFAULT 'INPROGRESS' CHECK (status IN ('INPROGRESS', 'RESOVLED')),
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    PRIMARY KEY (id),
    UNIQUE (kuid),
    CONSTRAINT fk_complaint_hostel   FOREIGN KEY (hostel_kuid)   REFERENCES hostel (kuid) ON DELETE CASCADE,
    CONSTRAINT fk_complaint_branch   FOREIGN KEY (branch_kuid)   REFERENCES hostel_branch (kuid) ON DELETE CASCADE,
    CONSTRAINT fk_complaint_role     FOREIGN KEY (role_kuid)     REFERENCES role (kuid) ON DELETE CASCADE,
    CONSTRAINT fk_complaint_category FOREIGN KEY (category_kuid) REFERENCES complaintcategory (kuid) ON DELETE RESTRICT,
    CONSTRAINT fk_complaint_priority FOREIGN KEY (priority_kuid) REFERENCES priority (kuid) ON DELETE RESTRICT
);

CREATE INDEX idx_complaint_hostel_kuid   ON complaint (hostel_kuid);
CREATE INDEX idx_complaint_branch_kuid   ON complaint (branch_kuid);
CREATE INDEX idx_complaint_role_kuid     ON complaint (role_kuid);
CREATE INDEX idx_complaint_category_kuid ON complaint (category_kuid);
CREATE INDEX idx_complaint_priority_kuid ON complaint (priority_kuid);

-- =============================================================
-- Comments
-- =============================================================
CREATE TABLE comments (
    id             SERIAL,
    kuid           CHAR(32)     NOT NULL DEFAULT REPLACE(gen_random_uuid()::text, '-', ''),
    user_kuid      CHAR(32)     NOT NULL,
    parent_kuid    CHAR(32),
    comment        TEXT,
    complaint_kuid CHAR(32)     NOT NULL,
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    PRIMARY KEY (id),
    UNIQUE (kuid),
    CONSTRAINT fk_comments_user      FOREIGN KEY (user_kuid)      REFERENCES "user" (kuid) ON DELETE CASCADE,
    CONSTRAINT fk_comments_parent    FOREIGN KEY (parent_kuid)    REFERENCES comments (kuid) ON DELETE CASCADE,
    CONSTRAINT fk_comments_complaint FOREIGN KEY (complaint_kuid) REFERENCES complaint (kuid) ON DELETE CASCADE
);

CREATE INDEX idx_comments_user_kuid      ON comments (user_kuid);
CREATE INDEX idx_comments_parent_kuid    ON comments (parent_kuid);
CREATE INDEX idx_comments_complaint_kuid ON comments (complaint_kuid);