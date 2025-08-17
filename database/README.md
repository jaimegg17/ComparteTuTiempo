# Base de Datos PostgreSQL - ComparteTuTiempo

## 🗄️ Configuración

Esta base de datos está configurada para funcionar con PostgreSQL 15 y está diseñada para la plataforma de banco de tiempo "ComparteTuTiempo".

## 🚀 Inicio Rápido

### 1. Iniciar PostgreSQL con Docker
```bash
# Iniciar solo la base de datos
docker-compose up postgres -d

# Ver logs
docker-compose logs postgres

# Detener
docker-compose down postgres
```

### 2. Conectar desde el backend
```bash
cd backend

# Probar conexión
pnpm test:db

# Ejecutar en desarrollo
pnpm dev
```

## 📊 Estructura de la Base de Datos

### Tablas Principales

#### 👥 **usuarios**
- Información básica de usuarios del sistema
- Campos: nombre, correo, teléfono, contraseña, ubicación, rol
- Roles: admin, user, moderator

#### 🔧 **servicios**
- Servicios ofrecidos por los usuarios
- Campos: título, descripción, duración (en horas), ubicación
- Relacionado con usuarios que los proporcionan

#### 💬 **mensajes**
- Sistema de comunicación entre usuarios
- Estados: enviado, leido, entregado
- Tipos: texto, archivo, sistema

#### 💱 **intercambios**
- Transacciones de servicios entre usuarios
- Estados: pendiente, confirmado, en_progreso, completado, cancelado, disputado
- Tiempo intercambiado en horas

#### 👥 **grupos**
- Comunidades de usuarios
- Tipos: público, privado, trabajo, hobby
- Configuración de privacidad

#### 🔗 **membresias**
- Relación muchos-a-muchos entre usuarios y grupos
- Roles: member, moderator, admin
- Estados: activa, pendiente, suspendida

#### 📅 **eventos**
- Eventos organizados por grupos
- Campos: título, descripción, fecha, ubicación, capacidad

## 🔧 Configuración de Entorno

### Variables de Entorno
```bash
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=comparte_tiempo
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres123
```

### Conexión
```bash
# URL de conexión
postgresql://postgres:postgres123@localhost:5432/comparte_tiempo
```

## 📝 Scripts de Inicialización

### `01-init.sql`
- Crea todas las tablas según el esquema ER del usuario
- Establece relaciones y constraints en 3FN
- Inserta datos iniciales (usuarios de prueba)
- Configura triggers para actualizaciones automáticas

### Características
- ✅ **SERIAL IDs** como claves primarias (más eficiente que UUIDs)
- ✅ **Relaciones** entre entidades configuradas
- ✅ **Triggers** para actualizaciones automáticas
- ✅ **Índices** para rendimiento optimizado
- ✅ **Constraints** de validación de datos
- ✅ **Esquema en 3FN** según diagrama ER

## 🐳 Docker

### Imagen
- **PostgreSQL 15 Alpine** (ligera y rápida)
- **Puerto**: 5432
- **Volumen persistente**: `postgres_data`
- **Health check** configurado

### Comandos Útiles
```bash
# Acceder a la base de datos
docker exec -it comparte-tiempo-postgres psql -U postgres -d comparte_tiempo

# Ver logs
docker logs comparte-tiempo-postgres

# Backup
docker exec comparte-tiempo-postgres pg_dump -U postgres comparte_tiempo > backup.sql

# Restore
docker exec -i comparte-tiempo-postgres psql -U postgres -d comparte_tiempo < backup.sql
```

## 🔍 Monitoreo y Debugging

### Verificar Estado
```bash
# Estado del contenedor
docker ps | grep postgres

# Logs en tiempo real
docker logs -f comparte-tiempo-postgres

# Estadísticas del contenedor
docker stats comparte-tiempo-postgres
```

### Conectar con Cliente
```bash
# Con psql (si está instalado)
psql -h localhost -U postgres -d comparte_tiempo

# Con pgAdmin o DBeaver
# Host: localhost
# Puerto: 5432
# Usuario: postgres
# Contraseña: postgres123
# Base de datos: comparte_tiempo
```

## 🚨 Solución de Problemas

### Error: "Cannot connect to the Docker daemon"
```bash
# Iniciar Docker Desktop
open -a Docker

# O desde terminal
sudo systemctl start docker
```

### Error: "Port already in use"
```bash
# Verificar qué está usando el puerto 5432
lsof -i :5432

# Detener servicios conflictivos
sudo pkill -f postgres
```

### Error: "Database does not exist"
```bash
# La base de datos se crea automáticamente
# Verificar logs del contenedor
docker logs comparte-tiempo-postgres
```

## 📚 Próximos Pasos

- [x] Implementar esquema en 3FN según diagrama ER
- [x] Configurar entidades TypeORM con nombres en español
- [x] Implementar validación con Zod
- [ ] Configurar migraciones con TypeORM
- [ ] Configurar backup automático
- [ ] Implementar replicación para producción
- [ ] Configurar monitoreo y alertas
- [ ] Implementar auditoría de cambios
