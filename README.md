# ComparteTuTiempo

**ComparteTuTiempo** es una plataforma de banco de tiempo desarrollada como Trabajo de Fin de Grado. Permite a las personas intercambiar servicios y habilidades usando el tiempo como unidad de valor: publicar ofertas, crear solicitudes, pedir intercambios, conversar por chat, valorar servicios y participar en comunidades u organizaciones.

El proyecto está organizado como un **monorepo pnpm** con frontend Next.js, API NestJS, base de datos PostgreSQL con Prisma y contratos TypeScript/Zod compartidos.

## Estado actual

La aplicación está preparada para ejecución local y despliegue en servicios con capa gratuita:

- **Frontend**: Next.js en Vercel.
- **API**: NestJS en Render.
- **Base de datos**: PostgreSQL/Supabase.
- **Autenticación**: Auth0.
- **Imágenes**: Cloudinary.
- **Mapas y ubicaciones**: Google Maps Platform, Places y Geocoding, con degradación a entrada manual si Google no está disponible.

URLs de referencia del entorno desplegado:

- Frontend: <https://project-w4dax.vercel.app>
- API healthcheck: <https://comparte-tu-tiempo-api.onrender.com/api/health>

> Las URLs anteriores corresponden al entorno de demostración del proyecto. Para una instalación propia deben configurarse las variables de entorno indicadas más abajo.

## Funcionalidades principales

- Registro e inicio de sesión mediante Auth0.
- Perfil de usuario con imagen, biografía, habilidades, datos básicos y ubicación.
- Marketplace de servicios con ofertas y demandas.
- Creación, edición, eliminación, búsqueda y filtrado de servicios.
- Vista de mapa y búsqueda por cercanía.
- Autocompletado de ubicaciones con Google Places en formularios de ubicación.
- Intercambios entre usuarios con estados y detalle de participantes.
- Chat asociado a cada intercambio.
- Notificaciones internas para solicitudes, respuestas y mensajes.
- Valoraciones de servicios con datos públicos del autor.
- Comunidades y organizaciones con eventos, miembros, recursos y control de acceso.
- Subida de imágenes mediante Cloudinary.
- Paneles administrativos protegidos en la interfaz.
- Internacionalización básica en español e inglés.

## Arquitectura

El backend sigue una organización inspirada en arquitectura hexagonal y Clean Architecture:

- **Dominio**: entidades, tipos y reglas de negocio.
- **Aplicación**: casos de uso.
- **Infraestructura**: persistencia con Prisma, mappers y servicios externos.
- **Presentación**: controladores HTTP, guards y DTOs.

El frontend está implementado con Next.js usando `pages/`, componentes reutilizables, hooks y clientes API compartidos.

## Estructura del repositorio

```text
ComparteTuTiempo/
├── apps/
│   ├── api/                 # API NestJS
│   │   ├── prisma/          # Prisma schema, migraciones y datos demo
│   │   └── src/             # Módulos, casos de uso y controladores
│   └── web/                 # Frontend Next.js
│       ├── pages/           # Rutas de Next.js
│       ├── src/             # Componentes, hooks y clientes compartidos
│       └── public/locales/  # Traducciones
├── packages/
│   └── contracts/           # Esquemas y tipos compartidos
├── docs/
│   └── manuales/            # Manuales LaTeX del TFG
├── DEPLOYMENT.md            # Guía de despliegue free-tier
├── Dockerfile.api           # Imagen de producción de la API
└── package.json             # Scripts del monorepo
```

## Requisitos previos

Para ejecutar el proyecto en local se necesita:

- Node.js 18 o superior.
- pnpm 10.x.
- Docker Desktop o una instancia PostgreSQL compatible.
- Cuenta/tenant de Auth0.
- Cuenta de Cloudinary.
- Clave de Google Maps Platform con estas APIs activadas:
  - Maps JavaScript API.
  - Places API.
  - Geocoding API.

## Instalación local

Clonar el repositorio e instalar dependencias:

