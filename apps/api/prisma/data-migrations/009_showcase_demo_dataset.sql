-- 009_showcase_demo_dataset.sql
-- Dataset demo completo para producción/QA: usuarios, servicios con imágenes, comunidades,
-- organizaciones, membresías, eventos, servicios comunitarios y valoraciones.
-- Idempotente por email, nombre de comunidad, título+owner y rating user/service.

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
  ('auth0|demo-ana', 'ana.demo@compartetutiempo.app', 'auth0-user', 'Ana López', '600111222', 'Madrid, España', 'Profesora de inglés y facilitadora de grupos de conversación.', ARRAY['idiomas','educacion','conversacion'], 'USER', 420, NOW()),
  ('auth0|demo-pablo', 'pablo.demo@compartetutiempo.app', 'auth0-user', 'Pablo Ruiz', '600222333', 'Barcelona, España', 'Desarrollador frontend. Ayuda a pequeños proyectos a mejorar su presencia digital.', ARRAY['tecnologia','frontend','web'], 'USER', 360, NOW()),
  ('auth0|demo-laura', 'laura.demo@compartetutiempo.app', 'auth0-user', 'Laura Sánchez', '600333444', 'Valencia, España', 'Fotógrafa y creadora audiovisual orientada a proyectos sociales.', ARRAY['fotografia','video','arte'], 'USER', 390, NOW()),
  ('auth0|demo-miguel', 'miguel.demo@compartetutiempo.app', 'auth0-user', 'Miguel Torres', '600444555', 'Sevilla, España', 'Entrenador personal y cocinero aficionado.', ARRAY['deporte','salud','cocina'], 'USER', 330, NOW()),
  ('auth0|demo-sofia', 'sofia.demo@compartetutiempo.app', 'auth0-user', 'Sofía Herrera', '600555666', 'Bilbao, España', 'Mentora UX/UI y voluntaria en iniciativas de alfabetización digital.', ARRAY['ux','diseno','voluntariado'], 'USER', 450, NOW())
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
  "timeCredits" = GREATEST(users."timeCredits", EXCLUDED."timeCredits"),
  "updatedAt" = NOW();

WITH community_rows AS (
  SELECT * FROM (VALUES
    (
      'Aprendizaje de Idiomas',
      'Comunidad para practicar idiomas, organizar conversaciones y compartir recursos de aprendizaje.',
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
      ARRAY['idiomas','conversacion','educacion'],
      ARRAY['Respeto durante las conversaciones','No compartir datos privados sin consentimiento','Preparar las sesiones con antelación'],
      '[{"title":"Guía para intercambios de conversación","type":"link","description":"Plantilla de temas para practicar speaking.","url":"https://www.bbc.co.uk/learningenglish/"}]'::jsonb,
      false,
      'COMMUNITY'::"CommunityKind",
      'NONE'::"VerificationStatus",
      'ana.demo@compartetutiempo.app'
    ),
    (
      'Círculo Creativo Local',
      'Espacio para fotografía, diseño, vídeo, música y proyectos artísticos colaborativos.',
      'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80',
      ARRAY['arte','fotografia','musica','diseno'],
      ARRAY['Acreditar autoría de los trabajos','Pedir permiso antes de fotografiar personas','Compartir recursos útiles con el grupo'],
      '[{"title":"Banco de referencias visuales","type":"note","description":"Comparte referencias para sesiones, reels y portfolio."}]'::jsonb,
      false,
      'COMMUNITY'::"CommunityKind",
      'NONE'::"VerificationStatus",
      'laura.demo@compartetutiempo.app'
    ),
    (
      'Red de Apoyo Digital',
      'Grupo para resolver dudas tecnológicas, crear webs sencillas y mejorar herramientas digitales.',
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
      ARRAY['tecnologia','formacion','productividad'],
      ARRAY['Explicar con paciencia','No pedir contraseñas ni accesos sensibles','Documentar soluciones reutilizables'],
      '[{"title":"Checklist básico de seguridad digital","type":"link","url":"https://www.incibe.es/"}]'::jsonb,
      false,
      'COMMUNITY'::"CommunityKind",
      'NONE'::"VerificationStatus",
      'pablo.demo@compartetutiempo.app'
    ),
    (
      'Asociación Tiempo Solidario',
      'Entidad social dedicada a conectar voluntariado de proximidad, apoyo educativo y acompañamiento comunitario.',
      'https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=1200&q=80',
      ARRAY['voluntariado','inclusion','educacion'],
      ARRAY['Participación responsable','Comunicación transparente','Priorizar necesidades reales de la comunidad'],
      '[{"title":"Manual de bienvenida voluntaria","type":"note","description":"Principios de participación para nuevos miembros."}]'::jsonb,
      false,
      'ORGANIZATION'::"CommunityKind",
      'APPROVED'::"VerificationStatus",
      'sofia.demo@compartetutiempo.app'
    ),
    (
      'Fundación Barrio Verde',
      'Organización enfocada en bienestar, hábitos saludables y actividades sostenibles en barrios.',
      'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=1200&q=80',
      ARRAY['salud','sostenibilidad','deporte'],
      ARRAY['Cuidar los espacios comunes','Promover hábitos seguros','Coordinar actividades con antelación'],
      '[{"title":"Calendario de actividades saludables","type":"note","description":"Ideas para dinamizar espacios comunitarios."}]'::jsonb,
      false,
      'ORGANIZATION'::"CommunityKind",
      'APPROVED'::"VerificationStatus",
      'miguel.demo@compartetutiempo.app'
    )
  ) AS t(name, description, image_url, topics, rules, resources, is_private, kind, verification_status, owner_email)
)
INSERT INTO communities (
  name,
  description,
  "imageUrl",
  topics,
  rules,
  resources,
  "isPrivate",
  kind,
  "verificationStatus",
  "creatorId",
  "updatedAt"
)
SELECT
  c.name,
  c.description,
  c.image_url,
  c.topics,
  c.rules,
  c.resources,
  c.is_private,
  c.kind,
  c.verification_status,
  u.id,
  NOW()
