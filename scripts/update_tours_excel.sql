-- ============================================================
-- Actualización de tours según hoja de cálculo "Descripción de planes"
-- Aves y Naturaleza - 11 tours definitivos
-- ============================================================

BEGIN;

-- ============================================================
-- 1. NEVADO DEL RUIZ DESDE MANIZALES
-- ============================================================
UPDATE tours SET
  name = 'Aventura al Nevado del Ruiz: Termales y paisajes únicos desde Manizales',
  internal_name = 'Nevado del Ruiz desde Manizales',
  destination = 'PNN Los Nevados',
  base_price = 350000,
  duration_days = 1,
  tour_type = 'pasadia',
  difficulty = 'moderado',
  description = 'Vive una experiencia inolvidable en el Nevado del Ruiz, recorriendo paisajes de páramo, lagunas y formaciones volcánicas únicas. Disfruta de un día lleno de naturaleza, aire puro y finaliza relajándote en aguas termales.',
  itinerary = '[
    {"time":"6:00 am","activity":"Salida desde Manizales hacia el Páramo de Letras"},
    {"time":"8:00 am","activity":"Desayuno en Laguna Negra con bebida caliente y vista a la laguna"},
    {"time":"9:30 am","activity":"Ingreso al PNN Los Nevados — sector Brisas: registro e inducción"},
    {"time":"10:00 am","activity":"Recorrido por el páramo: Aguacerales, Arenales, Valle Lunar, Valle de las Tumbas"},
    {"time":"1:00 pm","activity":"Almuerzo típico"},
    {"time":"3:00 pm","activity":"Ingreso a termales El Otoño (Eco Termales) — 2 horas"},
    {"time":"6:00 pm","activity":"Regreso a Manizales"}
  ]'::jsonb,
  includes = '{
    "transport": true, "breakfast": true, "lunch": true, "snacks": true,
    "insurance": true, "guide": true, "parkEntrance": true,
    "souvenir": false, "accommodation": false,
    "notes": "Termales El Otoño 2 horas (Eco Termales). El guía solo en el área protegida."
  }'::jsonb,
  excludes = '["Gastos no especificados","Consumos adicionales"]'::jsonb,
  recommendations = '[
    "Llevar ropa abrigada (clima frío)",
    "Usar protector solar",
    "Llevar zapatos cómodos",
    "Hidratación constante",
    "No consumir alcohol antes del tour"
  ]'::jsonb,
  restrictions = '[
    "No permitido para mujeres en estado de embarazo",
    "No permitido para menores de 6 años",
    "No permitido para adultos mayores de 70 años",
    "No apto para personas con problemas cardíacos, respiratorios o de presión arterial"
  ]'::jsonb,
  what_to_bring = '[
    "Chaqueta térmica",
    "Guantes y gorro",
    "Bloqueador solar",
    "Cámara o celular",
    "Documento de identidad"
  ]'::jsonb,
  departure_cities = '["Manizales"]'::jsonb,
  is_active = true,
  is_featured = true,
  updated_at = now()
WHERE slug = 'nevado-ruiz-manizales';