```bash
git clone <url-del-repositorio>
cd ComparteTuTiempo
pnpm install
```

Levantar PostgreSQL local con Docker:

```bash
pnpm db:up
```

Configurar variables de entorno:

```bash
cp apps/api/env.example apps/api/.env
cp apps/web/env.example apps/web/.env.local
```

Generar Prisma Client y aplicar migraciones:

```bash
pnpm --filter @comparte-tu-tiempo/api db:generate
pnpm --filter @comparte-tu-tiempo/api db:migrate
```

Opcionalmente, cargar datos de demostración:

```bash
pnpm --filter @comparte-tu-tiempo/api db:seed
pnpm --filter @comparte-tu-tiempo/api db:data:migrate
```

Ejecutar el proyecto:

```bash
pnpm dev
```

O ejecutar cada aplicación por separado:

```bash
pnpm --filter @comparte-tu-tiempo/api dev
pnpm --filter @comparte-tu-tiempo/web dev
```

Puertos por defecto:

- Web: <http://localhost:3000>
- API: <http://localhost:3001/api>
- Swagger: <http://localhost:3001/docs>
- PostgreSQL local: `localhost:5432`

## Variables de entorno principales

### API: `apps/api/.env`

| Variable | Descripción |
| --- | --- |
| `DATABASE_URL` | Cadena de conexión principal a PostgreSQL. |
| `DIRECT_URL` | Cadena directa para Prisma, útil en Supabase. |
| `PORT` | Puerto de la API. Por defecto, `3001`. |
| `NODE_ENV` | Entorno de ejecución. |
| `AUTH0_DOMAIN` | Dominio del tenant de Auth0. |
| `AUTH0_CLIENT_ID` | Client ID de Auth0. |
| `AUTH0_CLIENT_SECRET` | Client Secret de Auth0. |
| `AUTH0_AUDIENCE` | Audience/API Identifier configurado en Auth0. |
| `FRONTEND_URL` | URL del frontend permitida por CORS. |
| `CORS_ORIGIN` | Orígenes permitidos por CORS. |
| `CLOUDINARY_CLOUD_NAME` | Cloud name de Cloudinary. |
| `CLOUDINARY_API_KEY` | API key de Cloudinary. |
| `CLOUDINARY_API_SECRET` | API secret de Cloudinary. |
| `GOOGLE_MAPS_API_KEY` | Clave para geocodificación desde backend. |

### Web: `apps/web/.env.local`

| Variable | Descripción |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | URL pública de la API, por ejemplo `http://localhost:3001/api`. |
| `AUTH0_SECRET` | Secreto usado por Auth0 Next SDK. |
| `AUTH0_BASE_URL` | URL base del frontend. |
| `AUTH0_ISSUER_BASE_URL` | URL del tenant de Auth0. |
| `AUTH0_CLIENT_ID` | Client ID de la aplicación web Auth0. |
| `AUTH0_CLIENT_SECRET` | Client Secret de la aplicación web Auth0. |
| `AUTH0_AUDIENCE` | Audience/API Identifier de Auth0. |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Clave pública de Google Maps para mapas y autocompletado. |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Email público opcional mostrado en la página de información/contacto. |

No se deben commitear archivos `.env`, `.env.local` ni backups con secretos.

## Scripts útiles

### Monorepo

| Comando | Descripción |
| --- | --- |
| `pnpm dev` | Ejecuta API y web en desarrollo. |
| `pnpm build` | Compila todos los paquetes. |
| `pnpm typecheck` | Ejecuta comprobación de tipos. |
| `pnpm test` | Ejecuta los tests. |
| `pnpm db:up` | Levanta PostgreSQL local con Docker. |
| `pnpm db:down` | Detiene PostgreSQL local. |
| `pnpm db:reset` | Reinicia la base de datos local. |
| `pnpm deploy:web:build` | Build de producción del frontend. |
| `pnpm deploy:api:build` | Genera Prisma Client y compila la API. |
| `pnpm deploy:api:migrate` | Aplica migraciones Prisma en producción. |

