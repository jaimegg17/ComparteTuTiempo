# 📚 Documentación de la API - ComparteTuTiempo

## 🏗️ Arquitectura

La API sigue **Arquitectura Hexagonal** con las siguientes capas:

- **Domain Layer**: Entidades de negocio y puertos (interfaces)
- **Application Layer**: Casos de uso y lógica de negocio
- **Infrastructure Layer**: Implementaciones concretas (Prisma, repositorios)
- **Presentation Layer**: Controladores REST y DTOs

## 🔐 Autenticación

La API utiliza **Auth0** para autenticación:

- **Frontend**: Auth0 SDK para Next.js
- **Backend**: JWT validation con JWKS
- **Headers requeridos**: `Authorization: Bearer <JWT_TOKEN>`

## 📋 Endpoints Disponibles

### 🔧 Servicios

#### `GET /api/services`
Lista todos los servicios con filtros y paginación.

**Query Parameters:**
- `q` (string): Búsqueda por texto
- `category` (enum): EDUCACION, HOGAR, TECNOLOGIA, SALUD, DEPORTES, ARTE, OTROS
- `city` (string): Filtrar por ciudad
- `type` (enum): PRESENCIAL, VIRTUAL, HIBRIDO
- `status` (enum): ACTIVO, INACTIVO, COMPLETADO
- `page` (number): Página (default: 1)
- `pageSize` (number): Elementos por página (default: 20, max: 100)

**Response:**
```json
{
  "message": "Servicios obtenidos exitosamente",
  "services": [...],
  "total": 10,
  "page": 1,
  "pageSize": 20,
  "totalPages": 1
}
```

#### `POST /api/services` 🔒
Crea un nuevo servicio.

**Headers:** `Authorization: Bearer <JWT_TOKEN>`

**Body:**
```json
{
  "title": "Clases de Guitarra",
  "description": "Aprende a tocar guitarra desde cero",
  "duration": 2,
  "location": "Madrid Centro",
  "category": "EDUCACION",
  "type": "PRESENCIAL",
  "price": 15.0
}
```

### 🔄 Intercambios

#### `GET /api/exchanges` 🔒
Lista intercambios del usuario autenticado.

**Headers:** `Authorization: Bearer <JWT_TOKEN>`

**Query Parameters:**
- `requestedById` (string): Filtrar por usuario solicitante
- `offeredById` (string): Filtrar por usuario oferente
- `serviceId` (number): Filtrar por servicio
- `state` (enum): PENDING, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED, DISPUTED
- `page` (number): Página (default: 1)
- `pageSize` (number): Elementos por página (default: 20)

#### `POST /api/exchanges` 🔒
Crea un nuevo intercambio.

**Headers:** `Authorization: Bearer <JWT_TOKEN>`

**Body:**
```json
{
  "requestedById": "auth0|user_id",
  "offeredById": "auth0|other_user_id",
  "serviceId": 1,
  "date": "2024-01-15T10:00:00Z",
  "exchangedTime": 2.0
}
```

#### `GET /api/exchanges/:id` 🔒
Obtiene un intercambio específico.

**Headers:** `Authorization: Bearer <JWT_TOKEN>`

#### `PUT /api/exchanges/:id` 🔒
Actualiza un intercambio.

**Headers:** `Authorization: Bearer <JWT_TOKEN>`

**Body:**
```json
{
  "date": "2024-01-16T10:00:00Z",
  "state": "CONFIRMED",
  "exchangedTime": 2.5
}
```

### 👤 Autenticación

#### `GET /api/auth/me` 🔒
Obtiene el perfil del usuario autenticado.

**Headers:** `Authorization: Bearer <JWT_TOKEN>`

