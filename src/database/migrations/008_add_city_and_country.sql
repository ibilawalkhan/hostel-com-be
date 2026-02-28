BEGIN;

CREATE TABLE city (
    kuid CHAR(32) NOT NULL DEFAULT REPLACE(gen_random_uuid()::text, '-', ''),
    city_name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY(kuid)
);

CREATE TABLE area (
    kuid CHAR(32) NOT NULL DEFAULT REPLACE(gen_random_uuid()::text, '-', ''),
    area_name VARCHAR(100) NOT NULL,
    city_kuid CHAR(32) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_area_city FOREIGN KEY (city_kuid) REFERENCES city(kuid),
    CONSTRAINT uq_area_city_area UNIQUE(city_kuid, area_name),
    PRIMARY KEY(kuid)
);

ALTER TABLE hostel
ADD COLUMN city_kuid CHAR(32),
ADD COLUMN area_kuid CHAR(32);

INSERT INTO city (city_name) VALUES ('Islamabad');

INSERT INTO area (area_name, city_kuid)
VALUES ('Hostel City', (SELECT kuid FROM city WHERE city_name = 'Islamabad'));

UPDATE hostel
SET city_kuid = (SELECT kuid FROM city WHERE city_name = 'Islamabad'),
    area_kuid = (SELECT kuid FROM area WHERE area_name = 'Hostel City' AND city_kuid = (SELECT kuid FROM city WHERE city_name = 'Islamabad'))
WHERE city = 'Islamabad' AND area_kuid IS NULL;

ALTER TABLE hostel
DROP COLUMN IF EXISTS city;

ALTER TABLE hostel
DROP COLUMN IF EXISTS area;

ALTER TABLE hostel
ADD CONSTRAINT fk_hostel_city FOREIGN KEY (city_kuid) REFERENCES city(kuid),
ADD CONSTRAINT fk_hostel_area FOREIGN KEY (area_kuid) REFERENCES area(kuid);

COMMIT;