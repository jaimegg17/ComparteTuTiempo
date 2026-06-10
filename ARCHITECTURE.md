# 📐 Arquitectura del Proyecto ComparteTuTiempo

## 🎯 Visión General

**ComparteTuTiempo** es una plataforma de banco de tiempo que permite a los usuarios intercambiar habilidades usando horas como moneda. El proyecto está implementado como un **monorepo** utilizando **pnpm workspaces** y sigue los principios de **Arquitectura Hexagonal (Puertos y Adaptadores)** combinada con **Clean Architecture**.

---

## 🏗️ Estructura del Monorepo

```
ComparteTuTiempo/
├── apps/
│   ├── api/                    # Backend NestJS con arquitectura hexagonal
│   │   ├── prisma/             # Esquema de base de datos y migraciones
│   │   │   ├── schema.prisma   # Modelos de datos en 3FN
│   │   │   └── seed.ts         # Datos de prueba
│   │   └── src/
│   │       ├── main.ts         # Bootstrap de la aplicación
│   │       ├── app.module.ts   # Módulo raíz
│   │       ├── common/         # Servicios compartidos
│   │       │   ├── auth/       # Auth0 Strategy, Guards, Interceptors
│   │       │   ├── prisma/     # PrismaService y PrismaModule
│   │       │   └── cloudinary/ # Servicio de subida de imágenes
│   │       └── modules/        # Módulos por bounded context
│   │           ├── auth/       # Autenticación (signup, signin, me)
│   │           ├── services/   # Gestión de servicios
│   │           ├── users/      # Perfiles de usuario
│   │           ├── exchanges/  # Intercambios de servicios
│   │           ├── messages/   # Sistema de mensajería
│   │           ├── ratings/    # Valoraciones de servicios
│   │           ├── groups/     # Grupos de usuarios
│   │           ├── events/     # Eventos de grupos
│   │           ├── communities/# Comunidades
│   │           ├── memberships/# Membresías de grupos
│   │           └── upload/     # Subida de archivos (Cloudinary)
│   └── web/                    # Frontend Next.js 15 (App Router)
│       └── src/
│           ├── app/            # Rutas de Next.js (no existe aún, usar pages/)
│           ├── components/     # Componentes reutilizables
│           │   ├── chat/        # Componente de chat
│           │   ├── profile/     # Componentes de perfil
│           │   ├── ratings/    # Componentes de valoraciones
│           │   ├── filters/    # Filtros de búsqueda
│           │   └── ui/         # Componentes UI base
│           ├── features/       # Features por dominio
│           │   └── service/    # Marketplace y listado de servicios
│           ├── contexts/       # React Contexts
│           ├── hooks/           # Custom hooks
│           ├── shared/         # Código compartido
│           │   ├── api/        # Cliente API y servicios
│           │   └── hooks/      # Hooks compartidos
│           └── widgets/        # Widgets compuestos
│
├── packages/
│   ├── contracts/              # Contratos compartidos (Zod schemas)
│   │   └── src/
│   │       ├── auth.schemas.ts
│   │       ├── user.schemas.ts
│   │       ├── service.schemas.ts
│   │       ├── exchange.schemas.ts
│   │       ├── message.schemas.ts
│   │       ├── rating.schemas.ts
│   │       ├── group.schemas.ts
│   │       ├── event.schemas.ts
│   │       ├── membership.schemas.ts
│   │       └── index.ts
│   └── config/                  # Configuración compartida (ESLint, Prettier)
│
└── docker-compose.yml           # Configuración de PostgreSQL
```

---

## 🎨 Arquitectura Hexagonal

Cada módulo sigue la estructura de **Arquitectura Hexagonal** con las siguientes capas:

### 1. **Domain (Dominio)**
- **Entidades**: Objetos de dominio con lógica de negocio
- **Puertos (Interfaces)**: Contratos que definen las operaciones necesarias
- **Tokens**: Identificadores para inyección de dependencias
- **Tipos**: Tipos TypeScript específicos del dominio

**Ejemplo (Services):**
```
domain/
├── service.entity.ts          # Entidad Service con reglas de negocio
├── service-repository.port.ts # Interfaz del repositorio
└── tokens.ts                  # Tokens para DI
```

### 2. **Application (Aplicación)**
- **Use Cases**: Casos de uso que orquestan la lógica de negocio
- Cada caso de uso tiene:
  - `Request`: Interfaz de entrada
  - `Response`: Interfaz de salida
  - `execute()`: Método principal

**Ejemplo:**
```typescript
// create-service.use-case.ts
export interface CreateServiceRequest {
  data: ServiceCreate;
  userId: string;
}

export interface CreateServiceResponse {
  service: Service;
}

@Injectable()
export class CreateServiceUseCase {
  async execute(request: CreateServiceRequest): Promise<CreateServiceResponse> {
    // Lógica de negocio
  }
}
```

