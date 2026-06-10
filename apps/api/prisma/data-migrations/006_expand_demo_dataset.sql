-- 006_expand_demo_dataset.sql
-- Amplía el dataset demo con más usuarios, servicios y comunidades.
-- Mantiene el enfoque idempotente para desarrollo local.

INSERT INTO users (
  id,
  email,
  password,
  name,
  "phoneNumber",
  location,
  bio,
  skills,
  role,
  "timeCredits",
  "updatedAt"
)
VALUES
  (
    'auth0|test-user-3',
    'usuario3@test.com',
    'password123',
    'Lucía Martín',
    '611223344',
    'Valencia, España',
    'Diseñadora y profesora de idiomas. Le encantan los proyectos creativos y colaborar en comunidad.',
    ARRAY['diseno', 'idiomas', 'fotografia'],
    'USER',
    280,
    NOW()
  ),
  (
    'auth0|test-user-4',
    'usuario4@test.com',
    'password123',
    'Carlos Romero',
    '622334455',
    'Sevilla, España',
    'Entrenador personal y cocinero amateur. Comparte conocimientos prácticos y mucha energía.',
    ARRAY['fitness', 'cocina', 'bienestar'],
    'USER',
    260,
    NOW()
  ),
  (
    'auth0|test-user-5',
    'usuario5@test.com',
    'password123',
    'Marta Gil',
    '633445566',
    'Bilbao, España',
    'Consultora tecnológica especializada en formación y herramientas digitales para pequeños negocios.',
    ARRAY['tecnologia', 'formacion', 'negocio'],
    'USER',
    320,
    NOW()
  ),
  (
    'auth0|test-user-6',
    'usuario6@test.com',
    'password123',
    'Andrés Vega',
    '644556677',
    'Málaga, España',
    'Músico, organizador de eventos y aficionado a la producción audiovisual.',
    ARRAY['musica', 'eventos', 'video'],
    'USER',
    240,
    NOW()
  )
ON CONFLICT (email)
DO UPDATE SET
  id = EXCLUDED.id,
  password = EXCLUDED.password,
  name = EXCLUDED.name,
  "phoneNumber" = EXCLUDED."phoneNumber",
  location = EXCLUDED.location,
  bio = EXCLUDED.bio,
  skills = EXCLUDED.skills,
  role = EXCLUDED.role,
  "timeCredits" = EXCLUDED."timeCredits",
  "updatedAt" = NOW();

