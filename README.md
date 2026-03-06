# ComparteTuTiempo ⏰ - Monorepo con Arquitectura Hexagonal

Plataforma de banco de tiempo para intercambiar habilidades usando horas como moneda. Implementada con **arquitectura hexagonal (puertos y adaptadores) + clean architecture** en un monorepo pnpm.

## 🏗️ Arquitectura

Este proyecto implementa **arquitectura hexagonal** con las siguientes capas:

- **🔄 Dominio**: Entidades puras, puertos (interfaces) y reglas de negocio
- **🎯 Aplicación**: Casos de uso que orquestan los puertos
- **🔌 Infraestructura**: Adaptadores que implementan los puertos (Prisma, JWT, etc.)
- **🎨 Presentación**: Controladores HTTP y DTOs generados desde Zod

## 📁 Estructura del Monorepo

```
ComparteTuTiempo/
├── apps/
│   ├── api/                    # NestJS API con arquitectura hexagonal
│   │   ├── src/
│   │   │   ├── modules/        # Módulos por bounded context
│   │   │   │   ├── services/   # Ejemplo completo implementado
│   │   │   │   │   ├── domain/         # Entidades + puertos
│   │   │   │   │   ├── application/    # Casos de uso
│   │   │   │   │   ├── infrastructure/ # Prisma + mappers
│   │   │   │   │   └── presentation/   # Controllers + DTOs
│   │   │   │   └── ...                 # Otros módulos
│   │   │   ├── common/         # Servicios compartidos
│   │   │   └── main.ts         # Bootstrap + Swagger
│   │   └── prisma/             # Esquema de base de datos
│   └── web/                    # Next.js App Router
│       └── src/
│           ├── app/            # Rutas
│           ├── entities/       # Tipos + UI primitivos
│           ├── features/       # Casos de uso UI
│           ├── widgets/        # Composiciones
│           └── shared/         # Cliente API + hooks
├── packages/
│   ├── contracts/              # ✅ Esquemas Zod compartidos
│   │   ├── src/
│   │   │   ├── auth.schemas.ts
│   │   │   ├── user.schemas.ts
│   │   │   ├── service.schemas.ts
│   │   │   └── index.ts
│   │   └── package.json
│   └── config/                 # ESLint + Prettier compartidos
└── package.json                # Scripts del monorepo
```

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js 18+
- pnpm 10+
- Docker Desktop

### Instalación
```bash
# Clonar el repositorio
git clone <tu-repo>
cd ComparteTuTiempo

# Instalar dependencias de todos los paquetes
pnpm install

# Iniciar base de datos
pnpm db:up

# Generar cliente Prisma
cd apps/api && pnpm db:generate

# Ejecutar migraciones
pnpm db:migrate

# Ejecutar seed (opcional)
pnpm db:seed
```

### Variables de entorno (frontend + maps)
```bash
# API
cp apps/api/env.example apps/api/.env

# Web
cp apps/web/env.example apps/web/.env.local
```

> Para autocompletado de ubicación (Google Places) en crear/editar servicios, configura:
> `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` en `apps/web/.env.local`.

### Ejecución
```bash
# Ejecutar todas las aplicaciones
pnpm dev

# O ejecutar por separado:
pnpm --filter @comparte-tu-tiempo/api dev    # Solo API
pnpm --filter @comparte-tu-tiempo/web dev    # Solo Web
```

### Puertos
- **API**: http://localhost:3001/api
- **Swagger**: http://localhost:3001/docs
- **Web**: http://localhost:3000
- **Base de datos**: localhost:5432

## 🔧 Scripts Disponibles

### Scripts del Monorepo
| Comando | Descripción |
|---------|-------------|
| `pnpm dev` | Ejecuta todas las aplicaciones |
| `pnpm build` | Construye todas las aplicaciones |
| `pnpm lint` | Linting en todo el monorepo |
| `pnpm typecheck` | Verificación de tipos |
| `pnpm test` | Tests en todo el monorepo |
| `pnpm db:up` | Inicia PostgreSQL |
| `pnpm db:down` | Detiene PostgreSQL |
| `pnpm db:reset` | Reinicia base de datos |

### Scripts por Aplicación
```bash
# API
cd apps/api
pnpm dev          # Desarrollo con watch mode
pnpm build        # Construcción para producción
pnpm db:generate  # Generar cliente Prisma
pnpm db:migrate   # Ejecutar migraciones

# Web
cd apps/web
pnpm dev          # Desarrollo con Next.js
pnpm build        # Construcción para producción
```