### 3. **Infrastructure (Infraestructura)**
- **Repositorios**: Implementaciones concretas de los puertos usando Prisma
- **Mappers**: Conversión entre modelos de Prisma y entidades de dominio

**Ejemplo:**
```typescript
// prisma-service-repository.ts
@Injectable()
export class PrismaServiceRepository implements ServiceRepositoryPort {
  constructor(
    private prisma: PrismaService,
    private mapper: ServiceMapper,
  ) {}
  
  async create(data: ServiceCreate): Promise<Service> {
    const prismaService = await this.prisma.service.create({ data });
    return this.mapper.toDomain(prismaService);
  }
}
```

### 4. **Presentation (Presentación)**
- **Controllers**: Endpoints HTTP con decoradores de NestJS
- **DTOs**: Objetos de transferencia de datos (generados desde Zod o manuales)

**Ejemplo:**
```typescript
@Controller('services')
export class ServicesController {
  @Post()
  @UseGuards(JwtAuthGuard)
  async createService(@Body() dto: CreateServiceDto, @Request() req: any) {
    // Llamar al caso de uso
  }
}
```

---

## 🔐 Sistema de Autenticación

### Auth0 Integration

El proyecto utiliza **Auth0** como proveedor de autenticación:

1. **Auth0Strategy** (`common/auth/auth0.strategy.ts`):
   - Valida tokens JWT de Auth0
   - Extrae información del usuario del payload
   - Configurado con JWKS (JSON Web Key Set)

2. **JwtAuthGuard** (`common/auth/jwt-auth.guard.ts`):
   - Protege endpoints que requieren autenticación
   - Valida el token y extrae el usuario

3. **UserUpsertInterceptor** (`common/auth/user-upsert.interceptor.ts`):
   - Crea/actualiza usuarios en la BD cuando se autentican con Auth0
   - Sincroniza datos de Auth0 con Prisma

### Flujo de Autenticación

```
1. Usuario se autentica en Auth0 (frontend)
2. Auth0 devuelve JWT token
3. Frontend envía token en header: Authorization: Bearer <token>
4. Auth0Strategy valida token con JWKS
5. UserUpsertInterceptor crea/actualiza usuario en BD
6. Request continúa con req.user disponible
```

### Variables de Entorno Requeridas

```env
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret
AUTH0_AUDIENCE=https://api.compartetutiempo.com
```

---

## 💾 Base de Datos

### Prisma Schema

El esquema define los siguientes modelos principales:

- **User**: Usuarios (ID es Auth0 sub)
- **Service**: Servicios ofrecidos/solicitados
- **Exchange**: Intercambios entre usuarios
- **Message**: Mensajes dentro de intercambios
- **Rating**: Valoraciones de servicios
- **Group**: Grupos de usuarios
- **Event**: Eventos de grupos
- **Community**: Comunidades
- **Membership**: Membresías de grupos

### Características Importantes

1. **User.id** es `String` (Auth0 sub), no `Int`
2. **Time Credits**: Los usuarios tienen créditos de tiempo (minutos)
3. **Relaciones**: Todas las relaciones están bien definidas con `onDelete: Cascade`
4. **Enums**: Estados y tipos están definidos como enums de Prisma

### Migraciones

```bash
cd apps/api
pnpm db:migrate    # Crear nueva migración
pnpm db:push       # Sincronizar schema sin migración
pnpm db:generate   # Regenerar cliente Prisma
pnpm db:seed       # Poblar BD con datos de prueba
```

---

## 📡 API REST

### Estructura de Endpoints

Todos los endpoints tienen el prefijo `/api`:

- `POST /api/auth/signup` - Registro (local)
- `POST /api/auth/signin` - Login (local)
- `GET /api/auth/me` - Obtener usuario actual
- `GET /api/services` - Listar servicios (con filtros)
- `POST /api/services` - Crear servicio (requiere auth)
- `GET /api/services/:id` - Obtener servicio
- `PUT /api/services/:id` - Actualizar servicio
- `DELETE /api/services/:id` - Eliminar servicio
- `POST /api/exchanges` - Crear intercambio
- `GET /api/exchanges` - Listar intercambios del usuario
- `POST /api/messages` - Enviar mensaje
- `GET /api/messages` - Listar mensajes
- `POST /api/ratings` - Crear valoración
- `GET /api/ratings` - Listar valoraciones
- `POST /api/upload/image` - Subir imagen (Cloudinary)

### Swagger Documentation

Disponible en: `http://localhost:3001/docs`

---

## 🖼️ Sistema de Subida de Imágenes