FROM community_rows c
JOIN users u ON u.email = c.owner_email
WHERE NOT EXISTS (
  SELECT 1 FROM communities existing WHERE existing.name = c.name
);

WITH community_rows AS (
  SELECT * FROM (VALUES
    ('Aprendizaje de Idiomas', 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80'),
    ('Círculo Creativo Local', 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80'),
    ('Red de Apoyo Digital', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80'),
    ('Asociación Tiempo Solidario', 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=1200&q=80'),
    ('Fundación Barrio Verde', 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=1200&q=80')
  ) AS t(name, image_url)
)
UPDATE communities c
SET "imageUrl" = cr.image_url, "updatedAt" = NOW()
FROM community_rows cr
WHERE c.name = cr.name AND (c."imageUrl" IS NULL OR c."imageUrl" = '');

WITH membership_rows AS (
  SELECT * FROM (VALUES
    ('Aprendizaje de Idiomas', 'ana.demo@compartetutiempo.app', 'OWNER'::"CommunityMembershipRole"),
    ('Aprendizaje de Idiomas', 'pablo.demo@compartetutiempo.app', 'MEMBER'::"CommunityMembershipRole"),
    ('Aprendizaje de Idiomas', 'sofia.demo@compartetutiempo.app', 'MEMBER'::"CommunityMembershipRole"),
    ('Círculo Creativo Local', 'laura.demo@compartetutiempo.app', 'OWNER'::"CommunityMembershipRole"),
    ('Círculo Creativo Local', 'ana.demo@compartetutiempo.app', 'MEMBER'::"CommunityMembershipRole"),
    ('Red de Apoyo Digital', 'pablo.demo@compartetutiempo.app', 'OWNER'::"CommunityMembershipRole"),
    ('Red de Apoyo Digital', 'sofia.demo@compartetutiempo.app', 'MEMBER'::"CommunityMembershipRole"),
    ('Asociación Tiempo Solidario', 'sofia.demo@compartetutiempo.app', 'OWNER'::"CommunityMembershipRole"),
    ('Fundación Barrio Verde', 'miguel.demo@compartetutiempo.app', 'OWNER'::"CommunityMembershipRole")
  ) AS t(community_name, user_email, role)
)
INSERT INTO community_memberships ("communityId", "userId", role, status)
SELECT c.id, u.id, m.role, 'ACTIVE'::"CommunityMembershipStatus"
FROM membership_rows m
JOIN communities c ON c.name = m.community_name
JOIN users u ON u.email = m.user_email
ON CONFLICT ("communityId", "userId")
DO UPDATE SET role = EXCLUDED.role, status = EXCLUDED.status;

WITH service_rows AS (
  SELECT * FROM (VALUES
    ('Clases de Inglés Conversacional', 'Mejora tu speaking con sesiones dinámicas y prácticas.', 'Sesiones orientadas a conversación real, entrevistas y confianza al hablar. Material propio y seguimiento semanal.', 2, 'Madrid, España', 40.4168, -3.7038, 'Madrid, España', 'tarde', 'EDUCACION'::"ServiceCategory", 'PRESENCIAL'::"ServiceType", 'OFFER'::"ServiceIntent", 120.0, 'https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=1200&q=80', 'ana.demo@compartetutiempo.app', NULL),
    ('Mentoría UX/UI para Portfolio', 'Revisión de portfolio, Figma y casos prácticos.', 'Mentorías para mejorar portfolio, heurísticas UX, diseño visual y preparación de entrevistas.', 2, 'Bilbao, España', 43.2630, -2.9350, 'Bilbao, España', 'flexible', 'TECNOLOGIA'::"ServiceCategory", 'HIBRIDO'::"ServiceType", 'OFFER'::"ServiceIntent", 120.0, 'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1200&q=80', 'sofia.demo@compartetutiempo.app', NULL),
    ('Sesión de Fotografía para Redes', 'Fotos naturales para marca personal o proyectos.', 'Planificación de sesión, localización, tomas clave y edición ligera para redes sociales.', 3, 'Valencia, España', 39.4699, -0.3763, 'Valencia, España', 'mañana-tarde', 'ARTE'::"ServiceCategory", 'PRESENCIAL'::"ServiceType", 'OFFER'::"ServiceIntent", 180.0, 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80', 'laura.demo@compartetutiempo.app', NULL),
    ('Entrenamiento Funcional al Aire Libre', 'Rutina adaptada a tu nivel y objetivos.', 'Sesiones de movilidad, fuerza y hábitos saludables en parques o espacios abiertos.', 1, 'Sevilla, España', 37.3891, -5.9845, 'Sevilla, España', 'mañana', 'DEPORTES'::"ServiceCategory", 'PRESENCIAL'::"ServiceType", 'OFFER'::"ServiceIntent", 60.0, 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80', 'miguel.demo@compartetutiempo.app', NULL),
    ('Ayuda para Crear una Web Básica', 'Landing sencilla para proyecto personal o asociación.', 'Acompañamiento para montar una página simple, revisar contenidos y dejar una base mantenible.', 3, 'Online', NULL, NULL, NULL, 'flexible', 'TECNOLOGIA'::"ServiceCategory", 'VIRTUAL'::"ServiceType", 'OFFER'::"ServiceIntent", 180.0, 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80', 'pablo.demo@compartetutiempo.app', NULL),
    ('Necesito apoyo con conversación en francés', 'Busco práctica semanal de francés básico.', 'Me gustaría practicar pronunciación y conversación cotidiana con alguien paciente.', 1, 'Online', NULL, NULL, NULL, 'tarde', 'EDUCACION'::"ServiceCategory", 'VIRTUAL'::"ServiceType", 'REQUEST'::"ServiceIntent", 60.0, 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80', 'miguel.demo@compartetutiempo.app', 'Aprendizaje de Idiomas'),
    ('Taller de Reels para proyectos sociales', 'Aprende a grabar y montar reels sencillos.', 'Actividad práctica para miembros del círculo creativo: guion, grabación y edición móvil.', 2, 'Valencia, España', 39.4699, -0.3763, 'Valencia, España', 'flexible', 'ARTE'::"ServiceCategory", 'HIBRIDO'::"ServiceType", 'OFFER'::"ServiceIntent", 120.0, 'https://images.unsplash.com/photo-1492724441997-5dc865305da7?auto=format&fit=crop&w=1200&q=80', 'laura.demo@compartetutiempo.app', 'Círculo Creativo Local'),
    ('Diagnóstico digital para asociaciones', 'Revisión de herramientas y presencia online.', 'Sesión comunitaria para detectar mejoras rápidas en web, formularios, seguridad y comunicación.', 2, 'Online', NULL, NULL, NULL, 'flexible', 'TECNOLOGIA'::"ServiceCategory", 'VIRTUAL'::"ServiceType", 'OFFER'::"ServiceIntent", 120.0, 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=80', 'pablo.demo@compartetutiempo.app', 'Red de Apoyo Digital')
  ) AS t(title, description, detailed_description, duration, location, latitude, longitude, formatted_address, availability, category, type, intent, price, image_url, owner_email, community_name)
)
INSERT INTO services (
  title, description, "detailedDescription", duration, location, latitude, longitude,
  "formattedAddress", availability, category, type, intent, status, price, "imageUrl", "userId", "communityId", "updatedAt"
)
SELECT
  s.title, s.description, s.detailed_description, s.duration, s.location, s.latitude, s.longitude,
  s.formatted_address, s.availability, s.category, s.type, s.intent, 'ACTIVO'::"ServiceStatus", s.price,
  s.image_url, u.id, c.id, NOW()
FROM service_rows s
JOIN users u ON u.email = s.owner_email
LEFT JOIN communities c ON c.name = s.community_name
WHERE NOT EXISTS (
  SELECT 1 FROM services existing WHERE existing.title = s.title AND existing."userId" = u.id
);

WITH image_rows AS (
  SELECT * FROM (VALUES
    ('Clases de Inglés Conversacional', 'https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=1200&q=80'),
    ('Mentoría UX/UI para Portfolio', 'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1200&q=80'),
    ('Sesión de Fotografía para Redes', 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80'),
    ('Entrenamiento Funcional al Aire Libre', 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80'),
    ('Ayuda para Crear una Web Básica', 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80'),
    ('Necesito apoyo con conversación en francés', 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80'),
    ('Taller de Reels para proyectos sociales', 'https://images.unsplash.com/photo-1492724441997-5dc865305da7?auto=format&fit=crop&w=1200&q=80'),
    ('Diagnóstico digital para asociaciones', 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=80')
  ) AS t(title, image_url)
)
UPDATE services s
SET "imageUrl" = i.image_url, "updatedAt" = NOW()
FROM image_rows i
WHERE s.title = i.title AND (s."imageUrl" IS NULL OR s."imageUrl" = '');

WITH rating_rows AS (
  SELECT * FROM (VALUES
    ('pablo.demo@compartetutiempo.app', 'Clases de Inglés Conversacional', 5, 'Muy práctica y con correcciones útiles.'),
    ('sofia.demo@compartetutiempo.app', 'Clases de Inglés Conversacional', 4, 'Sesión dinámica y bien preparada.'),
    ('ana.demo@compartetutiempo.app', 'Mentoría UX/UI para Portfolio', 5, 'Feedback claro y accionable.'),
    ('miguel.demo@compartetutiempo.app', 'Sesión de Fotografía para Redes', 5, 'La sesión quedó muy natural y profesional.'),
    ('laura.demo@compartetutiempo.app', 'Ayuda para Crear una Web Básica', 4, 'Muy paciente explicando los pasos técnicos.'),
    ('ana.demo@compartetutiempo.app', 'Entrenamiento Funcional al Aire Libre', 5, 'Adaptó la rutina a mi nivel perfectamente.')
  ) AS t(user_email, service_title, score, comment)
)
INSERT INTO ratings ("userId", "serviceId", score, comment)
SELECT u.id, s.id, r.score::smallint, r.comment
FROM rating_rows r
JOIN users u ON u.email = r.user_email
JOIN services s ON s.title = r.service_title
ON CONFLICT ("userId", "serviceId")
DO UPDATE SET score = EXCLUDED.score, comment = EXCLUDED.comment;

WITH event_rows AS (
  SELECT * FROM (VALUES
    ('Aprendizaje de Idiomas', 'Intercambio inglés-español', 'Sesión abierta para practicar conversación con temas guiados.', NOW() + INTERVAL '7 days', 'Online', 20, 'ana.demo@compartetutiempo.app'),
    ('Círculo Creativo Local', 'Paseo fotográfico urbano', 'Salida grupal para practicar composición y edición móvil.', NOW() + INTERVAL '10 days', 'Valencia, España', 12, 'laura.demo@compartetutiempo.app'),
    ('Red de Apoyo Digital', 'Clínica de dudas tecnológicas', 'Resolveremos dudas de herramientas, seguridad básica y presencia online.', NOW() + INTERVAL '14 days', 'Online', 25, 'pablo.demo@compartetutiempo.app'),
    ('Fundación Barrio Verde', 'Entrenamiento comunitario suave', 'Actividad de movilidad y hábitos saludables para todos los niveles.', NOW() + INTERVAL '12 days', 'Sevilla, España', 18, 'miguel.demo@compartetutiempo.app')
  ) AS t(community_name, title, description, date, location, capacity, owner_email)
)
INSERT INTO events ("communityId", title, description, date, location, capacity, "createdById", "updatedAt")
SELECT c.id, e.title, e.description, e.date, e.location, e.capacity, u.id, NOW()
FROM event_rows e
JOIN communities c ON c.name = e.community_name
JOIN users u ON u.email = e.owner_email
WHERE NOT EXISTS (
  SELECT 1 FROM events existing WHERE existing."communityId" = c.id AND existing.title = e.title
);
