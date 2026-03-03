-- 003_exchanges_messages.sql
-- Intercambios y mensajes demo.

WITH exchange_rows AS (
  SELECT * FROM (
    VALUES
      (
        'ex-cleaning-pending',
        'usuario1@test.com',
        'usuario2@test.com',
        'Limpieza del Hogar',
        TIMESTAMP '2026-03-10 10:00:00',
        'PENDING',
        2.00
      ),
      (
        'ex-guitar-confirmed',
        'usuario2@test.com',
        'usuario1@test.com',
        'Clases de Guitarra',
        TIMESTAMP '2026-03-08 17:00:00',
        'CONFIRMED',
        1.50
      ),
      (
        'ex-training-completed-1',
        'usuario1@test.com',
        'usuario2@test.com',
        'Entrenamiento Personal',
        TIMESTAMP '2026-02-20 09:00:00',
        'COMPLETED',
        1.00
      ),
      (
        'ex-training-completed-2',
        'usuario2@test.com',
        'usuario1@test.com',
        'Entrenamiento Personal',
        TIMESTAMP '2026-02-21 12:00:00',
        'COMPLETED',
        1.50
      ),
      (
        'ex-cleaning-completed',
        'usuario1@test.com',
        'usuario2@test.com',
        'Limpieza del Hogar',
        TIMESTAMP '2026-02-18 11:30:00',
        'COMPLETED',
        2.00
      ),
      (
        'ex-webdev-completed',
        'usuario2@test.com',
        'usuario1@test.com',
        'Desarrollo Web',
        TIMESTAMP '2026-02-17 16:00:00',
        'COMPLETED',
        3.00
      )
  ) AS t(
    exchange_key,
    requester_email,
    offered_email,
    service_title,
    exchange_date,
    exchange_state,
    exchanged_time
  )
),
resolved_exchanges AS (
  SELECT
    e.exchange_key,
    requester.id AS requested_by_id,
    offered.id AS offered_by_id,
    service.id AS service_id,
    e.exchange_date,
    e.exchange_state,
    e.exchanged_time
  FROM exchange_rows e
  JOIN users requester ON requester.email = e.requester_email
  JOIN users offered ON offered.email = e.offered_email
  JOIN services service ON service.title = e.service_title
)
INSERT INTO exchanges (
  "requestedById",
  "offeredById",
  "serviceId",
  date,
  state,
  "exchangedTime",
  "updatedAt"
)
SELECT
  r.requested_by_id,
  r.offered_by_id,
  r.service_id,
  r.exchange_date,
  r.exchange_state::"ExchangeStatus",
  r.exchanged_time,
  NOW()
FROM resolved_exchanges r
WHERE NOT EXISTS (
  SELECT 1
  FROM exchanges existing
  WHERE existing."requestedById" = r.requested_by_id
    AND existing."offeredById" = r.offered_by_id
    AND existing."serviceId" = r.service_id
    AND existing.date = r.exchange_date
);

WITH exchange_rows AS (
  SELECT * FROM (
    VALUES
      (
        'ex-cleaning-pending',
        'usuario1@test.com',
        'usuario2@test.com',
        'Limpieza del Hogar',
        TIMESTAMP '2026-03-10 10:00:00'
      ),
      (
        'ex-guitar-confirmed',
        'usuario2@test.com',
        'usuario1@test.com',
        'Clases de Guitarra',
        TIMESTAMP '2026-03-08 17:00:00'
      ),
      (
        'ex-training-completed-1',
        'usuario1@test.com',
        'usuario2@test.com',
        'Entrenamiento Personal',
        TIMESTAMP '2026-02-20 09:00:00'
      ),
      (
        'ex-training-completed-2',
        'usuario2@test.com',
        'usuario1@test.com',
        'Entrenamiento Personal',
        TIMESTAMP '2026-02-21 12:00:00'
      ),
      (
        'ex-cleaning-completed',
        'usuario1@test.com',
        'usuario2@test.com',
        'Limpieza del Hogar',
        TIMESTAMP '2026-02-18 11:30:00'
      ),
      (
        'ex-webdev-completed',
        'usuario2@test.com',
        'usuario1@test.com',
        'Desarrollo Web',
        TIMESTAMP '2026-02-17 16:00:00'
      )
  ) AS t(exchange_key, requester_email, offered_email, service_title, exchange_date)
),
resolved_exchanges AS (
  SELECT
    e.exchange_key,
    requester.id AS requested_by_id,
    offered.id AS offered_by_id,
    service.id AS service_id,
    e.exchange_date
  FROM exchange_rows e
  JOIN users requester ON requester.email = e.requester_email
  JOIN users offered ON offered.email = e.offered_email
  JOIN services service ON service.title = e.service_title
),
message_rows AS (
  SELECT * FROM (
    VALUES
      (
        'ex-cleaning-pending',
        'usuario1@test.com',
        'Hola! Me interesa tu servicio de limpieza. ¿Estarías disponible el próximo fin de semana?'
      ),
      (
        'ex-cleaning-pending',
        'usuario2@test.com',
        '¡Hola! Sí, estoy disponible el sábado por la mañana. ¿Te parece bien?'
      ),
      (
        'ex-cleaning-pending',
        'usuario1@test.com',
        'Perfecto! Confirmamos entonces para el sábado a las 10:00 AM.'
      ),
      (
        'ex-guitar-confirmed',
        'usuario2@test.com',
        'Hola! ¿Podrías ayudarme con clases de guitarra esta semana?'
      ),
      (
        'ex-guitar-confirmed',
        'usuario1@test.com',
        '¡Por supuesto! Te propongo empezar con acordes y ritmo.'
      )
  ) AS t(exchange_key, sender_email, content)
),
exchange_lookup AS (
  SELECT
    r.exchange_key,
    e.id AS exchange_id
  FROM resolved_exchanges r
  JOIN exchanges e ON e."requestedById" = r.requested_by_id
    AND e."offeredById" = r.offered_by_id
    AND e."serviceId" = r.service_id
    AND e.date = r.exchange_date
),
resolved_messages AS (
  SELECT
    l.exchange_id,
    u.id AS sender_id,
    m.content
  FROM message_rows m
  JOIN exchange_lookup l ON l.exchange_key = m.exchange_key
  JOIN users u ON u.email = m.sender_email
)
INSERT INTO messages (
  "exchangeId",
  "senderId",
  content,
  "isRead",
  "updatedAt"
)
SELECT
  rm.exchange_id,
  rm.sender_id,
  rm.content,
  false,
  NOW()
FROM resolved_messages rm
WHERE NOT EXISTS (
  SELECT 1
  FROM messages existing
  WHERE existing."exchangeId" = rm.exchange_id
    AND existing."senderId" = rm.sender_id
    AND existing.content = rm.content
);
