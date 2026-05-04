import 'dotenv/config'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { query, queryOne } from './db'

async function seed() {
  console.log('🌱 Iniciando seed de datos...')

  // ─── Admin user ──────────────────────────────────────────────────────────────
  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@avesynaturaleza.travel'
  const adminPass = process.env.ADMIN_PASSWORD ?? 'Admin123!'
  const existingAdmin = await queryOne<{ id: string }>('SELECT id FROM users WHERE email = $1', [adminEmail])

  let adminId: string
  if (!existingAdmin) {
    const hash = await bcrypt.hash(adminPass, 12)
    const refCode = crypto.randomBytes(4).toString('hex').toUpperCase()
    const admin = await queryOne<{ id: string }>(
      `INSERT INTO users (email, password_hash, role, first_name, last_name, referral_code)
       VALUES ($1, $2, 'admin', 'Administrador', 'AVN', $3) RETURNING id`,
      [adminEmail, hash, refCode]
    )
    adminId = admin!.id
    console.log(`✅ Admin creado: ${adminEmail} / ${adminPass}`)
  } else {
    adminId = existingAdmin.id
    console.log('ℹ️  Admin ya existe')
  }

  // ─── Tours reales de Aves y Naturaleza ──────────────────────────────────────
  const tours = [
    {
      slug: 'nevado-ruiz-manizales',
      name: 'Nevado del Ruiz desde Manizales',
      internalName: 'NRM-01',
      tourType: 'pasadia',
      destination: 'PNN Los Nevados',
      description: 'Ascenso al volcán nevado más activo de Colombia. Recorrido por el Cráter del Arenas, avistamiento de patos de páramo y frailejones gigantes. Salida desde Manizales con transporte incluido hasta el punto de acceso. Incluye guía especializado, refrigerio de montaña y cobertura básica de seguros.',
      basePrice: 185000,
      priceChild: 120000,
      departureCities: ['Manizales'],
      durationDays: 1,
      minPersons: 4,
      maxPersons: 15,
      difficulty: 'dificil',
      isFeatured: true,
    },
    {
      slug: 'nevado-ruiz-pereira',
      name: 'Nevado del Ruiz desde Pereira',
      internalName: 'NRP-01',
      tourType: 'pasadia',
      destination: 'PNN Los Nevados',
      description: 'Experiencia única en el volcán Nevado del Ruiz partiendo desde Pereira. Incluye transporte panorámico por la Autopista del Café, parada en estación meteorológica, ascenso a 4.900 msnm y avistamiento de cóndores. Ropa de abrigo y bastones incluidos.',
      basePrice: 195000,
      priceChild: 130000,
      departureCities: ['Pereira', 'Dosquebradas'],
      durationDays: 1,
      minPersons: 4,
      maxPersons: 15,
      difficulty: 'dificil',
      isFeatured: true,
    },
    {
      slug: 'cocora-salento',
      name: 'Valle del Cocora y Salento',
      internalName: 'VCS-01',
      tourType: 'pasadia',
      destination: 'Valle del Cocora',
      description: 'Trekking entre las palmas de cera más altas del mundo, árbol nacional de Colombia. Recorrido circular por el valle con avistamiento de colibríes, cruce de puentes colgantes y visita al pueblo de Salento. Almuerzo típico quindiano incluido.',
      basePrice: 145000,
      priceChild: 95000,
      departureCities: ['Armenia', 'Pereira', 'Manizales'],
      durationDays: 1,
      minPersons: 2,
      maxPersons: 20,
      difficulty: 'moderado',
      isFeatured: true,
    },
    {
      slug: 'norcasia-aventura',
      name: 'Norcasia Aventura - Embalse Amaní',
      internalName: 'NOR-01',
      tourType: '1n2d',
      destination: 'Norcasia, Caldas',
      description: 'Fin de semana de aventura en el Embalse de Amaní. Actividades acuáticas: kayak, pesca deportiva y paseo en lancha. Observación de nutrias y garzas en su hábitat natural. Alojamiento en ecohotel a orillas del embalse, alimentación completa incluida.',
      basePrice: 320000,
      priceChild: 210000,
      departureCities: ['Manizales', 'Bogotá'],
      durationDays: 2,
      minPersons: 4,
      maxPersons: 16,
      difficulty: 'facil',
      isFeatured: false,
    },
    {
      slug: 'norcasia-selva-florencia',
      name: 'Norcasia y Selva de Florencia',
      internalName: 'NOR-02',
      tourType: '2n3d',
      destination: 'PNN Selva de Florencia',
      description: 'Expedición de 3 días al único parque nacional ubicado entre los Andes y la Amazonía. Avistamiento de monos, armadillos y más de 350 especies de aves. Incluye noche de campamento en la selva, guía biólogo especializado y todo el equipo de campo.',
      basePrice: 520000,
      priceChild: 350000,
      departureCities: ['Manizales', 'Bogotá', 'Medellín'],
      durationDays: 3,
      minPersons: 4,
      maxPersons: 10,
      difficulty: 'moderado',
      isFeatured: true,
    },
    {
      slug: 'norcasia-samaná',
      name: 'Norcasia y Río Samaná',
      internalName: 'NOR-03',
      tourType: '1n2d',
      destination: 'Norcasia - Samaná, Caldas',
      description: 'Rafting nivel 3 en el río Samaná Norte, uno de los ríos más emocionantes de Colombia. Senderismo por cañones de guadua, baño en cascadas cristalinas y observación de peces dorado. Alojamiento en finca cafetera, desayuno y cena incluidos.',
      basePrice: 285000,
      priceChild: 180000,
      departureCities: ['Manizales', 'Bogotá'],
      durationDays: 2,
      minPersons: 6,
      maxPersons: 18,
      difficulty: 'moderado',
      isFeatured: false,
    },
    {
      slug: 'ruta-del-cafe',
      name: 'Ruta del Café - Eje Cafetero',
      internalName: 'RCA-01',
      tourType: '2n3d',
      destination: 'Eje Cafetero',
      description: 'Experiencia inmersiva en la cultura cafetera patrimonio de la humanidad. Visita a finca tradicional con proceso completo del café, degustación de varietales especiales, recorrido en Willys, visita a Salento y el Valle del Cocora. Alojamiento en hacienda cafetera boutique.',
      basePrice: 680000,
      priceChild: 420000,
      departureCities: ['Manizales', 'Pereira', 'Armenia', 'Bogotá'],
      durationDays: 3,
      minPersons: 2,
      maxPersons: 12,
      difficulty: 'facil',
      isFeatured: true,
    },
    {
      slug: 'avistamiento-aves-los-nevados',
      name: 'Avistamiento de Aves - PNN Los Nevados',
      internalName: 'AVE-01',
      tourType: 'pasadia',
      destination: 'PNN Los Nevados',
      description: 'Tour especializado para amantes del birding. Recorrido por los diferentes pisos térmicos del parque (páramo, subpáramo, bosque altoandino) con avistamiento de cóndor andino, loro orejiamarillo, pato de torrente y colibríes de páramo. Incluye binoculares, guía ornitólogo y lista de especies.',
      basePrice: 165000,
      priceChild: 95000,
      departureCities: ['Manizales', 'Pereira'],
      durationDays: 1,
      minPersons: 2,
      maxPersons: 10,
      difficulty: 'moderado',
      isFeatured: false,
    },
    {
      slug: 'ballenas-pacifico',
      name: 'Ballenas del Pacífico - Bahía Solano',
      internalName: 'BAL-01',
      tourType: 'multidia',
      destination: 'Bahía Solano, Chocó',
      description: 'Temporada de ballenas jorobadas (julio-octubre). Avistamiento desde lancha zodiac, snorkel en arrecifes del Pacífico, visita a la Cascada del Amor y exploración de manglar. Vuelo Bogotá-Bahía Solano incluido, 4 noches en ecolodge frente al mar, 3 salidas de avistamiento.',
      basePrice: 2850000,
      priceChild: 1950000,
      departureCities: ['Bogotá'],
      durationDays: 5,
      minPersons: 2,
      maxPersons: 8,
      difficulty: 'facil',
      isFeatured: true,
    },
  ]

  for (const tour of tours) {
    const exists = await queryOne<{ id: string }>('SELECT id FROM tours WHERE slug = $1', [tour.slug])
    if (!exists) {
      await query(
        `INSERT INTO tours
           (slug, name, internal_name, tour_type, destination, description, base_price, price_child,
            departure_cities, duration_days, min_persons, max_persons, difficulty, is_featured, is_active)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,true)`,
        [
          tour.slug, tour.name, tour.internalName, tour.tourType, tour.destination,
          tour.description, tour.basePrice, tour.priceChild ?? null,
          JSON.stringify(tour.departureCities), tour.durationDays, tour.minPersons, tour.maxPersons,
          tour.difficulty, tour.isFeatured,
        ]
      )
      console.log(`✅ Tour: ${tour.name}`)
    } else {
      console.log(`ℹ️  Tour ya existe: ${tour.name}`)
    }
  }

  // ─── Badges / Insignias ──────────────────────────────────────────────────────
  const badges = [
    { name: 'Explorador del Nevado', description: 'Realizaste tu primer tour al Nevado del Ruiz', icon: '🏔️', conditionType: 'tour_tag', conditionValue: 1 },
    { name: 'Amigo del Café', description: 'Completaste la Ruta del Café', icon: '☕', conditionType: 'tour_tag', conditionValue: 1 },
    { name: 'Guardián del Bosque', description: 'Visitaste la Selva de Florencia', icon: '🌿', conditionType: 'tour_tag', conditionValue: 1 },
    { name: 'Viajero Experto', description: 'Completaste 5 tours con nosotros', icon: '🧭', conditionType: 'tours_count', conditionValue: 5 },
    { name: 'Avistador', description: 'Participaste en un tour de avistamiento de aves', icon: '🦅', conditionType: 'tour_tag', conditionValue: 1 },
    { name: 'Noctámbulo Natural', description: 'Hiciste un tour con noche en la naturaleza', icon: '🌙', conditionType: 'overnight_tour', conditionValue: 1 },
    { name: 'Jinete de Palmas', description: 'Caminaste por el Valle del Cocora', icon: '🌴', conditionType: 'tour_tag', conditionValue: 1 },
    { name: 'Ballenas del Pacífico', description: 'Avistaste ballenas jorobadas en el Pacífico', icon: '🐋', conditionType: 'tour_tag', conditionValue: 1 },
  ]

  for (const badge of badges) {
    const exists = await queryOne<{ id: string }>('SELECT id FROM badges WHERE name = $1', [badge.name])
    if (!exists) {
      await query(
        'INSERT INTO badges (name, description, icon, condition_type, condition_value) VALUES ($1,$2,$3,$4,$5)',
        [badge.name, badge.description, badge.icon, badge.conditionType, badge.conditionValue]
      )
      console.log(`✅ Insignia: ${badge.name}`)
    }
  }

  // ─── Demo users ──────────────────────────────────────────────────────────────
  const demoUsers = [
    { email: 'cliente@demo.com', firstName: 'María', lastName: 'López', role: 'cliente', password: 'Demo123!' },
    { email: 'freelance@demo.com', firstName: 'Carlos', lastName: 'Ramírez', role: 'freelance', password: 'Demo123!' },
    { email: 'aliado@demo.com', firstName: 'Hotel', lastName: 'Econatural', role: 'aliado', password: 'Demo123!' },
  ]

  for (const u of demoUsers) {
    const exists = await queryOne<{ id: string }>('SELECT id FROM users WHERE email = $1', [u.email])
    if (!exists) {
      const hash = await bcrypt.hash(u.password, 12)
      const refCode = crypto.randomBytes(4).toString('hex').toUpperCase()
      const created = await queryOne<{ id: string }>(
        `INSERT INTO users (email, password_hash, role, first_name, last_name, referral_code)
         VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
        [u.email, hash, u.role, u.firstName, u.lastName, refCode]
      )
      if (u.role === 'freelance' && created) {
        await query(
          'INSERT INTO freelance_profiles (user_id, commission_rate) VALUES ($1, 10)',
          [created.id]
        )
      }
      console.log(`✅ Usuario demo: ${u.email} / ${u.password}`)
    }
  }

  console.log('\n🎉 Seed completado exitosamente!')
  console.log('─────────────────────────────────')
  console.log(`Admin: ${adminEmail} / ${adminPass}`)
  console.log('Demo: cliente@demo.com / Demo123!')
  console.log('Demo: freelance@demo.com / Demo123!')
  console.log('Demo: aliado@demo.com / Demo123!')
  process.exit(0)
}

seed().catch((err) => {
  console.error('❌ Error en seed:', err)
  process.exit(1)
})
