#!/bin/bash

# Script de pruebas de API para ComparteTuTiempo
# Ejecutar: bash test-api.sh

API_URL="http://localhost:3001/api"
TOKEN="eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IlIxeWQ1Tm53c0txMGx6UWZGcnRNOSJ9.eyJpc3MiOiJodHRwczovL2Rldi1iMW5ndXp5ZXphdHMxanBxLnVzLmF1dGgwLmNvbS8iLCJzdWIiOiJhdXRoMHw2OGRhZmRkNjkwNTRlNjkzZDk3NTkwNjkiLCJhdWQiOlsiaHR0cHM6Ly9hcGkuY29tcGFydGV0dXRpZW1wby5jb20iLCJodHRwczovL2Rldi1iMW5ndXp5ZXphdHMxanBxLnVzLmF1dGgwLmNvbS91c2VyaW5mbyJdLCJpYXQiOjE3NTkyNjU4OTEsImV4cCI6MTc1OTM1MjI5MSwic2NvcGUiOiJvcGVuaWQgcHJvZmlsZSBlbWFpbCIsImF6cCI6Im5mTDhWaHFPQnVPTWI0ZUZyTUhZMGVOQXdXZk5Ed1FiIn0.EfSpaocwfxdITgE6MnZOJ-5-OzvL_lh_Y8GkEpU2O6r03wUGptdf56Cx1CGpIfTtHuZPI5qWVjfQ77kAbXLwl41GJwCAAbWmp2Fh9J8SdxZVzpiB3enlTEFqAVb3I-K4GJqlT4RWPlo2Ww5LP0TppBzs5nSKbetDZ6fek5UiYhN0LPLTotfzkhgw-QzQHhPJoakCSNEVv3QfjjKoauETAG5MCLtY1mY_5ISrMdLXHxTQCQo0GWJ9sK2xPVbj15bf-SFcLlzS-vQnvkdrrlY0lzee9sdfuMf8hp4uR9Lgh68VahLw6m1fJIc_NKYOBmmM95l8ZQHVrGW4dHSXH4kp-A"

echo "🧪 Testing ComparteTuTiempo API"
echo "================================"

# Helper functions
print_test() {
    echo ""
    echo "📝 $1"
    echo "---"
}

print_success() {
    echo "✅ $1"
}

print_error() {
    echo "❌ $1"
}

# Test 1: GET Services (sin autenticación)
print_test "TEST 1: GET /api/services"
RESPONSE=$(curl -s "$API_URL/services")
echo "$RESPONSE" | jq -r '.services | length' > /dev/null 2>&1
if [ $? -eq 0 ]; then
    COUNT=$(echo "$RESPONSE" | jq -r '.services | length')
    print_success "Servicios obtenidos: $COUNT"
else
    print_error "Error obteniendo servicios"
    echo "$RESPONSE"
fi

# Test 2: GET Communities (sin autenticación)
print_test "TEST 2: GET /api/communities"
RESPONSE=$(curl -s "$API_URL/communities")
echo "$RESPONSE" | jq -r '.communities | length' > /dev/null 2>&1
if [ $? -eq 0 ]; then
    COUNT=$(echo "$RESPONSE" | jq -r '.communities | length')
    print_success "Comunidades obtenidas: $COUNT"
else
    print_error "Error obteniendo comunidades"
    echo "$RESPONSE"
fi

# Test 3: GET Groups (sin autenticación)
print_test "TEST 3: GET /api/groups"
RESPONSE=$(curl -s "$API_URL/groups")
echo "$RESPONSE" | jq -r '.groups | length' > /dev/null 2>&1
if [ $? -eq 0 ]; then
    COUNT=$(echo "$RESPONSE" | jq -r '.groups | length')
    print_success "Grupos obtenidos: $COUNT"
else
    print_error "Error obteniendo grupos"
    echo "$RESPONSE"
fi

# Test 4: GET Events (sin autenticación)
print_test "TEST 4: GET /api/events"
RESPONSE=$(curl -s "$API_URL/events")
echo "$RESPONSE" | jq -r '.events | length' > /dev/null 2>&1
if [ $? -eq 0 ]; then
    COUNT=$(echo "$RESPONSE" | jq -r '.events | length')
    print_success "Eventos obtenidos: $COUNT"
else
    print_error "Error obteniendo eventos"
    echo "$RESPONSE"
fi

# Test 5: POST Service SIN token (debe fallar con 401)
print_test "TEST 5: POST /api/services SIN token (debe fallar)"
RESPONSE=$(curl -s -X POST "$API_URL/services" \
    -H "Content-Type: application/json" \
    -d '{
        "title": "Servicio Test",
        "description": "Descripción de prueba para el servicio",
        "duration": 60,
        "location": "Madrid",
        "category": "TECNOLOGIA",
        "type": "VIRTUAL",
        "price": 30
    }')
STATUS=$(echo "$RESPONSE" | jq -r '.statusCode')
if [ "$STATUS" = "401" ]; then
    print_success "Correctamente rechazado (401 Unauthorized)"
else
    print_error "Debería rechazar sin token"
    echo "$RESPONSE"
fi

