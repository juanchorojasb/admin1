-- Aves y Naturaleza - Schema inicial

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tipos enumerados
CREATE TYPE user_role AS ENUM ('admin', 'cliente', 'freelance', 'aliado');
CREATE TYPE tour_type AS ENUM ('pasadia', '1n2d', '2n3d', 'multidia');
CREATE TYPE reservation_status AS ENUM ('pendiente', 'confirmada', 'pagada', 'cancelada', 'completada');
CREATE TYPE payment_status AS ENUM ('pendiente', 'parcial', 'completo', 'reembolsado');
CREATE TYPE aliado_type AS ENUM ('ecohotel', 'transporte', 'restaurante', 'otro');

-- Usuarios
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role user_role NOT NULL DEFAULT 'cliente',
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  document_id VARCHAR(30),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  referral_code VARCHAR(20) UNIQUE,
  referred_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Perfil Freelance
CREATE TABLE freelance_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  commission_rate DECIMAL(5,2) DEFAULT 10.00,
  bank_name VARCHAR(100),
  bank_account VARCHAR(50),
  bank_account_type VARCHAR(20),
  total_earned DECIMAL(12,2) DEFAULT 0,
  total_paid DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Perfil Aliado
CREATE TABLE aliado_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  business_name VARCHAR(200) NOT NULL,
  aliado_type aliado_type NOT NULL,
  description TEXT,
  address TEXT,
  city VARCHAR(100),
  nit VARCHAR(30),
  rating DECIMAL(3,2) DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tours / Planes
CREATE TABLE tours (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(200) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  internal_name VARCHAR(200),
  tour_type tour_type NOT NULL,
  destination VARCHAR(200) NOT NULL,
  description TEXT,
  itinerary JSONB,
  includes JSONB,
  excludes JSONB,
  recommendations JSONB,
  restrictions JSONB,
  what_to_bring JSONB,
  base_price DECIMAL(12,2) NOT NULL,
  price_child DECIMAL(12,2),
  departure_cities JSONB,
  duration_days INTEGER DEFAULT 1,
  min_persons INTEGER DEFAULT 1,
  max_persons INTEGER DEFAULT 20,
  difficulty VARCHAR(20) DEFAULT 'moderado',
  cover_image TEXT,
  gallery JSONB,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  seo_title VARCHAR(200),
  seo_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Incluye (transporte, desayuno, almuerzo, snacks, seguro, guia, ingresos, actividad, souvenir, alojamiento)
CREATE TABLE tour_includes (
  tour_id UUID REFERENCES tours(id) ON DELETE CASCADE,
  transport BOOLEAN DEFAULT false,
  breakfast BOOLEAN DEFAULT false,
  lunch BOOLEAN DEFAULT false,
  snacks BOOLEAN DEFAULT false,
  insurance BOOLEAN DEFAULT false,
  guide BOOLEAN DEFAULT false,
  park_entrance BOOLEAN DEFAULT false,
  activity TEXT,
  souvenir BOOLEAN DEFAULT false,
  accommodation BOOLEAN DEFAULT false,
  notes TEXT,
  PRIMARY KEY (tour_id)
);

-- Disponibilidad de tours
CREATE TABLE tour_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tour_id UUID REFERENCES tours(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  departure_city VARCHAR(100),
  total_spots INTEGER NOT NULL,
  available_spots INTEGER NOT NULL,
  price_override DECIMAL(12,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tour_id, date, departure_city)
);

-- Reservas
CREATE TABLE reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reservation_number VARCHAR(20) UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id),
  tour_id UUID REFERENCES tours(id),
  availability_id UUID REFERENCES tour_availability(id),
  freelance_id UUID REFERENCES users(id),
  status reservation_status DEFAULT 'pendiente',
  payment_status payment_status DEFAULT 'pendiente',
  num_adults INTEGER NOT NULL,
  num_children INTEGER DEFAULT 0,
  departure_city VARCHAR(100),
  total_amount DECIMAL(12,2) NOT NULL,
  deposit_amount DECIMAL(12,2),
  deposit_paid_at TIMESTAMPTZ,
  balance_amount DECIMAL(12,2),
  balance_paid_at TIMESTAMPTZ,
  commission_amount DECIMAL(12,2) DEFAULT 0,
  commission_paid BOOLEAN DEFAULT false,
  contact_name VARCHAR(200),
  contact_phone VARCHAR(20),
  contact_email VARCHAR(255),
  special_requests TEXT,
  internal_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pagos
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reservation_id UUID REFERENCES reservations(id),
  amount DECIMAL(12,2) NOT NULL,
  payment_method VARCHAR(50),
  gateway VARCHAR(50),
  gateway_transaction_id VARCHAR(200),
  status VARCHAR(20) DEFAULT 'pendiente',
  receipt_url TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insignias y logros (gamificación)
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(100),
  condition_type VARCHAR(50),
  condition_value INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_badges (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, badge_id)
);

-- Parques visitados por usuario
CREATE TABLE user_parks_visited (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  park_name VARCHAR(200) NOT NULL,
  tour_id UUID REFERENCES tours(id),
  visited_at DATE,
  PRIMARY KEY (user_id, park_name)
);

-- Transacciones Wompi
CREATE TABLE wompi_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reservation_id UUID REFERENCES reservations(id) ON DELETE CASCADE,
  reference VARCHAR(100) UNIQUE NOT NULL,
  wompi_id VARCHAR(200),
  amount_cents INTEGER NOT NULL,
  status VARCHAR(30) DEFAULT 'PENDING',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_wompi_reference ON wompi_transactions(reference);
CREATE INDEX idx_wompi_reservation ON wompi_transactions(reservation_id);

-- Sesiones / Tokens de refresh
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_referral_code ON users(referral_code);
CREATE INDEX idx_tours_slug ON tours(slug);
CREATE INDEX idx_tours_active ON tours(is_active);
CREATE INDEX idx_tour_availability_date ON tour_availability(date);
CREATE INDEX idx_reservations_user ON reservations(user_id);
CREATE INDEX idx_reservations_freelance ON reservations(freelance_id);
CREATE INDEX idx_reservations_status ON reservations(status);

-- Admin por defecto (cambiar password en producción)
INSERT INTO users (email, password_hash, role, first_name, last_name, phone, email_verified)
VALUES (
  'admin@avesynaturaleza.travel',
  crypt('Admin2024!', gen_salt('bf')),
  'admin',
  'Admin',
  'Aves y Naturaleza',
  '3206451470',
  true
);