-- ============================================================
-- 2. NEVADO DEL RUIZ DESDE PEREIRA
-- ============================================================
UPDATE tours SET
  name = 'Aventura al Nevado del Ruiz: Termales y paisajes únicos desde Pereira',
  internal_name = 'Nevado del Ruiz desde Pereira',
  destination = 'PNN Los Nevados',
  base_price = 350000,
  duration_days = 1,
  tour_type = 'pasadia',
  difficulty = 'moderado',
  description = 'Vive una experiencia inolvidable en el Nevado del Ruiz, recorriendo paisajes de páramo, lagunas y formaciones volcánicas únicas. Disfruta de un día lleno de naturaleza, aire puro y finaliza relajándote en aguas termales. Salida desde Pereira.',
  itinerary = '[
    {"time":"5:00 am","activity":"Salida desde Pereira hacia el Páramo de Letras"},
    {"time":"8:00 am","activity":"Desayuno en Laguna Negra"},
    {"time":"9:30 am","activity":"Ingreso al PNN Los Nevados — sector Brisas"},
    {"time":"10:00 am","activity":"Recorrido por el páramo: Aguacerales, Arenales, Valle Lunar, Valle de las Tumbas"},
    {"time":"1:00 pm","activity":"Almuerzo típico"},
    {"time":"3:00 pm","activity":"Ingreso a termales El Otoño — 2 horas"},
    {"time":"7:00 pm","activity":"Regreso a Pereira"}
  ]'::jsonb,
  includes = '{
    "transport": true, "breakfast": true, "lunch": true, "snacks": true,
    "insurance": true, "guide": true, "parkEntrance": true,
    "souvenir": false, "accommodation": false,
    "notes": "Termales El Otoño 2 horas (Eco Termales). El guía solo en el área protegida."
  }'::jsonb,
  excludes = '["Gastos no especificados","Consumos adicionales"]'::jsonb,
  recommendations = '[
    "Llevar ropa abrigada (clima frío)",
    "Usar protector solar",
    "Llevar zapatos cómodos",
    "Hidratación constante",
    "No consumir alcohol antes del tour"
  ]'::jsonb,
  restrictions = '[
    "No permitido para mujeres en estado de embarazo",
    "No permitido para menores de 6 años",
    "No permitido para adultos mayores de 70 años",
    "No apto para personas con problemas cardíacos, respiratorios o de presión arterial"
  ]'::jsonb,
  what_to_bring = '[
    "Chaqueta térmica",
    "Guantes y gorro",
    "Bloqueador solar",
    "Cámara o celular",
    "Documento de identidad"
  ]'::jsonb,
  departure_cities = '["Pereira"]'::jsonb,
  is_active = true,
  is_featured = false,
  updated_at = now()
WHERE slug = 'nevado-ruiz-pereira';

-- ============================================================
-- 3. COCORA Y SALENTO
-- ============================================================
UPDATE tours SET
  name = 'Magia del Cocora y Salento: Palmas de cera y cultura cafetera',
  internal_name = 'Salento y Valle del Cocora',
  destination = 'Valle del Cocora - Salento',
  base_price = 380000,
  duration_days = 1,
  tour_type = 'pasadia',
  difficulty = 'facil',
  description = 'Descubre uno de los destinos más icónicos del Eje Cafetero. Recorre las coloridas calles de Salento, disfruta su cultura y vive una experiencia natural única en el Valle del Cocora, hogar de las imponentes palmas de cera.',
  itinerary = '[
    {"time":"6:30 am","activity":"Salida desde Manizales / 7:30 am desde Pereira"},
    {"time":"9:00 am","activity":"Llegada a Salento: recorrido por la Calle Real, calles tradicionales y miradores"},
    {"time":"11:30 am","activity":"Traslado al Valle del Cocora"},
    {"time":"12:30 pm","activity":"Almuerzo típico en entorno natural"},
    {"time":"2:00 pm","activity":"Caminata suave entre las palmas de cera"},
    {"time":"3:00 pm","activity":"Regreso a la ciudad de origen"}
  ]'::jsonb,
  includes = '{
    "transport": true, "breakfast": true, "lunch": true, "snacks": true,
    "insurance": true, "guide": true, "parkEntrance": true,
    "activity": "Café",
    "souvenir": true, "accommodation": false,
    "notes": "Incluye café tradicional"
  }'::jsonb,
  excludes = '["Gastos no especificados","Actividades adicionales en destino"]'::jsonb,
  recommendations = '[
    "Ropa cómoda y fresca",
    "Zapatos para caminar",
    "Protector solar",
    "Hidratación constante",
    "Cámara o celular"
  ]'::jsonb,
  restrictions = '[]'::jsonb,
  what_to_bring = '[
    "Ropa cómoda",
    "Chaqueta ligera",
    "Bloqueador solar",
    "Dinero para gastos adicionales"
  ]'::jsonb,
  departure_cities = '["Manizales","Pereira"]'::jsonb,
  is_active = true,
  is_featured = true,
  updated_at = now()
WHERE slug = 'cocora-salento';

