# Data migrations (local dev)

Estos archivos SQL pueblan la base de datos local de forma **idempotente**.

## Orden

1. `001_users.sql`
2. `002_services.sql`
3. `003_exchanges_messages.sql`
4. `004_ratings_communities_groups_events.sql`

## Ejecución

Desde `apps/api`:

- `pnpm db:data:migrate` → aplica solo data migrations pendientes
- `pnpm db:seed` → ejecuta el runner de data migrations
- `pnpm db:reset:local` → resetea local + push schema + aplica datos demo

## Tracking

El runner crea/usa la tabla `data_migrations` para registrar nombre y checksum.
Si cambias el contenido de una migración ya aplicada, el runner falla para evitar drift.