### API

```bash
pnpm --filter @comparte-tu-tiempo/api dev
pnpm --filter @comparte-tu-tiempo/api build
pnpm --filter @comparte-tu-tiempo/api typecheck
pnpm --filter @comparte-tu-tiempo/api test
pnpm --filter @comparte-tu-tiempo/api db:generate
pnpm --filter @comparte-tu-tiempo/api db:migrate
pnpm --filter @comparte-tu-tiempo/api db:data:migrate
```

### Web

```bash
pnpm --filter @comparte-tu-tiempo/web dev
pnpm --filter @comparte-tu-tiempo/web build
pnpm --filter @comparte-tu-tiempo/web typecheck
pnpm --filter @comparte-tu-tiempo/web test
```

## Tests y validación antes de integrar en `main`

Antes de fusionar cambios importantes en `main`, se recomienda ejecutar:

```bash
pnpm --filter @comparte-tu-tiempo/api typecheck
pnpm --filter @comparte-tu-tiempo/api test
pnpm --filter @comparte-tu-tiempo/api build

pnpm --filter @comparte-tu-tiempo/web typecheck
pnpm --filter @comparte-tu-tiempo/web test
pnpm --filter @comparte-tu-tiempo/web build
```

También conviene comprobar manualmente en producción:

- login/logout;
- creación, edición, borrado y búsqueda de servicios;
- mapa, autocompletado y búsqueda por cercanía;
- solicitud y respuesta de intercambios;
- chat y notificaciones;
- perfil y valoraciones;
- comunidades, organizaciones y eventos;
- rutas públicas como `/about`, `/faq` y `/login`;
- guardas de páginas administrativas.

## Despliegue

La guía detallada de despliegue está en:

```text
DEPLOYMENT.md
```

Resumen del despliegue actual:

- Vercel sirve `apps/web`.
- Render construye la API usando `Dockerfile.api`.
- Render debe ejecutar como comando de arranque:

```bash
pnpm --filter @comparte-tu-tiempo/api start:prod:migrate
```

Este comando aplica migraciones Prisma, intenta ejecutar migraciones de datos de demostración y arranca la API.

## Google Maps Platform

Para que mapas, geocodificación y autocompletado funcionen correctamente se necesita una clave con:

- Maps JavaScript API habilitada.
- Places API habilitada.
- Geocoding API habilitada.
- Facturación activa en Google Cloud.
- Referrers web autorizados para el frontend.

Para el entorno desplegado actual, los referrers mínimos son:

```text
https://project-w4dax.vercel.app
https://project-w4dax.vercel.app/*
http://localhost:3000
http://localhost:3000/*
```

Si Google no está disponible, la aplicación debe permitir introducir la ubicación manualmente.

## Documentación adicional

- `DEPLOYMENT.md`: despliegue en Vercel, Render y Supabase.
- `AUTH0_SETUP.md`: configuración de Auth0.
- `DATABASE_SETUP.md`: configuración de base de datos.
- `TESTING_GUIDE.md`: guía de pruebas.
- `QA_AUDIT.md`: notas de auditoría y QA.
- `docs/manuales/Anexo_Manual_Usuario.tex`: manual de usuario en formato LaTeX.
- `docs/manuales/Anexo_Manual_Instalacion.tex`: manual de instalación en formato LaTeX.

## Manuales del TFG

Se incluyen dos anexos en LaTeX dentro de `docs/manuales/`:

- **Manual de usuario**: explica el uso funcional de la plataforma desde la perspectiva de una persona usuaria.
- **Manual de instalación**: explica cómo preparar el entorno local, configurar servicios externos, ejecutar migraciones y validar el sistema.

Estos archivos están pensados para integrarse en la memoria del TFG o conservarse como documentación reproducible del proyecto.

## Licencia

Proyecto desarrollado con fines académicos para un Trabajo de Fin de Grado.