-- ============================================================
-- 4. NORCASIA PASADÍA
-- ============================================================
UPDATE tours SET
  name = 'Paraíso escondido en Norcasia: Aventura en un día',
  internal_name = 'Norcasia Pasadía',
  destination = 'Norcasia, Caldas',
  base_price = 180000,
  duration_days = 1,
  tour_type = 'pasadia',
  difficulty = 'moderado',
  description = 'Descubre Norcasia, un paraíso escondido en el oriente de Caldas. Navega por el Embalse Amaní, disfruta del Río Manso y conoce las cascadas de la zona en una experiencia de un día llena de naturaleza y aventura.',
  itinerary = '[
    {"time":"6:00 am","activity":"Salida desde Manizales hacia Norcasia"},
    {"time":"9:30 am","activity":"Llegada a Norcasia — inducción del guía"},
    {"time":"10:00 am","activity":"Navegación por el Embalse Amaní"},
    {"time":"12:00 pm","activity":"Almuerzo típico"},
    {"time":"1:30 pm","activity":"Visita al Río Manso y cascadas"},
    {"time":"4:00 pm","activity":"Regreso a Manizales"}
  ]'::jsonb,
  includes = '{
    "transport": true, "breakfast": true, "lunch": true, "snacks": true,
    "insurance": true, "guide": true, "parkEntrance": false,
    "activity": "Navegación Embalse Amaní",
    "souvenir": false, "accommodation": false
  }'::jsonb,
  excludes = '["Gastos no especificados","Consumos adicionales"]'::jsonb,
  recommendations = '[
    "Ropa fresca y cómoda",
    "Traje de baño",
    "Toalla",
    "Repelente de insectos",
    "Bloqueador solar"
  ]'::jsonb,
  restrictions = '[]'::jsonb,
  what_to_bring = '[
    "Ropa de cambio",
    "Sandalias",
    "Cámara acuática",
    "Documento de identidad"
  ]'::jsonb,
  departure_cities = '["Manizales"]'::jsonb,
  is_active = true,
  is_featured = false,
  updated_at = now()
WHERE slug = 'norcasia-aventura';

-- ============================================================
-- 5. NORCASIA 2D/1N (renombro el actual norcasia-selva-florencia)
-- ============================================================
UPDATE tours SET
  slug = 'norcasia-2d1n',
  name = 'Paraíso escondido en Norcasia: Escape natural 2 días 1 noche',
  internal_name = 'Norcasia 2D1N',
  destination = 'Norcasia, Caldas',
  base_price = 480000,
  duration_days = 2,
  tour_type = '1n2d',
  difficulty = 'moderado',
  description = 'Dos días para sumergirte en la magia de Norcasia: Río La Miel, Embalse Amaní, cascadas y noche de descanso en cabaña con todo incluido.',
  itinerary = '[
    {"time":"Día 1 - 6:00 am","activity":"Salida desde Manizales"},
    {"time":"Día 1 - 9:30 am","activity":"Llegada y check-in en hospedaje"},
    {"time":"Día 1 - 10:30 am","activity":"Río Manso: apneas, inmersiones, saltos"},
    {"time":"Día 1 - 1:00 pm","activity":"Almuerzo"},
    {"time":"Día 1 - 3:00 pm","activity":"Recorrido Embalse Amaní y mirador El Jardín"},
    {"time":"Día 1 - 7:00 pm","activity":"Cena"},
    {"time":"Día 2 - 7:00 am","activity":"Desayuno"},
    {"time":"Día 2 - 8:30 am","activity":"Cascada La Clara"},
    {"time":"Día 2 - 11:00 am","activity":"Body rafting o tubing en Río La Miel"},
    {"time":"Día 2 - 1:00 pm","activity":"Almuerzo"},
    {"time":"Día 2 - 3:00 pm","activity":"Regreso a Manizales"}
  ]'::jsonb,
  includes = '{
    "transport": true, "breakfast": true, "lunch": true, "snacks": true,
    "insurance": true, "guide": true, "parkEntrance": false,
    "activity": "Body rafting, apneas, navegación",
    "souvenir": false, "accommodation": true,
    "notes": "1 noche de hospedaje en hotel con baño privado"
  }'::jsonb,
  excludes = '["Bebidas alcohólicas","Gastos no especificados"]'::jsonb,
  recommendations = '[
    "Buen estado físico",
    "Ropa fresca y de cambio",
    "Traje de baño",
    "Calzado con buen agarre",
    "Repelente y bloqueador"
  ]'::jsonb,
  restrictions = '["Personas con problemas cardíacos consultar previamente"]'::jsonb,
  what_to_bring = '[
    "Ropa para dos días",
    "Traje de baño",
    "Sandalias y zapatos cerrados",
    "Toalla",
    "Cámara"
  ]'::jsonb,
  departure_cities = '["Manizales"]'::jsonb,
  is_active = true,
  is_featured = false,
  updated_at = now()