### Cloudinary Integration

El módulo `upload` utiliza **Cloudinary** para almacenar imágenes:

1. **CloudinaryService** (`common/cloudinary/cloudinary.service.ts`):
   - Configuración de Cloudinary
   - Método `uploadImage()`: Sube archivo y devuelve URL
   - Método `deleteImage()`: Elimina imagen por public_id
   - Transformaciones automáticas (redimensionado, optimización)

2. **UploadController** (`modules/upload/upload.controller.ts`):
   - Endpoint `POST /api/upload/image`
   - Valida tipo de archivo (solo imágenes)
   - Límite de 5MB
   - Requiere autenticación

### Variables de Entorno

```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Flujo de Subida

```
1. Frontend envía FormData con imagen
2. UploadController valida archivo
3. CloudinaryService sube a Cloudinary
4. Cloudinary devuelve URL segura
5. URL se guarda en BD (ej: Service.imageUrl)
```

---

## 💬 Sistema de Mensajería

### Arquitectura

Los mensajes están vinculados a **Exchanges** (intercambios):

1. **Modelo Message**:
   - `exchangeId`: ID del intercambio
   - `senderId`: Usuario que envía
   - `content`: Contenido del mensaje
   - `isRead`: Estado de lectura

2. **Endpoints**:
   - `POST /api/messages` - Enviar mensaje
   - `GET /api/messages?exchangeId=X` - Listar mensajes de un intercambio
   - `GET /api/messages/conversation/:userId` - Obtener conversación (pendiente)

3. **Validaciones**:
   - Solo usuarios del intercambio pueden ver/enviar mensajes
   - Verificado en `ListMessagesUseCase`

### Frontend Chat Component

El componente `Chat.tsx` (`web/src/components/chat/Chat.tsx`):
- Muestra mensajes de un intercambio
- Auto-scroll al final
- Envío con Enter
- Manejo de errores
- **Nota**: Actualmente usa `localStorage.getItem('access_token')` - necesita usar Auth0 hook

---

## ⭐ Sistema de Valoraciones

### Reglas de Negocio

1. **Solo usuarios que completaron un intercambio** pueden valorar
2. **Un usuario solo puede valorar un servicio una vez**
3. **Puntuación**: 1-5 estrellas
4. **Comentario opcional**: Máximo 500 caracteres

### Endpoints

- `POST /api/ratings` - Crear valoración
- `GET /api/ratings?serviceId=X` - Listar valoraciones de un servicio
- `PUT /api/ratings/:id` - Actualizar valoración
- `DELETE /api/ratings/:id` - Eliminar valoración (pendiente)

### Validaciones en CreateRatingUseCase

```typescript
// Verifica que el usuario completó un intercambio
const completedExchange = await prisma.exchange.findFirst({
  where: {
    serviceId: data.serviceId,
    OR: [{ requestedById: userId }, { offeredById: userId }],
    state: 'COMPLETED'
  }
});
```

---

## 🔄 Sistema de Intercambios

### Estados (ExchangeStatus)

- `PENDING`: Solicitud creada, esperando confirmación
- `CONFIRMED`: Intercambio confirmado por ambas partes
- `IN_PROGRESS`: Intercambio en curso
- `COMPLETED`: Intercambio completado
- `CANCELLED`: Intercambio cancelado
- `DISPUTED`: Intercambio en disputa

### Flujo Típico

```
1. Usuario A solicita servicio de Usuario B → PENDING
2. Usuario B acepta → CONFIRMED
3. Intercambio comienza → IN_PROGRESS
4. Intercambio finaliza → COMPLETED
5. Se actualizan créditos de tiempo
6. Ambos usuarios pueden valorar
```

### Créditos de Tiempo

- Los usuarios tienen `timeCredits` (minutos disponibles)
- Al completar un intercambio, se transfieren créditos
- **Nota**: La lógica de transferencia debe estar implementada en `UpdateExchangeUseCase`

---

## 🎨 Frontend (Next.js 15)

### Estructura

- **App Router**: Next.js 15 (aunque aún no hay carpeta `app/`)
- **Componentes**: Organizados por funcionalidad
- **Features**: Features por dominio (ej: `service/`)
- **Hooks**: Custom hooks para lógica reutilizable
- **Contexts**: React Contexts para estado global

### Tecnologías

- **Next.js 15**: Framework React
- **Material-UI (MUI)**: Componentes UI (Header, Chat)
- **Tailwind CSS**: Estilos utility-first
- **Auth0 Next.js SDK**: Autenticación en frontend
- **React Query (TanStack Query)**: Gestión de estado del servidor
- **React Hook Form**: Formularios
- **Zod**: Validación (compartido con backend)

### Cliente API

El cliente API (`shared/api/client.ts`):
- Configuración base de fetch
- Manejo de errores
- Headers de autenticación
- **Nota**: Debe integrarse con Auth0 para obtener tokens

---

## 🔧 Configuración y Variables de Entorno

### Backend (.env en apps/api/)

```env
# Database
DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/comparte_tiempo"