**Response:**
```json
{
  "id": "auth0|user_id",
  "email": "user@example.com",
  "name": "Usuario Test",
  "phoneNumber": "123456789",
  "location": "Madrid, España",
  "bio": "Usuario de prueba",
  "skills": ["programacion", "diseno"],
  "role": "USER",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

## 🗄️ Modelo de Datos

### Usuario (User)
- `id`: String (Auth0 ID)
- `email`: String (único)
- `name`: String
- `phoneNumber`: String (opcional)
- `location`: String (opcional)
- `bio`: String (opcional)
- `skills`: String[] (array de habilidades)
- `imageUrl`: String (opcional)
- `role`: USER | MODERATOR | ADMIN

### Servicio (Service)
- `id`: Number (auto-increment)
- `title`: String
- `description`: String
- `duration`: Number (horas)
- `location`: String (opcional)
- `category`: EDUCACION | HOGAR | TECNOLOGIA | SALUD | DEPORTES | ARTE | OTROS
- `type`: PRESENCIAL | VIRTUAL | HIBRIDO
- `status`: ACTIVO | INACTIVO | COMPLETADO
- `price`: Number (precio por hora)
- `userId`: String (Auth0 ID del propietario)

### Intercambio (Exchange)
- `id`: Number (auto-increment)
- `requestedById`: String (Auth0 ID del solicitante)
- `offeredById`: String (Auth0 ID del oferente)
- `serviceId`: Number (ID del servicio)
- `date`: DateTime (fecha del intercambio)
- `state`: PENDING | CONFIRMED | IN_PROGRESS | COMPLETED | CANCELLED | DISPUTED
- `exchangedTime`: Decimal (horas intercambiadas)
- `createdAt`: DateTime
- `updatedAt`: DateTime

## 🚀 Estados de Intercambio

### Flujo de Estados:
```
PENDING → CONFIRMED → IN_PROGRESS → COMPLETED
    ↓         ↓            ↓
CANCELLED  CANCELLED   DISPUTED → COMPLETED/CANCELLED
```

### Reglas de Transición:
- **PENDING → CONFIRMED**: Solo el oferente puede confirmar
- **CONFIRMED → IN_PROGRESS**: Solo el solicitante puede iniciar
- **IN_PROGRESS → COMPLETED**: Solo el oferente puede completar
- **Cualquier estado → CANCELLED**: Cualquiera de los participantes puede cancelar
- **IN_PROGRESS → DISPUTED**: Para resolver conflictos

## 🧪 Testing

### Script de Pruebas
```bash
# Ejecutar script de pruebas
./test-endpoints.sh
```

### Ejemplos con curl

#### Listar servicios:
```bash
curl -X GET "http://localhost:3001/api/services?page=1&pageSize=5"
```

#### Crear servicio (requiere token):
```bash
curl -X POST "http://localhost:3001/api/services" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Servicio de Prueba",
    "description": "Descripción del servicio",
    "duration": 2,
    "category": "TECNOLOGIA",
    "type": "PRESENCIAL",
    "price": 20.0
  }'
```

#### Crear intercambio (requiere token):
```bash
curl -X POST "http://localhost:3001/api/exchanges" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "requestedById": "auth0|user1",
    "offeredById": "auth0|user2",
    "serviceId": 1,
    "date": "2024-01-15T10:00:00Z",
    "exchangedTime": 2.0
  }'
```

## 🔧 Configuración

### Variables de Entorno (.env)
```env
# Auth0 Configuration
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret
AUTH0_AUDIENCE=https://api.compartetutiempo.com

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/compartetutiempo"

# Server
PORT=3001
NODE_ENV=development
```

## 📊 Seed de Datos

El seed incluye datos de prueba:
- 2 usuarios de prueba
- 4 servicios de diferentes categorías
- 3 intercambios en diferentes estados
- 2 valoraciones
- 3 mensajes de conversación
- 2 comunidades

Para ejecutar el seed:
```bash
cd apps/api
pnpm prisma db seed
```

## 🚨 Códigos de Error

- `400`: Bad Request - Datos inválidos
- `401`: Unauthorized - Token inválido o expirado
- `403`: Forbidden - Sin permisos para la operación
- `404`: Not Found - Recurso no encontrado
- `500`: Internal Server Error - Error del servidor

## 📈 Próximos Pasos

### Módulos Pendientes:
- [ ] **Messages**: Sistema de mensajería
- [ ] **Ratings**: Sistema de valoraciones
- [ ] **Communities**: Gestión de comunidades
- [ ] **Groups**: Gestión de grupos
- [ ] **Events**: Gestión de eventos

### Mejoras Futuras:
- [ ] WebSocket para mensajes en tiempo real
- [ ] Notificaciones push
- [ ] Sistema de reportes y moderación
- [ ] API de estadísticas y analytics
- [ ] Integración con servicios de pago