WHERE slug = 'norcasia-selva-florencia';

-- ============================================================
-- 6. NORCASIA 3D/2N (renombro el actual norcasia-samaná)
-- ============================================================
UPDATE tours SET
  slug = 'norcasia-3d2n',
  name = 'Paraíso escondido en Norcasia: Aventura completa 3 días 2 noches',
  internal_name = 'Norcasia 3D2N',
  destination = 'Norcasia, Caldas',
  base_price = 680000,
  duration_days = 3,
  tour_type = '2n3d',
  difficulty = 'moderado',
  description = 'Tres días para vivir Norcasia a fondo: cascadas, ríos cristalinos, body rafting, navegación por el Embalse Amaní y descanso en alojamiento confortable.',
  itinerary = '[
    {"time":"Día 1 - 6:00 am","activity":"Salida desde Manizales"},
    {"time":"Día 1 - 9:30 am","activity":"Check-in y descanso"},
    {"time":"Día 1 - 11:00 am","activity":"Senderismo al Salto de las Pavas"},
    {"time":"Día 1 - 1:00 pm","activity":"Almuerzo"},
    {"time":"Día 1 - 3:00 pm","activity":"Mirador El Jardín y atardecer en el embalse"},
    {"time":"Día 2 - 8:00 am","activity":"Cascada La Clara"},
    {"time":"Día 2 - 11:00 am","activity":"Body rafting en Río La Miel (5 km)"},
    {"time":"Día 2 - 4:00 pm","activity":"Río Manso: apneas y saltos"},
    {"time":"Día 3 - 8:00 am","activity":"Navegación Embalse Amaní y presa Pantágoras"},
    {"time":"Día 3 - 12:00 pm","activity":"Almuerzo y check-out"},
    {"time":"Día 3 - 2:00 pm","activity":"Regreso a Manizales"}
  ]'::jsonb,
  includes = '{
    "transport": true, "breakfast": true, "lunch": true, "snacks": true,
    "insurance": true, "guide": true, "parkEntrance": false,
    "activity": "Body rafting, apneas, navegación, senderismo",
    "souvenir": false, "accommodation": true,
    "notes": "2 noches de hospedaje, alimentación completa"
  }'::jsonb,
  excludes = '["Bebidas alcohólicas","Gastos no especificados"]'::jsonb,
  recommendations = '[
    "Buen estado físico",
    "Ropa para tres días",
    "Traje de baño",
    "Calzado cómodo",
    "Repelente y bloqueador"
  ]'::jsonb,
  restrictions = '["Personas con problemas cardíacos consultar previamente"]'::jsonb,
  what_to_bring = '[
    "Ropa para tres días",
    "Traje de baño y toalla",
    "Sandalias y zapatos cerrados",
    "Bolsa impermeable",
    "Cámara"
  ]'::jsonb,
  departure_cities = '["Manizales"]'::jsonb,
  is_active = true,
  is_featured = false,
  updated_at = now()
WHERE slug = 'norcasia-samaná';

-- ============================================================
-- 7. RUTA DEL CAFÉ
-- ============================================================
UPDATE tours SET
  name = 'Ruta del Café: De la mata a la taza',
  internal_name = 'Coffee Tour',
  destination = 'Eje Cafetero',
  base_price = 280000,
  duration_days = 1,
  tour_type = 'pasadia',
  difficulty = 'facil',
  description = 'Vive el proceso completo del café colombiano: desde el cultivo en la finca hasta la taza. Recorre cafetales tradicionales, conoce a los caficultores y disfruta de una cata profesional.',
  itinerary = '[
    {"time":"8:00 am","activity":"Salida desde Manizales hacia finca cafetera"},
    {"time":"9:30 am","activity":"Recorrido por el cafetal: siembra, cultivo y recolección"},
    {"time":"11:00 am","activity":"Proceso de beneficio: despulpado, fermentación, secado"},
    {"time":"12:30 pm","activity":"Almuerzo típico"},
    {"time":"2:00 pm","activity":"Tostión y molienda artesanal"},
    {"time":"3:30 pm","activity":"Cata profesional de café"},
    {"time":"5:00 pm","activity":"Regreso a Manizales"}
  ]'::jsonb,
  includes = '{
    "transport": true, "breakfast": true, "lunch": true, "snacks": true,
    "insurance": true, "guide": true, "parkEntrance": true,
    "activity": "Cata de café",
    "souvenir": true, "accommodation": false,
    "notes": "Incluye souvenir de café tostado"
  }'::jsonb,
  excludes = '["Bebidas adicionales","Compras en finca"]'::jsonb,
  recommendations = '[
    "Ropa cómoda",
    "Zapatos cerrados",
    "Protector solar",
    "Sombrero o gorra"
  ]'::jsonb,
  restrictions = '[]'::jsonb,
  what_to_bring = '[
    "Ropa cómoda",
    "Cámara",
    "Documento de identidad"
  ]'::jsonb,
  departure_cities = '["Manizales","Pereira"]'::jsonb,
  is_active = true,
  is_featured = true,
  updated_at = now()