# Server
PORT=3001
NODE_ENV=development

# Auth0
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret
AUTH0_AUDIENCE=https://api.compartetutiempo.com

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# CORS
CORS_ORIGIN=http://localhost:3000

# Swagger
SWAGGER_TITLE=ComparteTuTiempo API
SWAGGER_DESCRIPTION=API para la plataforma de banco de tiempo
SWAGGER_VERSION=1.0
```

### Frontend (.env.local en apps/web/)

```env
AUTH0_SECRET=your-secret
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=https://your-tenant.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret

NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

---

## 🚀 Scripts Principales

### Monorepo

```bash
pnpm install          # Instalar todas las dependencias
pnpm dev              # Ejecutar todas las apps en desarrollo
pnpm build            # Construir todas las apps
pnpm lint             # Linting en todo el monorepo
pnpm typecheck        # Verificar tipos TypeScript
pnpm db:up            # Levantar PostgreSQL
pnpm db:down          # Detener PostgreSQL
```

### Backend (apps/api/)

```bash
pnpm dev              # Desarrollo con watch mode
pnpm build            # Construcción
pnpm db:generate       # Generar cliente Prisma
pnpm db:migrate        # Ejecutar migraciones
pnpm db:seed          # Poblar BD con datos de prueba
pnpm test             # Tests unitarios
pnpm test:e2e         # Tests E2E
```

### Frontend (apps/web/)

```bash
pnpm dev              # Desarrollo (puerto 3000)
pnpm build            # Construcción para producción
pnpm start            # Producción
```

---

## 📦 Dependencias Principales

### Backend

- **NestJS 11**: Framework Node.js
- **Prisma 5**: ORM
- **PostgreSQL**: Base de datos
- **Auth0**: Autenticación
- **Cloudinary**: Almacenamiento de imágenes
- **Zod**: Validación de esquemas
- **Swagger**: Documentación API

### Frontend

- **Next.js 15**: Framework React
- **React 19**: Biblioteca UI
- **Material-UI**: Componentes UI
- **Tailwind CSS**: Estilos
- **Auth0 Next.js SDK**: Autenticación
- **TanStack Query**: Estado del servidor
- **React Hook Form**: Formularios

---

## 🧪 Testing

### Estructura de Tests

Los tests están organizados junto al código:

```
modules/
└── services/
    └── application/
        └── create-service.use-case.spec.ts
```

### Tipos de Tests

1. **Unitarios**: Casos de uso, entidades, mappers
2. **E2E**: Endpoints completos
3. **Integration**: Repositorios con BD de prueba

### Ejecutar Tests

```bash
cd apps/api
pnpm test              # Todos los tests
pnpm test:watch        # Watch mode
pnpm test:cov          # Con cobertura
pnpm test:e2e          # Tests E2E
```

---

## 🔍 Puntos Importantes

### 1. Inversión de Dependencias

- El dominio **nunca** depende de infraestructura
- Los casos de uso dependen de **puertos (interfaces)**, no de implementaciones
- La infraestructura implementa los puertos

### 2. Validación

- **Backend**: Zod schemas en `packages/contracts`
- **DTOs**: Generados con `@anatine/zod-nestjs` o manuales con `class-validator`
- **Frontend**: Zod para validación de formularios

### 3. Manejo de Errores

- Excepciones de dominio en casos de uso
- Filtros globales de excepciones (pendiente de implementar)
- Respuestas estandarizadas

### 4. Seguridad

- Todos los endpoints sensibles protegidos con `@UseGuards(JwtAuthGuard)`
- Validación de permisos en casos de uso
- Sanitización de inputs

### 5. Performance

- Paginación en todos los listados
- Índices en BD para queries frecuentes
- Optimización de queries Prisma

---

## 📚 Recursos y Referencias

- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Auth0 Documentation](https://auth0.com/docs)
- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Arquitectura Hexagonal](https://alistair.cockburn.us/hexagonal-architecture/)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

---

## 🎯 Principios de Diseño

1. **Separación de Responsabilidades**: Cada capa tiene una responsabilidad clara
2. **Dependencias Invertidas**: El dominio no depende de detalles de implementación
3. **Testabilidad**: Fácil de testear gracias a la inyección de dependencias
4. **Mantenibilidad**: Código organizado y fácil de entender
5. **Escalabilidad**: Estructura que permite crecer sin problemas

---

*Última actualización: Diciembre 2024*
