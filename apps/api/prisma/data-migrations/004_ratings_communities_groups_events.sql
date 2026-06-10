-- 004_ratings_communities_groups_events.sql
-- Ratings, comunidades, grupos, eventos y membresías demo.

WITH rating_rows AS (
  SELECT * FROM (
    VALUES
      ('usuario1@test.com', 'Entrenamiento Personal', 5, 'Excelente entrenamiento, muy profesional y motivador.'),
      ('usuario2@test.com', 'Clases de Guitarra', 4, 'Muy buenas clases, aprendí mucho en poco tiempo.'),
      ('usuario1@test.com', 'Limpieza del Hogar', 4, 'Muy buen servicio de limpieza, puntual y eficiente'),
      ('usuario2@test.com', 'Desarrollo Web', 5, 'Excelente desarrollador, código limpio y bien documentado')
  ) AS t(rater_email, service_title, score, comment)
)
INSERT INTO ratings (
  "userId",
  "serviceId",
  score,
  comment
)
SELECT
  u.id,
  s.id,
  rr.score,
  rr.comment
FROM rating_rows rr
JOIN users u ON u.email = rr.rater_email
JOIN services s ON s.title = rr.service_title
ON CONFLICT ("userId", "serviceId")
DO UPDATE SET
  score = EXCLUDED.score,
  comment = EXCLUDED.comment;

WITH community_rows AS (
  SELECT * FROM (
    VALUES
      ('Desarrolladores Madrid', 'Comunidad de desarrolladores en Madrid para intercambiar conocimientos técnicos.', false, 'usuario1@test.com'),
      ('Músicos Barcelona', 'Grupo de músicos en Barcelona para colaboraciones y aprendizaje.', false, 'usuario2@test.com')
  ) AS t(name, description, is_private, creator_email)
)
INSERT INTO communities (
  name,
  description,
  "isPrivate",
  "creatorId",
  "updatedAt"
)
SELECT
  c.name,
  c.description,
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

WITH group_rows AS (
  SELECT * FROM (
    VALUES
      ('Club de Lectura Madrid', 'Nos reunimos cada mes para discutir libros clásicos y contemporáneos.', 'PUBLICO', false, 'usuario1@test.com'),
      ('Programadores JavaScript', 'Grupo para compartir recursos y proyectos en JavaScript y frameworks modernos.', 'TRABAJO', false, 'usuario1@test.com'),
      ('Amantes del Running', 'Grupo para organizar carreras y entrenamientos conjuntos.', 'HOBBY', false, 'usuario2@test.com')
  ) AS t(name, description, group_type, is_private, creator_email)
)
INSERT INTO groups (
  name,
  description,
  type,
  "isPrivate",
  "creatorId",
  "updatedAt"
)
SELECT
  g.name,
  g.description,
  g.group_type::"GroupType",
  g.is_private,
  u.id,
  NOW()
FROM group_rows g
JOIN users u ON u.email = g.creator_email
WHERE NOT EXISTS (
  SELECT 1
  FROM groups existing
  WHERE existing.name = g.name
);

WITH event_rows AS (
  SELECT * FROM (
    VALUES
      ('Club de Lectura Madrid', 'Discusión: Don Quijote', 'Analizaremos los primeros capítulos de Don Quijote de la Mancha.', TIMESTAMP '2026-03-15 19:00:00', 'Café Literario, Madrid', 15),
      ('Programadores JavaScript', 'Workshop: React Hooks Avanzados', 'Aprenderemos a usar hooks personalizados y patrones avanzados en React.', TIMESTAMP '2026-03-09 18:00:00', 'Online via Zoom', 30),
      ('Amantes del Running', 'Carrera 10K Parque del Retiro', 'Carrera matinal de 10 kilómetros por el Retiro. Todos los niveles bienvenidos.', TIMESTAMP '2026-03-20 09:00:00', 'Parque del Retiro, Madrid', 50)
  ) AS t(group_name, title, description, event_date, location, capacity)
)
INSERT INTO events (
  "groupId",
  title,
  description,
  date,
  location,
  capacity
)
SELECT
  g.id,
  e.title,
  e.description,
  e.event_date,
  e.location,
  e.capacity
FROM event_rows e
JOIN groups g ON g.name = e.group_name
WHERE NOT EXISTS (
  SELECT 1
  FROM events existing
  WHERE existing."groupId" = g.id
    AND existing.title = e.title
    AND existing.date = e.event_date
);

WITH membership_rows AS (
  SELECT * FROM (
    VALUES
      ('usuario1@test.com', 'Club de Lectura Madrid', 'ADMIN', 'ACTIVA'),
      ('usuario2@test.com', 'Club de Lectura Madrid', 'MEMBER', 'ACTIVA'),
      ('usuario1@test.com', 'Programadores JavaScript', 'ADMIN', 'ACTIVA'),
      ('usuario2@test.com', 'Amantes del Running', 'ADMIN', 'ACTIVA')
  ) AS t(user_email, group_name, member_role, member_status)
)
INSERT INTO memberships (
  "userId",
  "groupId",
  role,
  status
)
SELECT
  u.id,
  g.id,
  m.member_role::"MembershipRole",
  m.member_status::"MembershipStatus"
FROM membership_rows m
JOIN users u ON u.email = m.user_email
JOIN groups g ON g.name = m.group_name
ON CONFLICT ("userId", "groupId")
DO UPDATE SET
  role = EXCLUDED.role,
  status = EXCLUDED.status;