WHERE slug = 'ruta-del-cafe';

-- ============================================================
-- 8. AVISTAMIENTO DE AVES
-- ============================================================
UPDATE tours SET
  name = 'Avistamiento de aves en Colombia: Colores y naturaleza viva',
  internal_name = 'Avistamiento de aves',
  destination = 'Reserva Río Blanco, Manizales',
  base_price = 165000,
  duration_days = 1,
  tour_type = 'pasadia',
  difficulty = 'facil',
  description = 'Colombia es el país con más especies de aves del mundo. Vive una experiencia única de avistamiento guiado en una de las reservas más biodiversas del Eje Cafetero, con la posibilidad de ver tángaras, colibríes, tucanes y especies endémicas.',
  itinerary = '[
    {"time":"5:30 am","activity":"Salida hacia reserva natural — mejor hora para avistamiento"},
    {"time":"6:30 am","activity":"Inicio del recorrido guiado con experto en aves"},
    {"time":"9:00 am","activity":"Desayuno campestre"},
    {"time":"10:00 am","activity":"Continuación del avistamiento — comederos y senderos"},
    {"time":"12:30 pm","activity":"Almuerzo típico"},
    {"time":"2:00 pm","activity":"Sesión final de avistamiento"},
    {"time":"4:00 pm","activity":"Regreso a la ciudad"}
  ]'::jsonb,
  includes = '{
    "transport": true, "breakfast": true, "lunch": true, "snacks": true,
    "insurance": true, "guide": true, "parkEntrance": true,
    "activity": "Avistamiento de aves",
    "souvenir": true, "accommodation": false,
    "notes": "Guía especializado en aves. Préstamo de binoculares."
  }'::jsonb,
  excludes = '["Equipo fotográfico profesional","Bebidas adicionales"]'::jsonb,
  recommendations = '[
    "Ropa de colores neutros (verde, café, gris)",
    "Calzado cómodo y silencioso",
    "Mantenerse en silencio durante el avistamiento",
    "Llevar binoculares propios si los tienen"
  ]'::jsonb,
  restrictions = '[]'::jsonb,
  what_to_bring = '[
    "Binoculares (opcional, se prestan)",
    "Ropa cómoda",
    "Cámara con teleobjetivo si la tiene",
    "Libreta para registro de especies"
  ]'::jsonb,
  departure_cities = '["Manizales"]'::jsonb,
  is_active = true,
  is_featured = true,
  updated_at = now()
WHERE slug = 'avistamiento-aves-los-nevados';

