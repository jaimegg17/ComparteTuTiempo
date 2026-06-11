-- Mejora las ubicaciones demo para que parezcan direcciones reales y se pinten mejor en el mapa.
-- Idempotente por título de servicio.

WITH location_rows AS (
  SELECT * FROM (VALUES
    ('Clases de Inglés Conversacional', 'Calle de Alcalá 45, Madrid', 40.419560, -3.698170, 'Calle de Alcalá, 45, 28014 Madrid, España'),
    ('Mentoría UX/UI para Portfolio', 'Plaza Moyúa 4, Bilbao', 43.263430, -2.935060, 'Moyúa Plaza, 4, 48009 Bilbao, Bizkaia, España'),
    ('Sesión de Fotografía para Redes', 'Calle de la Paz 10, Valencia', 39.470510, -0.374660, 'Carrer de la Pau, 10, 46003 València, España'),
    ('Entrenamiento Funcional al Aire Libre', 'Parque de María Luisa, Sevilla', 37.377250, -5.986920, 'Parque de María Luisa, 41013 Sevilla, España'),
    ('Ayuda para Crear una Web Básica', 'Calle Larios 5, Málaga', 36.720360, -4.421310, 'Calle Marqués de Larios, 5, 29015 Málaga, España'),
    ('Práctica de conversación en francés', 'Calle Huertas 12, Madrid', 40.413960, -3.699220, 'Calle de las Huertas, 12, 28012 Madrid, España'),
    ('Taller de Reels para proyectos sociales', 'Mercado de Colón, Valencia', 39.470960, -0.368700, 'Mercado de Colón, Carrer de Jorge Juan, 19, 46004 València, España')
  ) AS t(title, location, latitude, longitude, formatted_address)
)
UPDATE services s
SET
  location = l.location,
  latitude = l.latitude,
  longitude = l.longitude,
  "formattedAddress" = l.formatted_address,
  "updatedAt" = NOW()
FROM location_rows l
WHERE s.title = l.title;
