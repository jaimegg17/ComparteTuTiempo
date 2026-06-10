# Configuración de Base de Datos - DBeaver

## Información de Conexión

### PostgreSQL - ComparteTuTiempo

**Host:** `localhost`  
**Puerto:** `5432`  
**Base de datos:** `comparte_tiempo`  
**Usuario:** `postgres`  
**Contraseña:** `postgres123`  
**Schema:** `public` (por defecto)

---

## Configuración en DBeaver

### Paso 1: Crear Nueva Conexión

1. Abre DBeaver
2. Click en el botón **"Nueva Conexión"** (icono de enchufe) o `Cmd+Shift+N` (Mac) / `Ctrl+Shift+N` (Windows/Linux)
3. Selecciona **PostgreSQL** de la lista
4. Click en **"Siguiente"**

### Paso 2: Configurar Parámetros de Conexión

En la ventana de configuración, completa los siguientes campos:

**Pestaña "Principal":**
- **Host:** `localhost`
- **Puerto:** `5432`
- **Base de datos:** `comparte_tiempo`
- **Usuario:** `postgres`
- **Contraseña:** `postgres123`
- ✅ Marca la casilla **"Guardar contraseña"** (opcional pero recomendado)

**Pestaña "PostgreSQL":**
- **Show all databases:** Desmarcado (opcional)
- **Show system schemas:** Desmarcado (opcional, para ver solo tus tablas)

### Paso 3: Probar Conexión

1. Click en el botón **"Probar conexión"** (Test Connection)
2. Si es la primera vez, DBeaver te pedirá descargar el driver de PostgreSQL
   - Click en **"Descargar"** y espera a que se complete
3. Deberías ver un mensaje: **"Conectado"** ✅

### Paso 4: Finalizar

1. Click en **"Finalizar"**
2. La conexión aparecerá en el panel izquierdo bajo "Database Navigator"

---

## Verificar Conexión

Una vez conectado, deberías poder ver:

### Tablas principales:
- `users` - Usuarios del sistema
- `services` - Servicios ofrecidos/solicitados
- `exchanges` - Intercambios entre usuarios
- `messages` - Mensajes del chat
- `ratings` - Valoraciones de servicios
- `communities` - Comunidades
- `groups` - Grupos
- `events` - Eventos
- `memberships` - Membresías

### Consultas útiles para verificar:

```sql
-- Ver todos los usuarios
SELECT id, email, name, timeCredits FROM users;

-- Ver servicios activos
SELECT id, title, category, status FROM services WHERE status = 'ACTIVO';

-- Ver intercambios
SELECT id, state, exchangedTime FROM exchanges;

-- Ver mensajes
SELECT id, content, "isRead", "createdAt" FROM messages;
```

---

## Solución de Problemas

### Error: "Connection refused"
- **Causa:** Docker no está corriendo o PostgreSQL no está iniciado
- **Solución:** 
  ```bash
  docker compose up -d postgres
  ```

### Error: "Password authentication failed"
- **Causa:** Contraseña incorrecta
- **Solución:** Verifica que la contraseña sea `postgres123`

### Error: "Database does not exist"
- **Causa:** La base de datos no ha sido creada
- **Solución:** 
  ```bash
  cd apps/api
  pnpm db:push
  ```

### Error: "Driver not found"
- **Causa:** DBeaver no tiene el driver de PostgreSQL
- **Solución:** DBeaver lo descargará automáticamente al hacer "Test Connection"

---

## Comandos Útiles

### Iniciar base de datos:
```bash
docker compose up -d postgres
```

### Detener base de datos:
```bash
docker compose down postgres
```

### Ver logs de la base de datos:
```bash
docker compose logs postgres
```

### Reiniciar base de datos (elimina todos los datos):
```bash
docker compose down postgres
docker volume rm comparte-tiempo_postgres_data
docker compose up -d postgres
cd apps/api && pnpm db:push
```

---

## Notas Importantes

- La base de datos se ejecuta en un contenedor Docker
- Los datos persisten en el volumen `comparte-tiempo_postgres_data`
- Si eliminas el volumen, perderás todos los datos
- El puerto 5432 debe estar libre en tu máquina local