-- ============================================================
-- 9. BALLENAS PASADÍA (renombro el actual ballenas-pacifico)
-- ============================================================
UPDATE tours SET
  slug = 'ballenas-pasadia',
  name = 'Gigantes del Pacífico: Avistamiento de ballenas (Pasadía)',
  internal_name = 'Ballenas Pasadía',
  destination = 'Bahía Solano, Chocó',
  base_price = 550000,
  duration_days = 1,
  tour_type = 'pasadia',
  difficulty = 'facil',
  description = 'Vive uno de los espectáculos más impresionantes del Pacífico colombiano: las ballenas jorobadas en su hábitat natural. Temporada julio a octubre. Pasadía en lancha desde Bahía Solano con almuerzo típico incluido.',
  itinerary = '[
    {"time":"8:00 am","activity":"Encuentro en oficina del proveedor en Bahía Solano"},
    {"time":"8:30 am","activity":"Charla de seguridad e inducción"},
    {"time":"9:00 am","activity":"Salida en lancha al avistamiento"},
    {"time":"9:00 am - 1:00 pm","activity":"Avistamiento de ballenas jorobadas (3-4 horas en altamar)"},
    {"time":"1:30 pm","activity":"Almuerzo típico en Mecana"},
    {"time":"3:00 pm","activity":"Recorrido comunidad de Mecana y piscina natural"},
    {"time":"5:00 pm","activity":"Regreso a Bahía Solano"}
  ]'::jsonb,
  includes = '{
    "transport": true, "breakfast": false, "lunch": true, "snacks": true,
    "insurance": true, "guide": true, "parkEntrance": false,
    "activity": "Avistamiento ballenas, hidrófono",
    "souvenir": false, "accommodation": false,
    "notes": "Solo aplica en temporada julio-octubre. Avistamiento no garantizado."
  }'::jsonb,
  excludes = '["Vuelos","Hospedaje","Bebidas","Tasa turística","Ingreso PNN Utría"]'::jsonb,
  recommendations = '[
    "Ropa fresca y de secado rápido",
    "Chaqueta impermeable",
    "Protector solar biodegradable",
    "Gorra o sombrero",
    "Llevar medicación contra mareo si lo necesita"
  ]'::jsonb,
  restrictions = '[
    "No recomendado para mujeres embarazadas",
    "Personas con problemas de espalda consultar previamente",
    "Solo temporada julio-octubre"
  ]'::jsonb,
  what_to_bring = '[
    "Traje de baño",
    "Toalla",
    "Bolsa impermeable",
    "Repelente",
    "Cámara con protección contra agua"
  ]'::jsonb,
  departure_cities = '["Bahía Solano"]'::jsonb,
  is_active = true,
  is_featured = true,
  updated_at = now()
WHERE slug = 'ballenas-pacifico';

-- ============================================================
-- 10. BALLENAS 2D/1N (INSERT - es nuevo)
-- ============================================================
INSERT INTO tours (
  slug, name, internal_name, tour_type, destination, description,
  itinerary, includes, excludes, recommendations, restrictions, what_to_bring,
  base_price, departure_cities, duration_days, difficulty,
  is_active, is_featured
) VALUES (
  'ballenas-2d1n',
  'Gigantes del Pacífico: Avistamiento de ballenas (2 días 1 noche)',
  'Ballenas 2D1N',
  '1n2d',
  'Bahía Solano, Chocó',
  'Dos días en el Pacífico colombiano para vivir el avistamiento de ballenas jorobadas con noche de descanso en eco-lodge frente al mar. Combina aventura, naturaleza y descanso.',
  '[
    {"time":"Día 1 - 8:00 am","activity":"Recibimiento en aeropuerto de Bahía Solano"},
    {"time":"Día 1 - 9:30 am","activity":"Check-in en eco-lodge"},
    {"time":"Día 1 - 10:30 am","activity":"Salida en lancha para avistamiento de ballenas"},
    {"time":"Día 1 - 1:30 pm","activity":"Almuerzo típico"},
    {"time":"Día 1 - 3:30 pm","activity":"Caminata a Cascada del Amor"},
    {"time":"Día 1 - 7:00 pm","activity":"Cena y descanso"},
    {"time":"Día 2 - 7:00 am","activity":"Desayuno"},
    {"time":"Día 2 - 8:30 am","activity":"Segunda salida de avistamiento"},
    {"time":"Día 2 - 12:00 pm","activity":"Almuerzo"},
    {"time":"Día 2 - 2:00 pm","activity":"Traslado al aeropuerto"}
  ]'::jsonb,
  '{
    "transport": true, "breakfast": true, "lunch": true, "snacks": true,
    "insurance": true, "guide": true, "parkEntrance": false,
    "activity": "2 salidas de avistamiento",
    "souvenir": false, "accommodation": true,
    "notes": "1 noche en eco-lodge. No incluye vuelos."
  }'::jsonb,
  '["Vuelos ida y regreso","Tasa turística ($30.000)","Bebidas alcohólicas","Ingreso a termales"]'::jsonb,
  '[
    "Reservar con anticipación",
    "Confirmar vuelos antes del viaje",
    "Llevar efectivo (no hay cajeros)",
    "Ropa de secado rápido"
  ]'::jsonb,
  '["Solo temporada julio-octubre","Vuelos sujetos a condiciones climáticas"]'::jsonb,
  '[
    "Ropa para dos días",
    "Traje de baño",
    "Chaqueta impermeable",
    "Repelente",
    "Efectivo"
  ]'::jsonb,
  1650000,
  '["Bahía Solano"]'::jsonb,
  2,
  'facil',
  true,
  false
);