WITH service_rows AS (
  SELECT * FROM (
    VALUES
      (
        'Clases de Inglés Conversacional',
        'Mejora tu speaking con sesiones dinámicas y prácticas.',
        'Sesiones orientadas a conversación real, entrevistas de trabajo, reuniones y confianza al hablar. Material propio, correcciones en directo y seguimiento semanal.',
        2,
        'Calle de Fuencarral 78, 28004 Madrid, España',
        40.428148,
        -3.701442,
        'Calle de Fuencarral 78, 28004 Madrid, España',
        'Madrid tarde',
        'EDUCACION',
        'PRESENCIAL',
        'ACTIVO',
        18.0,
        'https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=1200&q=80',
        'usuario3@test.com'
      ),
      (
        'Mentoría UX/UI',
        'Revisión de portfolio, Figma y casos prácticos.',
        'Mentorías para mejorar portfolio, heurísticas UX, diseño visual y preparación de entrevistas. Ideal para juniors y personas en transición al diseño digital.',
        2,
        'Bilbao',
        43.263012,
        -2.934985,
        'Bilbao, Vizcaya, España',
        'flexible',
        'TECNOLOGIA',
        'HIBRIDO',
        'ACTIVO',
        24.0,
        'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1200&q=80',
        'usuario5@test.com'
      ),
      (
        'Fotografía para Redes Sociales',
        'Sesiones y edición básica para marcas personales.',
        'Te ayudo a planificar una sesión fotográfica orientada a Instagram, LinkedIn o tu web. Incluye selección de localización, tomas clave y edición ligera.',
        3,
        'Ciudad de las Artes y las Ciencias, Valencia, España',
        39.454876,
        -0.350658,
        'Ciudad de las Artes y las Ciencias, Valencia, España',
        'mañana-tarde',
        'ARTE',
        'PRESENCIAL',
        'ACTIVO',
        26.0,
        'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
        'usuario3@test.com'
      ),
      (
        'Edición de Vídeo para Reels',
        'Montaje ágil de clips cortos y contenido vertical.',
        'Aprende a editar o delega la edición de piezas cortas para reels, TikTok o promos. Flujo rápido, subtítulos y ritmo pensado para captar atención.',
        2,
        'Remoto',
        NULL,
        NULL,
        NULL,
        'flexible',
        'ARTE',
        'VIRTUAL',
        'ACTIVO',
        22.0,
        'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1200&q=80',
        'usuario6@test.com'
      ),
      (
        'Entrenamiento Funcional al Aire Libre',
        'Sesiones para ganar fuerza, movilidad y resistencia.',
        'Entrenamientos al aire libre en grupos reducidos o individual. Adaptado a nivel, con seguimiento de progresión y objetivos semanales.',
        1,
        'Parque del Retiro, Madrid, España',
        40.415260,
        -3.684418,
        'Parque del Retiro, Plaza de la Independencia, Madrid, España',
        'mañana',
        'DEPORTES',
        'PRESENCIAL',
        'ACTIVO',
        16.0,
        'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80',
        'usuario4@test.com'
      ),
      (
        'Planificación Nutricional Básica',
        'Hábitos saludables sin dietas imposibles.',
        'Te ayudo a organizar menús sencillos, compra inteligente y hábitos sostenibles para rendir mejor y sentirte bien.',
        1,
        'Remoto',
        NULL,
        NULL,
        NULL,
        'flexible',
        'SALUD',
        'VIRTUAL',
        'ACTIVO',
        14.0,
        'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1200&q=80',
        'usuario4@test.com'
      ),
      (
        'Montaje de PC Gaming',
        'Asesoría y montaje optimizado según tu presupuesto.',
        'Te asesoro en componentes, compatibilidades y montaje final de un PC de sobremesa. Ideal para gaming, streaming o trabajo creativo.',
        4,
        'Gran Vía Don Diego López de Haro 1, Bilbao, España',
        43.264365,
        -2.935015,
        'Gran Vía Don Diego López de Haro 1, Bilbao, España',
        'tarde',
        'TECNOLOGIA',
        'PRESENCIAL',
        'ACTIVO',
        32.0,
        'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=1200&q=80',
        'usuario5@test.com'
      ),
      (
        'Automatización con Notion y Zapier',
        'Optimiza procesos repetitivos en tu negocio.',
        'Diseño sistemas simples de automatización para captar leads, gestionar tareas, CRM y flujos entre apps sin código.',
        2,
        'Remoto',
        NULL,
        NULL,
        NULL,
        'flexible',
        'TECNOLOGIA',
        'VIRTUAL',
        'ACTIVO',
        28.0,
        'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
        'usuario5@test.com'
      ),
      (
        'Clases de Piano para Adultos',
        'Empieza desde cero con un método práctico.',
        'Clases enfocadas a personas adultas que quieren aprender piano sin frustración, con repertorio adaptable y teoría aplicada.',
        1,
        'Carrer de Balmes 92, Barcelona, España',
        41.389631,
        2.160547,
        'Carrer de Balmes 92, Barcelona, España',
        'tarde',
        'EDUCACION',
        'PRESENCIAL',
        'ACTIVO',
        20.0,
        'https://images.unsplash.com/photo-1507838153414-b4b713384a76?auto=format&fit=crop&w=1200&q=80',
        'usuario6@test.com'
      ),
      (
        'Producción Musical Home Studio',
        'Aprende a grabar, mezclar y publicar tus temas.',
        'Sesiones para sacar partido a tu home studio: microfonía, mezcla, arreglos, plantillas y distribución digital.',
        3,
        'Málaga Centro, Málaga, España',
        36.721274,
        -4.421399,
        'Distrito Centro, Málaga, España',
        'tarde-noche',
        'ARTE',
        'HIBRIDO',
        'ACTIVO',
        34.0,
        'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1200&q=80',
        'usuario6@test.com'
      ),
      (
        'Organización de Eventos Pequeños',
        'Te ayudo a coordinar meetups, talleres y presentaciones.',
        'Planificación de espacio, timing, invitados, material y experiencia general para eventos de pequeño y mediano formato.',
        5,
        'Calle Larios, Málaga, España',
        36.719959,
        -4.423272,
        'Calle Marqués de Larios, Málaga, España',
        'flexible',
        'OTROS',
        'PRESENCIAL',
        'ACTIVO',
        38.0,
        'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
        'usuario6@test.com'
      ),
      (
        'Clases de Francés para Viajar',
        'Expresiones y práctica útil para moverte con soltura.',
        'Aprende el francés útil para reservas, restaurantes, transporte y conversación cotidiana. Formato ágil y muy práctico.',
        2,
        'Valencia, España',
        39.469907,
        -0.376288,
        'Valencia, España',
        'tarde',
        'EDUCACION',
        'HIBRIDO',
        'ACTIVO',
        17.0,
        'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80',
        'usuario3@test.com'
      ),
      (
        'Diseño de Presentaciones Profesionales',
        'Slides claras, visuales y orientadas a impacto.',
        'Revisión y rediseño de presentaciones para clientes, clases o reuniones internas. Estructura narrativa, diseño visual y claridad.',
        2,
        'Remoto',
        NULL,
        NULL,
        NULL,
        'flexible',
        'ARTE',
        'VIRTUAL',
        'ACTIVO',
        19.0,
        'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80',
        'usuario3@test.com'
      ),
      (
        'Taller de Cerámica Inicial',
        'Crea tus primeras piezas en un ambiente relajado.',
        'Introducción al torno y modelado manual, con materiales incluidos y acompañamiento paso a paso.',
        3,
        'Calle Feria, Sevilla, España',
        37.402480,
        -5.991563,
        'Calle Feria, Casco Antiguo, Sevilla, España',
        'mañana',
        'ARTE',
        'PRESENCIAL',
        'ACTIVO',
        21.0,
        'https://images.unsplash.com/photo-1510751007277-36932aac9ebd?auto=format&fit=crop&w=1200&q=80',
        'usuario4@test.com'
      ),
      (
        'Masaje Descontracturante',
        'Sesiones para aliviar tensión y recuperar bienestar.',
        'Tratamiento enfocado a espalda, cervicales y piernas para reducir tensiones y mejorar la recuperación muscular.',
        1,
        'Avenida de la Constitución, Sevilla, España',
        37.386169,
        -5.992575,
        'Avenida de la Constitución, Sevilla, España',
        'tarde',
        'SALUD',
        'PRESENCIAL',
        'ACTIVO',
        27.0,
        'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=1200&q=80',
        'usuario4@test.com'
      ),
      (
        'Soporte WordPress para Negocios',
        'Mantenimiento, plugins y mejoras rápidas.',
        'Te ayudo con incidencias, velocidad, formularios, copias de seguridad y pequeñas mejoras para tu web WordPress.',
        2,
        'Remoto',
        NULL,
        NULL,
        NULL,
        'flexible',
        'TECNOLOGIA',
        'VIRTUAL',
        'ACTIVO',
        23.0,
        'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1200&q=80',
        'usuario5@test.com'
      ),
      (
        'Clases de Running para Principiantes',
        'Empieza a correr con técnica y constancia.',
        'Plan progresivo para empezar a correr, mejorar técnica, respiración y prevenir lesiones.',
        1,
        'Playa de la Malvarrosa, Valencia, España',
        39.478269,
        -0.323527,
        'Passeig Marítim de la Patacona, Valencia, España',
        'mañana',
        'DEPORTES',
        'PRESENCIAL',
        'ACTIVO',
        13.0,
        'https://images.unsplash.com/photo-1486218119243-13883505764c?auto=format&fit=crop&w=1200&q=80',
        'usuario4@test.com'
      ),
      (
        'Asistencia con Trámites Digitales',
        'Ayuda práctica con certificados, citas y sedes electrónicas.',
        'Te acompaño a resolver trámites online: certificados, cita previa, formularios y uso de plataformas oficiales.',
        1,
        'Bilbao, España',
        43.263012,
        -2.934985,
        'Bilbao, Vizcaya, España',
        'mañana-tarde',
        'OTROS',
        'HIBRIDO',
        'ACTIVO',
        15.0,
        'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80',
        'usuario5@test.com'
      )
  ) AS t(
    title,
    description,
    "detailedDescription",
    duration,
    location,
    latitude,
    longitude,
    "formattedAddress",
    availability,
    category,
    type,
    status,
    price,
    "imageUrl",
    owner_email
  )
)
INSERT INTO services (
  title,
  description,
  "detailedDescription",
  duration,
  location,
  latitude,
  longitude,
  "formattedAddress",
  availability,
  category,
  type,
  status,
  price,
  "imageUrl",
  "userId",
  "updatedAt"
)
SELECT
  s.title,
  s.description,
  s."detailedDescription",
  s.duration,
  s.location,
  s.latitude,
  s.longitude,
  s."formattedAddress",
  s.availability,
  s.category::"ServiceCategory",
  s.type::"ServiceType",
  s.status::"ServiceStatus",
  s.price,
  s."imageUrl",
  u.id,
  NOW()
