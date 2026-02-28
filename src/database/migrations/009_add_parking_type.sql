DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'parking_type_enum') THEN
        CREATE TYPE parking_type_enum AS ENUM ('car', 'bike', 'both', 'none');
    END IF;
END$$;

ALTER TABLE hostel
ADD COLUMN IF NOT EXISTS parking_type parking_type_enum DEFAULT 'none';