-- ============================================================
-- 11. BALLENAS 3D/2N (INSERT - es nuevo)
-- ============================================================
INSERT INTO tours (
  slug, name, internal_name, tour_type, destination, description,
  itinerary, includes, excludes, recommendations, restrictions, what_to_bring,
  base_price, departure_cities, duration_days, difficulty,
  is_active, is_featured
) VALUES (
  'ballenas-3d2n',
  'Gigantes del Pacífico: Avistamiento de ballenas (3 días 2 noches)',
  'Ballenas 3D2N',
  '2n3d',
  'Bahía Solano, Chocó',
  'Tres días para vivir a fondo el Pacífico colombiano: avistamiento de ballenas, PNN Utría, cascadas, termales y la riqueza de la cultura chocoana.',
  '[
    {"time":"Día 1 - 8:00 am","activity":"Recibimiento en aeropuerto y check-in"},
    {"time":"Día 1 - 10:30 am","activity":"Salida en lancha — avistamiento de ballenas"},
    {"time":"Día 1 - 1:30 pm","activity":"Almuerzo"},
    {"time":"Día 1 - 3:30 pm","activity":"Caminata Cascada del Amor"},
    {"time":"Día 1 - 7:00 pm","activity":"Cena y avistamiento nocturno de plancton bioluminiscente"},
    {"time":"Día 2 - 7:00 am","activity":"Desayuno"},
    {"time":"Día 2 - 8:00 am","activity":"Salida al PNN Utría — segundo avistamiento"},
    {"time":"Día 2 - 1:00 pm","activity":"Almuerzo en Utría"},
    {"time":"Día 2 - 3:00 pm","activity":"Caminata a termales de Jovi"},
    {"time":"Día 3 - 7:00 am","activity":"Desayuno"},
    {"time":"Día 3 - 8:30 am","activity":"Visita a comunidad local y tour gastronómico"},
    {"time":"Día 3 - 12:00 pm","activity":"Almuerzo y check-out"},
    {"time":"Día 3 - 2:00 pm","activity":"Traslado al aeropuerto"}
  ]'::jsonb,
  '{
    "transport": true, "breakfast": true, "lunch": true, "snacks": true,
    "insurance": true, "guide": true, "parkEntrance": false,
    "activity": "2 avistamientos, termales, PNN Utría",
    "souvenir": true, "accommodation": true,
    "notes": "2 noches en eco-lodge. No incluye vuelos ni ingreso a PNN Utría."
  }'::jsonb,
  '["Vuelos ida y regreso","Tasa turística ($30.000)","Ingreso PNN Utría","Ingreso a termales","Bebidas alcohólicas"]'::jsonb,
  '[
    "Llevar efectivo (no hay cajeros)",
    "Ropa de secado rápido",
    "Bolsa impermeable",
    "Confirmar vuelos con anticipación"
  ]'::jsonb,
  '["Solo temporada julio-octubre","Vuelos sujetos a condiciones climáticas"]'::jsonb,
  '[
    "Ropa para tres días",
    "Traje de baño y toalla",
    "Chaqueta impermeable",
    "Repelente y bloqueador",
    "Efectivo"
  ]'::jsonb,
  2850000,
  '["Bahía Solano"]'::jsonb,
  3,
  'facil',
  true,
  true
);

-- ============================================================
-- ELIMINAR REGISTROS HUÉRFANOS (el viejo ballenas-pacifico ya renombrado a ballenas-pasadia)
-- (no hay nada que borrar, los UPDATEs anteriores ya renombraron los slugs)
-- ============================================================

COMMIT;

-- Verificación final
SELECT slug, name, base_price, duration_days, is_featured 
FROM tours 
ORDER BY base_price;