FROM service_rows s
JOIN users u ON u.email = s.owner_email
WHERE NOT EXISTS (
  SELECT 1
  FROM services existing
  WHERE existing.title = s.title
    AND existing."userId" = u.id
);

UPDATE services
SET
  latitude = CASE title
    WHEN 'Clases de Guitarra' THEN 40.4168
    WHEN 'Limpieza del Hogar' THEN 40.4168
    WHEN 'Entrenamiento Personal' THEN 40.4798
    WHEN 'Clases de Yoga' THEN 39.4699
    WHEN 'Clases de Cocina Italiana' THEN 37.3891
    WHEN 'Pintura de Interiores' THEN 40.4168
    ELSE latitude
  END,
  longitude = CASE title
    WHEN 'Clases de Guitarra' THEN -3.7038
    WHEN 'Limpieza del Hogar' THEN -3.7038
    WHEN 'Entrenamiento Personal' THEN -3.6879
    WHEN 'Clases de Yoga' THEN -0.3763
    WHEN 'Clases de Cocina Italiana' THEN -5.9845
    WHEN 'Pintura de Interiores' THEN -3.7038
    ELSE longitude
  END,
  "formattedAddress" = CASE title
    WHEN 'Clases de Guitarra' THEN 'Madrid Centro, Madrid, España'
    WHEN 'Limpieza del Hogar' THEN 'Madrid, España'
    WHEN 'Entrenamiento Personal' THEN 'Madrid Norte, Madrid, España'
    WHEN 'Clases de Yoga' THEN 'Valencia, España'
    WHEN 'Clases de Cocina Italiana' THEN 'Sevilla, España'
    WHEN 'Pintura de Interiores' THEN 'Madrid, España'
    ELSE "formattedAddress"
  END
