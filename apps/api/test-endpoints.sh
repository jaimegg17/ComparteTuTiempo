#!/bin/bash

# Script para probar endpoints del backend
# Asegúrate de que el backend esté corriendo en http://localhost:3001

BASE_URL="http://localhost:3001/api"
echo "🚀 Probando endpoints del backend en $BASE_URL"
echo "=================================================="

# Función para hacer requests con colores
make_request() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    
    echo ""
    echo "📡 $description"
    echo "   $method $endpoint"
    
    if [ -n "$data" ]; then
        echo "   Data: $data"
        response=$(curl -s -w "\n%{http_code}" -X $method \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$BASE_URL$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint")
    fi
    
    # Separar respuesta y código HTTP
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n -1)
    
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo "   ✅ Status: $http_code"
        echo "   📄 Response: $body" | jq . 2>/dev/null || echo "   📄 Response: $body"
    else
        echo "   ❌ Status: $http_code"
        echo "   📄 Error: $body"
    fi
}

# 1. Probar servicios (endpoints públicos)
echo ""
echo "🔧 PROBANDO SERVICIOS"
echo "===================="

make_request "GET" "/services" "" "Listar todos los servicios"
make_request "GET" "/services?page=1&pageSize=5" "" "Listar servicios con paginación"
make_request "GET" "/services?category=EDUCACION" "" "Filtrar servicios por categoría"

# 2. Probar autenticación (necesitarás un token JWT válido)
echo ""
echo "🔐 PROBANDO AUTENTICACIÓN"
echo "========================"

# Nota: Para probar endpoints protegidos, necesitarías un token JWT válido
# Puedes obtenerlo haciendo login a través del frontend o usando Auth0 directamente

echo "   ℹ️  Para probar endpoints protegidos, necesitas un token JWT válido"
echo "   ℹ️  Puedes obtenerlo haciendo login en el frontend"

# 3. Probar creación de servicio (requiere autenticación)
echo ""
echo "📝 CREACIÓN DE SERVICIO (requiere token)"
echo "========================================"

SERVICE_DATA='{
  "title": "Servicio de Prueba",
  "description": "Este es un servicio creado para probar el endpoint de creación",
  "duration": 2,
  "location": "Madrid",
  "category": "TECNOLOGIA",
  "type": "PRESENCIAL",
  "price": 20.0
}'

echo "   ℹ️  Para crear un servicio, ejecuta:"
echo "   curl -X POST $BASE_URL/services \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -H 'Authorization: Bearer YOUR_JWT_TOKEN' \\"
echo "     -d '$SERVICE_DATA'"

# 4. Probar intercambios (requiere autenticación)
echo ""
echo "🔄 INTERCAMBIOS (requiere token)"
echo "==============================="

EXCHANGE_DATA='{
  "requestedById": "user1_id",
  "offeredById": "user2_id", 
  "serviceId": 1,
  "date": "2024-01-15T10:00:00Z",
  "exchangedTime": 2.0
}'

echo "   ℹ️  Para crear un intercambio, ejecuta:"
echo "   curl -X POST $BASE_URL/exchanges \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -H 'Authorization: Bearer YOUR_JWT_TOKEN' \\"
echo "     -d '$EXCHANGE_DATA'"

echo ""
echo "🎯 RESUMEN DE ENDPOINTS DISPONIBLES"
echo "=================================="
echo "✅ GET    /services              - Listar servicios"
echo "✅ GET    /services?category=...  - Filtrar servicios"
echo "🔒 POST   /services              - Crear servicio (requiere auth)"
echo "🔒 GET    /exchanges             - Listar intercambios (requiere auth)"
echo "🔒 POST   /exchanges             - Crear intercambio (requiere auth)"
echo "🔒 GET    /exchanges/:id          - Obtener intercambio (requiere auth)"
echo "🔒 PUT    /exchanges/:id          - Actualizar intercambio (requiere auth)"
echo "🔒 GET    /auth/me               - Obtener perfil usuario (requiere auth)"

echo ""
echo "📚 Para obtener un token JWT:"
echo "   1. Ve a http://localhost:3000"
echo "   2. Haz login con Auth0"
echo "   3. Abre DevTools > Network > Headers"
echo "   4. Copia el token de Authorization header"
echo ""
echo "✨ ¡Pruebas completadas!"
