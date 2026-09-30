CREATE TABLE IF NOT EXISTS garages (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  address TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  description TEXT,
  price_pence INTEGER NOT NULL,
  duration_minutes INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL,
  phone VARCHAR(40) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vehicles (
  id SERIAL PRIMARY KEY,
  registration VARCHAR(20) UNIQUE NOT NULL,
  make VARCHAR(80),
  model VARCHAR(120),
  colour VARCHAR(50),
  fuel_type VARCHAR(50),
  year INTEGER,
  engine_capacity INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customers(id),
  vehicle_id INTEGER NOT NULL REFERENCES vehicles(id),
  garage_id INTEGER NOT NULL REFERENCES garages(id),
  service_id INTEGER NOT NULL REFERENCES services(id),
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'confirmed',
  payment_status VARCHAR(30) NOT NULL DEFAULT 'unpaid',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO garages (name, address)
SELECT 'Worcester Auto Centre', 'Worcester, Worcestershire'
WHERE NOT EXISTS (SELECT 1 FROM garages);

INSERT INTO services (name, description, price_pence, duration_minutes)
SELECT * FROM (VALUES
  ('MOT Test', 'Class 4 MOT test', 5485, 45),
  ('Full Service', 'Comprehensive annual vehicle service', 18000, 120),
  ('Oil & Filter Change', 'Engine oil and filter replacement', 8000, 45),
  ('Brake Inspection', 'Brake pads, discs and fluid inspection', 6000, 45),
  ('Diagnostics', 'Electronic fault-code diagnostic scan', 5000, 30)
) AS s(name, description, price_pence, duration_minutes)
WHERE NOT EXISTS (SELECT 1 FROM services);
