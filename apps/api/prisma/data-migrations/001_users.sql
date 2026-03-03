-- 001_users.sql
-- Usuarios base para entorno local de desarrollo.

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
    'auth0|test-user-1',
    'usuario1@test.com',
    'password123',
    'Usuario Test 1',
    '123456789',
    'Madrid, España',
    'Usuario de prueba para desarrollo',
    ARRAY['programacion', 'diseno'],
    'USER',
    300,
    NOW()
  ),
  (
    'auth0|test-user-2',
    'usuario2@test.com',
    'password123',
    'Usuario Test 2',
    '987654321',
    'Barcelona, España',
    'Otro usuario de prueba',
    ARRAY['musica', 'cocina'],
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
