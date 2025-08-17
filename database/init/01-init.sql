-- Script de inicialización de la base de datos ComparteTuTiempo
-- Creado: $(date)
-- Esquema en 3FN según diagrama ER del usuario
-- Adaptado a nombres de campos en inglés para TypeORM

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phoneNumber VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    location VARCHAR(200),
    rol VARCHAR(20) DEFAULT 'user' CHECK (rol IN ('admin', 'user', 'moderator')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de servicios
CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    duration INTEGER NOT NULL, -- en horas
    location VARCHAR(200),
    userId INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de mensajes
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    senderId INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipientId INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    sentAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'sent' CHECK (status IN ('sent', 'read', 'delivered')),
    type VARCHAR(20) DEFAULT 'text' CHECK (type IN ('text', 'file', 'system')),
    fileUrl VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de intercambios
CREATE TABLE IF NOT EXISTS exchanges (
    id SERIAL PRIMARY KEY,
    requestedById INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    offeredById INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    serviceId INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    state VARCHAR(20) DEFAULT 'pending' CHECK (state IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'disputed')),
    exchangedTime DECIMAL(5,2) NOT NULL, -- en horas
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de grupos
CREATE TABLE IF NOT EXISTS groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    type VARCHAR(20) DEFAULT 'publico' CHECK (type IN ('publico', 'privado', 'trabajo', 'hobby')),
    isPrivate BOOLEAN DEFAULT FALSE,
    creatorId INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de membresías
CREATE TABLE IF NOT EXISTS memberships (
    id SERIAL PRIMARY KEY,
    groupId INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    userId INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'admin')),
    status VARCHAR(20) DEFAULT 'activa' CHECK (status IN ('activa', 'pendiente', 'suspendida')),
    joinedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(groupId, userId)
);

-- Tabla de eventos
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    groupId INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    location VARCHAR(200),
    capacity INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_rol ON users(rol);
CREATE INDEX IF NOT EXISTS idx_services_userId ON services(userId);
CREATE INDEX IF NOT EXISTS idx_services_location ON services(location);
CREATE INDEX IF NOT EXISTS idx_messages_senderId ON messages(senderId);
CREATE INDEX IF NOT EXISTS idx_messages_recipientId ON messages(recipientId);
CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);
CREATE INDEX IF NOT EXISTS idx_exchanges_requestedById ON exchanges(requestedById);
CREATE INDEX IF NOT EXISTS idx_exchanges_offeredById ON exchanges(offeredById);
CREATE INDEX IF NOT EXISTS idx_exchanges_serviceId ON exchanges(serviceId);
CREATE INDEX IF NOT EXISTS idx_exchanges_state ON exchanges(state);
CREATE INDEX IF NOT EXISTS idx_groups_creatorId ON groups(creatorId);
CREATE INDEX IF NOT EXISTS idx_groups_type ON groups(type);
CREATE INDEX IF NOT EXISTS idx_memberships_groupId ON memberships(groupId);
CREATE INDEX IF NOT EXISTS idx_memberships_userId ON memberships(userId);
CREATE INDEX IF NOT EXISTS idx_events_groupId ON events(groupId);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);

-- Datos iniciales para usuarios de prueba
INSERT INTO users (name, email, password, rol) VALUES
('Admin Sistema', 'admin@compartetutiempo.com', '$2b$10$hashed_password_here', 'admin'),
('Usuario Demo', 'demo@compartetutiempo.com', '$2b$10$hashed_password_here', 'user')
ON CONFLICT DO NOTHING;

-- Función para actualizar el timestamp de updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at automáticamente
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exchanges_updated_at BEFORE UPDATE ON exchanges
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_groups_updated_at BEFORE UPDATE ON groups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
