-- 002_services.sql
-- Servicios demo para desarrollo local.

WITH service_rows AS (
  SELECT * FROM (
    VALUES
      (
        'Clases de Guitarra',
        'Aprende a tocar guitarra desde cero. Clases personalizadas.',
        'Ofrezco clases de guitarra personalizadas para todos los niveles, desde principiantes hasta avanzados. Aprenderás teoría musical, técnica, acordes, escalas y tus canciones favoritas. Incluye material didáctico y seguimiento personalizado. Perfecto para quienes quieren aprender un instrumento de forma divertida y efectiva.',
        2,
        'Madrid Centro',
        'tarde',
        'EDUCACION',
        'PRESENCIAL',
        'ACTIVO',
        15.0,
        'usuario1@test.com'
      ),
      (
        'Limpieza del Hogar',
        'Servicio profesional de limpieza para tu casa.',
        'Servicio completo de limpieza del hogar con productos ecológicos. Incluye limpieza de todas las habitaciones, baños, cocina, ventanas y superficies. Profesionales con experiencia y material propio. Resultados garantizados y atención al detalle. Ideal para mantener tu hogar impecable sin esfuerzo.',
        4,
        'Madrid',
        'mañana',
        'HOGAR',
        'PRESENCIAL',
        'ACTIVO',
        12.0,
        'usuario2@test.com'
      ),
      (
        'Desarrollo Web',
        'Creación de sitios web profesionales con las últimas tecnologías.',
        'Desarrollo web completo con React, Next.js, Node.js y bases de datos modernas. Diseño responsive, SEO optimizado y rendimiento excepcional. Incluye hosting, dominio y mantenimiento durante 3 meses. Perfecto para empresas y emprendedores que buscan presencia digital profesional.',
        8,
        'Remoto',
        'flexible',
        'TECNOLOGIA',
        'VIRTUAL',
        'ACTIVO',
        25.0,
        'usuario1@test.com'
      ),
      (
        'Entrenamiento Personal',
        'Rutinas de ejercicio personalizadas para tus objetivos fitness.',
        'Entrenamiento personal adaptado a tus necesidades y objetivos. Planes de ejercicio personalizados, seguimiento nutricional básico y motivación constante. Sesiones de 1 hora con ejercicios funcionales, cardio y fuerza. Resultados visibles en 4 semanas. Ideal para principiantes y avanzados.',
        1,
        'Madrid Norte',
        'mañana-tarde',
        'DEPORTES',
        'PRESENCIAL',
        'ACTIVO',
        18.0,
        'usuario2@test.com'
      ),
      (
        'Clases de Yoga',
        'Sesiones de yoga para todos los niveles.',
        'Clases de yoga adaptadas a tu nivel y necesidades. Practicaremos asanas, pranayama y meditación para mejorar tu flexibilidad, fuerza y bienestar mental. Incluye esterilla y bloques. Ambiente relajado y acogedor. Ideal para liberar estrés y conectar cuerpo y mente.',
        1,
        'Valencia',
        'mañana',
        'DEPORTES',
        'PRESENCIAL',
        'ACTIVO',
        12.0,
        'usuario1@test.com'
      ),
      (
        'Reparación de Ordenadores',
        'Diagnóstico y reparación de problemas técnicos.',
        'Servicio completo de diagnóstico y reparación de ordenadores. Soluciono problemas de hardware (pantallas, teclados, discos duros) y software (virus, sistemas operativos, drivers). Incluye limpieza interna y optimización del sistema. Presupuesto sin compromiso. Experiencia de 10 años en el sector.',
        2,
        'Remoto',
        'flexible',
        'TECNOLOGIA',
        'VIRTUAL',
        'ACTIVO',
        20.0,
        'usuario2@test.com'
      ),
      (
        'Clases de Cocina Italiana',
        'Aprende a cocinar auténtica comida italiana.',
        'Clases prácticas de cocina italiana tradicional. Aprenderás a hacer pasta fresca desde cero, risotto cremoso, pizzas napolitanas y tiramisú auténtico. Incluye todos los ingredientes y recetas para llevar a casa. Ambiente divertido y familiar. No necesitas experiencia previa.',
        3,
        'Sevilla',
        'tarde',
        'OTROS',
        'PRESENCIAL',
        'ACTIVO',
        30.0,
        'usuario1@test.com'
      ),
      (
        'Asesoría Legal Básica',
        'Consultas legales generales y asesoramiento.',
        'Asesoría legal para particulares en temas generales: revisión de contratos, reclamaciones, trámites administrativos y consultas básicas. Abogado colegiado con 8 años de experiencia. Primera consulta gratuita. Lenguaje claro y accesible para que entiendas tus derechos y opciones.',
        1,
        'Remoto',
        'flexible',
        'OTROS',
        'VIRTUAL',
        'ACTIVO',
        35.0,
        'usuario2@test.com'
      ),
      (
        'Pintura de Interiores',
        'Servicio profesional de pintura para espacios.',
        'Pintura de interiores con acabado profesional. Incluye preparación de superficies, protección de muebles, dos capas de pintura de calidad y limpieza final. Trabajo limpio y preciso. Colores a elegir. Ideal para renovar tu hogar sin complicaciones. Presupuesto gratuito.',
        8,
        'Madrid',
        'mañana-tarde',
        'HOGAR',
        'PRESENCIAL',
        'ACTIVO',
        40.0,
        'usuario1@test.com'
      )
  ) AS t(
    title,
    description,
    "detailedDescription",
    duration,
    location,
    availability,
    category,
    type,
    status,
    price,
    owner_email
  )
)
INSERT INTO services (
  title,
  description,
  "detailedDescription",
  duration,
  location,
  availability,
  category,
  type,
  status,
  price,
  "userId",
  "updatedAt"
)
SELECT
  s.title,
  s.description,
  s."detailedDescription",
  s.duration,
  s.location,
  s.availability,
  s.category::"ServiceCategory",
  s.type::"ServiceType",
  s.status::"ServiceStatus",
  s.price,
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
