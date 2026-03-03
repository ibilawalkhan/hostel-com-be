CREATE TYPE hostel_status AS ENUM ('active', 'inactive');
CREATE TYPE verification_badge_status AS ENUM ('verified', 'un_verified');

ALTER TABLE hostel
ADD COLUMN status hostel_status DEFAULT 'active',
ADD COLUMN verification_badge verification_badge_status DEFAULT 'un_verified';