WHERE title IN (
  'Clases de Guitarra',
  'Limpieza del Hogar',
  'Entrenamiento Personal',
  'Clases de Yoga',
  'Clases de Cocina Italiana',
  'Pintura de Interiores'
);

WITH community_rows AS (
  SELECT * FROM (
    VALUES
      (
        'Freelancers Valencia',
        'Comunidad para profesionales freelance que quieren compartir clientes, herramientas y aprendizajes.',
        'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1400&q=80',
        false,
        'usuario3@test.com'
      ),
      (
        'Fitness Sevilla',
        'Grupo para entrenar juntos, compartir hábitos saludables y organizar quedadas deportivas.',
        'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1400&q=80',
        false,
        'usuario4@test.com'
      ),
      (
        'Tech Bilbao',
        'Comunidad de tecnología, producto y automatización para compartir recursos y oportunidades.',
        'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80',
        false,
        'usuario5@test.com'
      ),
      (
        'Creadores Málaga',
        'Espacio para fotógrafos, músicos, videógrafos y creativos que quieren colaborar.',
        'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1400&q=80',
        false,
        'usuario6@test.com'
      ),
      (
        'Aprender Idiomas Juntos',
        'Intercambio de idiomas y sesiones de conversación para mejorar en grupo.',
        'https://images.unsplash.com/photo-1522202222206-b75023c8b7fb?auto=format&fit=crop&w=1400&q=80',
        false,
        'usuario3@test.com'
      ),
      (
        'Productividad y Hábitos',
        'Pequeña comunidad para compartir sistemas, rutinas y herramientas que nos ayudan a enfocarnos.',
        'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1400&q=80',
        true,
        'usuario5@test.com'
      )
  ) AS t(name, description, "imageUrl", is_private, creator_email)
)
INSERT INTO communities (
  name,
  description,
  "imageUrl",
  "isPrivate",
  "creatorId",
  "updatedAt"
)
SELECT
  c.name,
  c.description,
  c."imageUrl",
  c.is_private,
  u.id,
  NOW()
FROM community_rows c
JOIN users u ON u.email = c.creator_email
WHERE NOT EXISTS (
  SELECT 1
  FROM communities existing
  WHERE existing.name = c.name
);
