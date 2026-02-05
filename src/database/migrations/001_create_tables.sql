CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE notification_source AS ENUM ('deadline', 'task_shared', 'comment', 'trail');
CREATE TYPE auth_provider AS ENUM ('google', 'apple', 'github', 'password');
CREATE TYPE plan_type AS ENUM ('free', 'pro', 'premium');

----------- User & Identity Management Tables -----------
CREATE TABLE users (
    kuid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    name VARCHAR(255),
    phone VARCHAR(50),
    avatar_url TEXT,
    last_login TIMESTAMPTZ,
    language VARCHAR(10) DEFAULT 'en',
    theme VARCHAR(20) DEFAULT 'light',
    is_email_notifications BOOLEAN DEFAULT TRUE,
    is_push_notifications BOOLEAN DEFAULT TRUE,
    is_deadline_reminders BOOLEAN DEFAULT TRUE,
    is_collaboration_updates BOOLEAN DEFAULT TRUE,
    is_weekly_digest BOOLEAN DEFAULT TRUE,
    terms_accepted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE auth_accounts (
    kuid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(kuid) ON DELETE CASCADE,
    provider auth_provider NOT NULL,
    provider_user_id TEXT,
    password_hash TEXT,
    access_token TEXT,
    refresh_token TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_devices (
    kuid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_name TEXT,
    user_id UUID NOT NULL REFERENCES users(kuid) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

----------- Subscriptions & Billing Tables -----------
CREATE TABLE plans (
    kuid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type plan_type NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE plan_fees (
    kuid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fee DECIMAL(12, 2) NOT NULL,
    plan_id UUID NOT NULL REFERENCES plans(kuid),
    valid_from DATE NOT NULL,
    valid_to DATE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE billing (
    kuid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(kuid),
    plan_id UUID NOT NULL REFERENCES plans(kuid),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

----------- Tasks & Groups Tables -----------
CREATE TABLE groups (
    kuid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    icon_url TEXT,
    color VARCHAR(7),
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tasks (
    kuid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    group_id UUID REFERENCES groups(kuid) ON DELETE SET NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE deadlines (
    kuid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES tasks(kuid) ON DELETE CASCADE,
    timeline TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

----------- Social & Metadata Tables -----------
CREATE TABLE permissions (
    kuid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(50) NOT NULL,
    description TEXT
);

CREATE TABLE shared_tasks (
    kuid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(kuid),
    task_id UUID NOT NULL REFERENCES tasks(kuid),
    permission_id UUID NOT NULL REFERENCES permissions(kuid),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE comments (
    kuid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content TEXT NOT NULL,
    task_id UUID NOT NULL REFERENCES tasks(kuid) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(kuid),
    parent_id UUID REFERENCES comments(kuid),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ
);

CREATE TABLE photos (
    kuid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES tasks(kuid) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notifications (
    kuid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT,
    description TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    image TEXT,
    source_type notification_source,
    triggering_source_kuid UUID,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE password_resets (
    kuid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(kuid),
    token_hash TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);