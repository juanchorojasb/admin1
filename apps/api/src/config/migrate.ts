import 'dotenv/config'
import { query } from './db'

async function migrate() {
  console.log('🚀 Ejecutando migraciones...')

  await query(`
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
  `)

  // ─── Users ───────────────────────────────────────────────────────────────────
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      email           VARCHAR(255) UNIQUE NOT NULL,
      password_hash   VARCHAR(255) NOT NULL,
      role            VARCHAR(20) NOT NULL DEFAULT 'cliente'
                        CHECK (role IN ('admin','cliente','freelance','aliado')),
      first_name      VARCHAR(100) NOT NULL,
      last_name       VARCHAR(100) NOT NULL,
      phone           VARCHAR(20),
      document_id     VARCHAR(50),
      avatar_url      TEXT,
      referral_code   VARCHAR(20) UNIQUE,
      referred_by     UUID REFERENCES users(id) ON DELETE SET NULL,
      is_active       BOOLEAN NOT NULL DEFAULT true,
      email_verified  BOOLEAN NOT NULL DEFAULT false,
      created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `)

  await query(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`)
  await query(`CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);`)
  await query(`CREATE INDEX IF NOT EXISTS idx_users_referral ON users(referral_code);`)

  // ─── Refresh tokens ───────────────────────────────────────────────────────────
  await query(`
    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash  VARCHAR(255) NOT NULL,
      expires_at  TIMESTAMPTZ NOT NULL,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `)
  await query(`CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id);`)
  await query(`CREATE INDEX IF NOT EXISTS idx_refresh_tokens_hash ON refresh_tokens(token_hash);`)

  // ─── Freelance profiles ───────────────────────────────────────────────────────
  await query(`
    CREATE TABLE IF NOT EXISTS freelance_profiles (
      id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id           UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      commission_rate   NUMERIC(5,2) NOT NULL DEFAULT 10.00,
      bank_name         VARCHAR(100),
      bank_account      VARCHAR(50),
      bank_account_type VARCHAR(20) CHECK (bank_account_type IN ('ahorros','corriente')),
      created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `)

  // ─── Aliado profiles ──────────────────────────────────────────────────────────
  await query(`
    CREATE TABLE IF NOT EXISTS aliado_profiles (
      id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id       UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      business_name VARCHAR(200) NOT NULL,
      aliado_type   VARCHAR(30) NOT NULL
                      CHECK (aliado_type IN ('ecohotel','transporte','restaurante','guia','otro')),
      description   TEXT,
      address       VARCHAR(300),
      city          VARCHAR(100),
      nit           VARCHAR(30),
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `)

  // ─── Tours ────────────────────────────────────────────────────────────────────
  await query(`
    CREATE TABLE IF NOT EXISTS tours (
      id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      slug              VARCHAR(200) UNIQUE NOT NULL,
      name              VARCHAR(200) NOT NULL,
      internal_name     VARCHAR(50),
      tour_type         VARCHAR(20) NOT NULL
                          CHECK (tour_type IN ('pasadia','1n2d','2n3d','multidia')),
      destination       VARCHAR(200) NOT NULL,
      description       TEXT,
      itinerary         JSONB,
      excludes          TEXT[],
      recommendations   TEXT[],
      restrictions      TEXT[],
      what_to_bring     TEXT[],
      base_price        NUMERIC(12,2) NOT NULL,
      price_child       NUMERIC(12,2),
      departure_cities  TEXT[],
      duration_days     INT NOT NULL DEFAULT 1,
      min_persons       INT NOT NULL DEFAULT 1,
      max_persons       INT NOT NULL DEFAULT 20,
      difficulty        VARCHAR(20) NOT NULL DEFAULT 'moderado'
                          CHECK (difficulty IN ('facil','moderado','dificil')),
      cover_image       TEXT,
      gallery           TEXT[],
      is_featured       BOOLEAN NOT NULL DEFAULT false,
      is_active         BOOLEAN NOT NULL DEFAULT true,
      seo_title         VARCHAR(200),
      seo_description   VARCHAR(300),
      created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `)

  await query(`CREATE INDEX IF NOT EXISTS idx_tours_slug ON tours(slug);`)
  await query(`CREATE INDEX IF NOT EXISTS idx_tours_active ON tours(is_active);`)
  await query(`CREATE INDEX IF NOT EXISTS idx_tours_featured ON tours(is_featured);`)

  // ─── Tour includes ────────────────────────────────────────────────────────────
  await query(`
    CREATE TABLE IF NOT EXISTS tour_includes (
      id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      tour_id        UUID UNIQUE NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
      transport      BOOLEAN NOT NULL DEFAULT false,
      breakfast      BOOLEAN NOT NULL DEFAULT false,
      lunch          BOOLEAN NOT NULL DEFAULT false,
      snacks         BOOLEAN NOT NULL DEFAULT false,
      insurance      BOOLEAN NOT NULL DEFAULT false,
      guide          BOOLEAN NOT NULL DEFAULT false,
      park_entrance  BOOLEAN NOT NULL DEFAULT false,
      souvenir       BOOLEAN NOT NULL DEFAULT false,
      accommodation  BOOLEAN NOT NULL DEFAULT false,
      activity       VARCHAR(200),
      notes          TEXT
    );
  `)

  // ─── Tour availability ────────────────────────────────────────────────────────
  await query(`
    CREATE TABLE IF NOT EXISTS tour_availability (
      id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      tour_id          UUID NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
      date             DATE NOT NULL,
      departure_city   VARCHAR(100) NOT NULL,
      total_spots      INT NOT NULL,
      available_spots  INT NOT NULL,
      price_override   NUMERIC(12,2),
      is_active        BOOLEAN NOT NULL DEFAULT true,
      created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (tour_id, date, departure_city)
    );
  `)
  await query(`CREATE INDEX IF NOT EXISTS idx_availability_tour ON tour_availability(tour_id);`)
  await query(`CREATE INDEX IF NOT EXISTS idx_availability_date ON tour_availability(date);`)

  // ─── Reservations ─────────────────────────────────────────────────────────────
  await query(`
    CREATE TABLE IF NOT EXISTS reservations (
      id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      reservation_number  VARCHAR(20) UNIQUE NOT NULL,
      user_id             UUID REFERENCES users(id) ON DELETE SET NULL,
      tour_id             UUID NOT NULL REFERENCES tours(id),
      availability_id     UUID REFERENCES tour_availability(id),
      freelance_id        UUID REFERENCES users(id),
      num_adults          INT NOT NULL DEFAULT 1,
      num_children        INT NOT NULL DEFAULT 0,
      departure_city      VARCHAR(100) NOT NULL,
      total_amount        NUMERIC(12,2) NOT NULL,
      deposit_amount      NUMERIC(12,2) NOT NULL,
      balance_amount      NUMERIC(12,2) NOT NULL,
      commission_amount   NUMERIC(12,2) NOT NULL DEFAULT 0,
      commission_paid     BOOLEAN NOT NULL DEFAULT false,
      commission_paid_at  TIMESTAMPTZ,
      contact_name        VARCHAR(200) NOT NULL,
      contact_phone       VARCHAR(20) NOT NULL,
      contact_email       VARCHAR(255) NOT NULL,
      special_requests    TEXT,
      internal_notes      TEXT,
      status              VARCHAR(20) NOT NULL DEFAULT 'pendiente'
                            CHECK (status IN ('pendiente','confirmada','pagada','cancelada','completada')),
      payment_status      VARCHAR(20) NOT NULL DEFAULT 'pendiente'
                            CHECK (payment_status IN ('pendiente','parcial','completo','reembolsado')),
      deposit_paid_at     TIMESTAMPTZ,
      balance_paid_at     TIMESTAMPTZ,
      created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `)
  await query(`CREATE INDEX IF NOT EXISTS idx_reservations_user ON reservations(user_id);`)
  await query(`CREATE INDEX IF NOT EXISTS idx_reservations_tour ON reservations(tour_id);`)
  await query(`CREATE INDEX IF NOT EXISTS idx_reservations_freelance ON reservations(freelance_id);`)
  await query(`CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);`)
  await query(`CREATE INDEX IF NOT EXISTS idx_reservations_number ON reservations(reservation_number);`)

  // ─── Payments ─────────────────────────────────────────────────────────────────
  await query(`
    CREATE TABLE IF NOT EXISTS payments (
      id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      reservation_id          UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
      amount                  NUMERIC(12,2) NOT NULL,
      payment_method          VARCHAR(30) NOT NULL,
      gateway                 VARCHAR(30),
      gateway_transaction_id  VARCHAR(200),
      status                  VARCHAR(20) NOT NULL DEFAULT 'completado',
      receipt_url             TEXT,
      paid_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `)
  await query(`CREATE INDEX IF NOT EXISTS idx_payments_reservation ON payments(reservation_id);`)

  // ─── Wompi transactions ───────────────────────────────────────────────────────
  await query(`
    CREATE TABLE IF NOT EXISTS wompi_transactions (
      id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      reservation_id  UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
      reference       VARCHAR(100) UNIQUE NOT NULL,
      wompi_id        VARCHAR(100),
      amount_cents    BIGINT NOT NULL,
      status          VARCHAR(20) NOT NULL DEFAULT 'PENDING',
      created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `)
  await query(`CREATE INDEX IF NOT EXISTS idx_wompi_reference ON wompi_transactions(reference);`)

  // ─── Badges ───────────────────────────────────────────────────────────────────
  await query(`
    CREATE TABLE IF NOT EXISTS badges (
      id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name             VARCHAR(100) UNIQUE NOT NULL,
      description      TEXT,
      icon             VARCHAR(10),
      condition_type   VARCHAR(50),
      condition_value  INT DEFAULT 1,
      created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `)

  // ─── User badges (earned) ─────────────────────────────────────────────────────
  await query(`
    CREATE TABLE IF NOT EXISTS user_badges (
      id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      badge_id    UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
      earned_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (user_id, badge_id)
    );
  `)
  await query(`CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges(user_id);`)

  // ─── User parks visited ───────────────────────────────────────────────────────
  await query(`
    CREATE TABLE IF NOT EXISTS user_parks_visited (
      id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      park_name   VARCHAR(200) NOT NULL,
      tour_id     UUID REFERENCES tours(id),
      visited_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (user_id, park_name)
    );
  `)
  await query(`CREATE INDEX IF NOT EXISTS idx_parks_user ON user_parks_visited(user_id);`)

  // ─── Site config ──────────────────────────────────────────────────────────────
  await query(`
    CREATE TABLE IF NOT EXISTS site_config (
      id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      key         VARCHAR(100) UNIQUE NOT NULL,
      value       JSONB NOT NULL,
      updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `)

  const defaultConfigs: { key: string; value: unknown }[] = [
    {
      key: 'hero',
      value: {
        badge: 'Ecoturismo en PNN Los Nevados · Colombia',
        title1: 'Descubre la naturaleza',
        title2: 'más salvaje de Colombia',
        subtitle: 'Volcanes nevados, selvas vírgenes, valles de palmas de cera y ballenas en el Pacífico. Experiencias ecoturísticas únicas con guías expertos.',
        btn1: 'Ver tours',
        btn2: 'Contáctanos',
        stats: [
          { icon: '🌿', label: '+9 destinos ecológicos' },
          { icon: '🦅', label: '+350 especies de aves' },
          { icon: '⭐', label: 'Guías certificados' },
        ],
      },
    },
    {
      key: 'parques',
      value: [
        { icon: '🏔️', name: 'PNN Los Nevados', desc: 'Volcanes y páramo', color: 'from-blue-500 to-blue-700' },
        { icon: '🌿', name: 'Selva de Florencia', desc: 'Bosque Andes-Amazonía', color: 'from-green-500 to-green-700' },
        { icon: '🌴', name: 'Valle del Cocora', desc: 'Palmas de cera', color: 'from-teal-500 to-teal-700' },
        { icon: '🐋', name: 'Bahía Solano', desc: 'Ballenas del Pacífico', color: 'from-cyan-500 to-cyan-700' },
      ],
    },
    {
      key: 'nosotros',
      value: {
        label: 'QUIÉNES SOMOS',
        title: 'Ecoturismo responsable en Colombia',
        text1: 'Somos una agencia especializada en experiencias ecoturísticas en el Eje Cafetero y PNN Los Nevados. Nuestro enfoque combina aventura, educación ambiental y responsabilidad con las comunidades locales.',
        text2: 'Trabajamos con guías certificados, aliados locales verificados y nos comprometemos con la conservación de los ecosistemas que visitamos.',
        stats: [
          { value: '9+', label: 'Destinos' },
          { value: '500+', label: 'Viajeros' },
          { value: '5★', label: 'Calificación' },
        ],
        features: [
          { icon: '🦅', title: 'Avistamiento de aves', desc: 'Más de 350 especies registradas' },
          { icon: '🌿', title: 'Conservación', desc: 'Turismo de bajo impacto' },
          { icon: '🏔️', title: 'Alta montaña', desc: 'Guías certificados en altitud' },
          { icon: '👥', title: 'Comunidades', desc: 'Apoyo a familias locales' },
        ],
      },
    },
    {
      key: 'cta',
      value: {
        title: '¿Listo para la aventura?',
        subtitle: 'Reserva en línea con pago seguro. Depósito del 30% para confirmar tu cupo.',
        whatsapp: '573000000000',
      },
    },
    {
      key: 'contacto',
      value: {
        phone: '+57 300 000 0000',
        phoneHref: '573000000000',
        email: 'info@avesynaturaleza.travel',
        instagram: '@avesynaturaleza',
        whatsapp: '573000000000',
      },
    },
    {
      key: 'footer',
      value: { copyright: '© 2024 Aves y Naturaleza · Ecoturismo responsable en Colombia' },
    },
  ]

  for (const c of defaultConfigs) {
    await query(
      `INSERT INTO site_config (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING`,
      [c.key, JSON.stringify(c.value)]
    )
  }

  console.log('✅ Migraciones completadas exitosamente!')
  process.exit(0)
}

migrate().catch((err) => {
  console.error('❌ Error en migración:', err)
  process.exit(1)
})
