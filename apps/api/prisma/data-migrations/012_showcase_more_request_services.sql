-- Adds a second batch of global demo requests so the marketplace request tab always has visible content.
-- Idempotent by title and owner email.

WITH request_rows AS (
  SELECT * FROM (VALUES
    ('Necesito practicar conversación en inglés', 'Busco una persona para practicar conversación básica una vez por semana.', 'Me gustaría ganar confianza hablando en inglés con conversaciones sencillas sobre trabajo, viajes y situaciones cotidianas. Idealmente online o en una cafetería tranquila.', 1, 'Online', NULL, NULL, NULL, 'tarde', 'EDUCACION'::"ServiceCategory", 'VIRTUAL'::"ServiceType", 60.0, 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80', 'request.english.demo@compartetutiempo.app'),
    ('Busco ayuda para arreglar una estantería', 'Necesito orientación para fijar una estantería de forma segura.', 'Tengo una estantería pequeña que quiero colocar en la pared y necesito ayuda para elegir tacos, medir y dejarla bien nivelada.', 2, 'Calle de Alcalá 120, Madrid', 40.421520, -3.682360, 'Calle de Alcalá, 120, 28009 Madrid, España', 'mañana', 'HOGAR'::"ServiceCategory", 'PRESENCIAL'::"ServiceType", 120.0, 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80', 'request.home.demo@compartetutiempo.app'),
    ('Necesito revisar una landing page', 'Busco feedback de diseño y claridad para una página web sencilla.', 'Estoy preparando una landing para un proyecto académico y necesito una revisión de estructura, mensajes principales y experiencia móvil.', 1, 'Online', NULL, NULL, NULL, 'flexible', 'TECNOLOGIA'::"ServiceCategory", 'VIRTUAL'::"ServiceType", 75.0, 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80', 'request.web.demo@compartetutiempo.app'),
    ('Busco acompañamiento para una ruta suave', 'Quiero hacer una ruta urbana tranquila y prefiero ir con alguien.', 'Me apetece empezar a caminar más los fines de semana con rutas fáciles por Madrid, sin ritmo exigente y con paradas si hace falta.', 2, 'Madrid Río, Madrid', 40.407510, -3.722150, 'Madrid Río, Madrid, España', 'fin de semana', 'DEPORTES'::"ServiceCategory", 'PRESENCIAL'::"ServiceType", 90.0, 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80', 'request.walk.demo@compartetutiempo.app'),
    ('Necesito ideas para organizar comidas semanales', 'Busco ayuda para planificar menús sencillos y saludables.', 'Quiero aprender a organizar compras y comidas para varios días, con recetas fáciles, económicas y adaptadas a poco tiempo disponible.', 1, 'Online', NULL, NULL, NULL, 'noche', 'SALUD'::"ServiceCategory", 'VIRTUAL'::"ServiceType", 60.0, 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1200&q=80', 'request.meals.demo@compartetutiempo.app')
  ) AS t(title, description, detailed_description, duration, location, latitude, longitude, formatted_address, availability, category, type, price, image_url, email)
), users_upsert AS (
  INSERT INTO users (id, email, name, location, bio, skills, "timeCredits", role, "updatedAt")
  SELECT
    'auth0|demo-extra-request-' || row_number() OVER (),
    email,
    regexp_replace(split_part(email, '@', 1), '[._-]', ' ', 'g'),
    COALESCE(location, 'Madrid'),
    'Perfil demo con una solicitud publicada para probar el marketplace.',
    ARRAY['solicitudes', 'colaboración'],
    300,
    'USER'::"UserRole",
    NOW()
  FROM request_rows
  ON CONFLICT (email) DO UPDATE SET "updatedAt" = NOW()
  RETURNING id, email
)
INSERT INTO services (
  title, description, "detailedDescription", duration, location, latitude, longitude,
  "formattedAddress", availability, category, type, intent, status, price, "imageUrl", "userId", "updatedAt"
)
SELECT
  r.title, r.description, r.detailed_description, r.duration, r.location, r.latitude, r.longitude,
  r.formatted_address, r.availability, r.category, r.type, 'REQUEST'::"ServiceIntent", 'ACTIVO'::"ServiceStatus", r.price, r.image_url, u.id, NOW()
FROM request_rows r
JOIN users u ON u.email = r.email
WHERE NOT EXISTS (
  SELECT 1 FROM services s WHERE s.title = r.title AND s."userId" = u.id
);
