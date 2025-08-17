#!/bin/bash

# Script de inicio rápido para ComparteTuTiempo
echo "🚀 Iniciando ComparteTuTiempo..."

# Verificar que Docker esté ejecutándose
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker no está ejecutándose. Por favor, inicia Docker Desktop primero."
    echo "💡 En macOS: open -a Docker"
    exit 1
fi

echo "✅ Docker está ejecutándose"

# Iniciar la base de datos
echo "🗄️ Iniciando PostgreSQL..."
docker-compose up postgres -d

# Esperar a que la base de datos esté lista
echo "⏳ Esperando a que la base de datos esté lista..."
sleep 10

# Verificar que la base de datos esté funcionando
if docker-compose ps postgres | grep -q "Up"; then
    echo "✅ PostgreSQL está ejecutándose"
else
    echo "❌ Error al iniciar PostgreSQL"
    exit 1
fi

# Probar conexión a la base de datos
echo "🔌 Probando conexión a la base de datos..."
cd backend
if pnpm test:db > /dev/null 2>&1; then
    echo "✅ Conexión a la base de datos exitosa"
else
    echo "⚠️ No se pudo probar la conexión (puede ser normal en el primer inicio)"
fi

# Volver al directorio raíz
cd ..

echo ""
echo "🎉 ¡Proyecto iniciado correctamente!"
echo ""
echo "📋 Comandos útiles:"
echo "  🗄️ Solo base de datos: docker-compose up postgres -d"
echo "  🔧 Solo backend: pnpm dev:backend"
echo "  🎨 Solo frontend: pnpm dev:frontend"
echo "  🚀 Ambos servicios: pnpm dev"
echo "  🐳 Todo con Docker: docker-compose up --build"
echo ""
echo "🌐 URLs:"
echo "  Frontend: http://localhost:3000"
echo "  Backend: http://localhost:3001"
echo "  Base de datos: localhost:5432"
echo ""
echo "📚 Documentación: README.md"
