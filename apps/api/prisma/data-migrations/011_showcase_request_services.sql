-- Añade solicitudes demo globales para que la pestaña "Solicitudes" tenga contenido realista.
-- Idempotente por título + propietario.

WITH request_rows AS (
  SELECT * FROM (VALUES
    ('Busco ayuda para organizar una mudanza pequeña', 'Necesito apoyo para planificar cajas, tiempos y transporte.', 'Me vendría bien una sesión para preparar checklist, orden de empaquetado y consejos para una mudanza de un piso pequeño.', 2, 'Calle Fuencarral 80, Madrid', 40.428520, -3.703790, 'Calle de Fuencarral, 80, 28004 Madrid, España', 'tarde', 'HOGAR'::"ServiceCategory", 'PRESENCIAL'::"ServiceType", 120.0, 'https://images.unsplash.com/photo-1600518464441-9154a4dea21b?auto=format&fit=crop&w=1200&q=80', 'jaime.demo.request1@compartetutiempo.app'),
    ('Necesito revisar mi CV tecnológico', 'Busco feedback para mejorar mi CV antes de enviar candidaturas.', 'Quiero revisar estructura, claridad, keywords y cómo presentar proyectos personales para posiciones junior.', 1, 'Online', NULL, NULL, NULL, 'flexible', 'TECNOLOGIA'::"ServiceCategory", 'VIRTUAL'::"ServiceType", 60.0, 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80', 'jaime.demo.request2@compartetutiempo.app'),
    ('Busco acompañamiento para empezar a correr', 'Me gustaría crear una rutina segura para principiantes.', 'Necesito orientación para empezar desde cero, evitar lesiones y mantener constancia las primeras semanas.', 1, 'Parque del Retiro, Madrid', 40.415260, -3.684500, 'Parque de El Retiro, Madrid, España', 'mañana', 'DEPORTES'::"ServiceCategory", 'PRESENCIAL'::"ServiceType", 60.0, 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=1200&q=80', 'jaime.demo.request3@compartetutiempo.app')
  ) AS t(title, description, detailed_description, duration, location, latitude, longitude, formatted_address, availability, category, type, price, image_url, email)
), users_upsert AS (
  INSERT INTO users (id, email, name, location, bio, skills, "timeCredits", role, "updatedAt")
  SELECT
    'auth0|demo-request-' || row_number() OVER (),
    email,
    split_part(email, '@', 1),
    location,
    'Perfil demo para solicitudes de ayuda.',
    ARRAY['aprendizaje', 'colaboración'],
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