## 🎯 Implementación Actual

### ✅ Completado
- **Monorepo**: Estructura pnpm workspaces
- **Contratos**: Esquemas Zod para auth, user, service
- **API Services**: Vertical slice completo implementado
  - Entidad de dominio con reglas de negocio
  - Puerto del repositorio (interfaz)
  - Casos de uso de aplicación
  - Implementación Prisma + mapper
  - Controlador con DTOs generados desde Zod
- **Prisma**: Esquema de base de datos en 3FN
- **Swagger**: Documentación automática desde Zod

### 🚧 En Progreso
- **Autenticación**: JWT strategy + guard
- **Otros módulos**: Users, Communities, Messages, Ratings
- **Web**: Páginas y formularios con React Hook Form

### 📋 Próximos Pasos
- [ ] Implementar autenticación JWT completa
- [ ] Crear módulos restantes (Users, Communities, etc.)
- [ ] Implementar formularios en Next.js
- [ ] Tests unitarios y e2e
- [ ] CI/CD pipeline

## 🏛️ Principios de Arquitectura

### **Arquitectura Hexagonal**
- **Puertos**: Interfaces que definen contratos
- **Adaptadores**: Implementaciones concretas
- **Inversión de dependencias**: El dominio no depende de infraestructura

### **Clean Architecture**
- **Dominio**: Reglas de negocio puras
- **Aplicación**: Casos de uso que orquestan
- **Infraestructura**: Implementaciones técnicas
- **Presentación**: Controllers y DTOs

### **Contratos Compartidos**
- **Zod**: Esquemas de validación como fuente única de verdad
- **Tipos TypeScript**: Generados automáticamente desde Zod
- **DTOs**: Generados para Swagger con `@anatine/zod-nestjs`

## 🧪 Testing

### Tests Unitarios
```bash
# Tests de casos de uso
pnpm --filter @comparte-tu-tiempo/api test

# Tests con adaptadores en memoria
pnpm --filter @comparte-tu-tiempo/api test:watch
```

### Tests E2E
```bash
# Tests end-to-end
pnpm --filter @comparte-tu-tiempo/api test:e2e
```

## 🐳 Docker

### Base de Datos
```bash
# Solo PostgreSQL
docker-compose up postgres -d

# Ver logs
docker-compose logs postgres

# Detener
docker-compose down postgres
```

## 📚 Tecnologías

### **API (NestJS)**
- **Framework**: NestJS 11
- **ORM**: Prisma + PostgreSQL
- **Validación**: Zod + @anatine/zod-nestjs
- **Autenticación**: JWT + Passport
- **Documentación**: Swagger/OpenAPI

### **Web (Next.js)**
- **Framework**: Next.js 15 (App Router)
- **Formularios**: React Hook Form + Zod resolver
- **Estado**: TanStack Query
- **Estilos**: Tailwind CSS v4

### **Compartido**
- **Package Manager**: pnpm workspaces
- **Validación**: Zod schemas
- **Tipos**: TypeScript generado desde Zod
- **Linting**: ESLint + Prettier

## 🔍 Monitoreo y Debugging

### Verificar Estado
```bash
# Estado de las aplicaciones
pnpm --filter @comparte-tu-tiempo/api dev
pnpm --filter @comparte-tu-tiempo/web dev

# Estado de la base de datos
docker ps | grep postgres
```

### Logs
```bash
# Logs de PostgreSQL
docker logs comparte-tiempo-postgres

# Logs de la API
# Se muestran en la consola durante desarrollo
```

## 🚨 Solución de Problemas

### Error: "Cannot find module"
```bash
# Reinstalar dependencias
pnpm install

# Limpiar cache
pnpm store prune
```

### Error: "Database connection failed"
```bash
# Verificar que Docker esté ejecutándose
docker ps

# Reiniciar base de datos
pnpm db:reset
```

### Error: "Prisma client not generated"
```bash
cd apps/api
pnpm db:generate
```

## 📖 Recursos

- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Zod Documentation](https://zod.dev/)
- [Arquitectura Hexagonal](https://alistair.cockburn.us/hexagonal-architecture/)

## 🤝 Contribución

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/amazing-feature`)
3. Commit tus cambios (`git commit -m 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.