# Test 6: POST Service CON token
print_test "TEST 6: POST /api/services CON token"
RESPONSE=$(curl -s -X POST "$API_URL/services" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "title": "Clases de Programación",
        "description": "Clases personalizadas de desarrollo web con JavaScript, React y Node.js",
        "duration": 60,
        "location": "Madrid",
        "category": "TECNOLOGIA",
        "type": "VIRTUAL",
        "price": 30
    }')
echo "$RESPONSE" | jq -r '.service.id' > /dev/null 2>&1
if [ $? -eq 0 ]; then
    SERVICE_ID=$(echo "$RESPONSE" | jq -r '.service.id')
    print_success "Servicio creado con ID: $SERVICE_ID"
else
    print_error "Error creando servicio"
    echo "$RESPONSE"
fi

# Test 7: POST Group CON token
print_test "TEST 7: POST /api/groups CON token"
RESPONSE=$(curl -s -X POST "$API_URL/groups" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "name": "Grupo de Desarrollo Web",
        "description": "Grupo para compartir conocimientos de desarrollo web",
        "type": "PUBLICO",
        "isPrivate": false
    }')
echo "$RESPONSE" | jq -r '.group.id' > /dev/null 2>&1
if [ $? -eq 0 ]; then
    GROUP_ID=$(echo "$RESPONSE" | jq -r '.group.id')
    print_success "Grupo creado con ID: $GROUP_ID"
else
    print_error "Error creando grupo"
    echo "$RESPONSE"
fi

# Test 8: POST Event CON token (necesita un grupo)
if [ ! -z "$GROUP_ID" ]; then
    print_test "TEST 8: POST /api/events CON token"
    RESPONSE=$(curl -s -X POST "$API_URL/events" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d "{
            \"title\": \"Meetup de Desarrollo Web\",
            \"description\": \"Encuentro para compartir experiencias en desarrollo\",
            \"date\": \"2025-12-01T18:00:00Z\",
            \"location\": \"Madrid\",
            \"groupId\": $GROUP_ID
        }")
    echo "$RESPONSE" | jq -r '.event.id' > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        EVENT_ID=$(echo "$RESPONSE" | jq -r '.event.id')
        print_success "Evento creado con ID: $EVENT_ID"
    else
        print_error "Error creando evento"
        echo "$RESPONSE"
    fi
fi

# Test 9: PUT Service (actualizar servicio creado)
if [ ! -z "$SERVICE_ID" ]; then
    print_test "TEST 9: PUT /api/services/$SERVICE_ID CON token"
    RESPONSE=$(curl -s -X PUT "$API_URL/services/$SERVICE_ID" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d "{
            \"title\": \"Clases de Programación Actualizadas\",
            \"price\": 35
        }")
    echo "$RESPONSE" | jq -r '.service.title' > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        TITLE=$(echo "$RESPONSE" | jq -r '.service.title')
        print_success "Servicio actualizado: $TITLE"
    else
        print_error "Error actualizando servicio"
        echo "$RESPONSE"
    fi
fi

# Test 10: DELETE Service (eliminar servicio creado)
if [ ! -z "$SERVICE_ID" ]; then
    print_test "TEST 10: DELETE /api/services/$SERVICE_ID CON token"
    RESPONSE=$(curl -s -X DELETE "$API_URL/services/$SERVICE_ID" \
        -H "Authorization: Bearer $TOKEN")
    STATUS=$(echo "$RESPONSE" | jq -r '.statusCode' 2>/dev/null || echo "204")
    if [ "$STATUS" = "204" ] || [ "$STATUS" = "null" ]; then
        print_success "Servicio eliminado correctamente"
    else
        print_error "Error eliminando servicio"
        echo "$RESPONSE"
    fi
fi

# Test 11: PUT Group (actualizar grupo creado)
if [ ! -z "$GROUP_ID" ]; then
    print_test "TEST 11: PUT /api/groups/$GROUP_ID CON token"
    RESPONSE=$(curl -s -X PUT "$API_URL/groups/$GROUP_ID" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d "{
            \"name\": \"Grupo de Desarrollo Web Actualizado\",
            \"description\": \"Descripción actualizada del grupo\"
        }")
    echo "$RESPONSE" | jq -r '.group.name' > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        NAME=$(echo "$RESPONSE" | jq -r '.group.name')
        print_success "Grupo actualizado: $NAME"
    else
        print_error "Error actualizando grupo"
        echo "$RESPONSE"
    fi
fi

# Test 12: DELETE Group (eliminar grupo creado)
if [ ! -z "$GROUP_ID" ]; then
    print_test "TEST 12: DELETE /api/groups/$GROUP_ID CON token"
    RESPONSE=$(curl -s -X DELETE "$API_URL/groups/$GROUP_ID" \
        -H "Authorization: Bearer $TOKEN")
    STATUS=$(echo "$RESPONSE" | jq -r '.statusCode' 2>/dev/null || echo "204")
    if [ "$STATUS" = "204" ] || [ "$STATUS" = "null" ]; then
        print_success "Grupo eliminado correctamente"
    else
        print_error "Error eliminando grupo"
        echo "$RESPONSE"
    fi
fi

echo ""
echo "================================"
echo "✅ Tests completados"
echo ""

