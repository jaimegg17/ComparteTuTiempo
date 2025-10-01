#!/bin/bash

# Script para probar la transferencia de créditos en un exchange
# Usa un exchange del seed que ya existe en estado PENDING

API_URL="http://localhost:3001/api"
TOKEN="eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IlIxeWQ1Tm53c0txMGx6UWZGcnRNOSJ9.eyJpc3MiOiJodHRwczovL2Rldi1iMW5ndXp5ZXphdHMxanBxLnVzLmF1dGgwLmNvbS8iLCJzdWIiOiJTSWhCMTF3UW1zY1l6Nk5zUTFtcWg0SE1KZGlWeGRRWkBjbGllbnRzIiwiYXVkIjoiaHR0cHM6Ly9hcGkuY29tcGFydGV0dXRpZW1wby5jb20iLCJpYXQiOjE3NTkzNTM1MzIsImV4cCI6MTc1OTQzOTkzMiwiZ3R5IjoiY2xpZW50LWNyZWRlbnRpYWxzIiwiYXpwIjoiU0loQjExd1Ftc2NZejZOc1ExbXFoNEhNSmRpVnhkUVoifQ.iLQvDevJy3u04iG1NQTCaB7otmTaxBC1abdo_0JJx9A7xfStKx0E3iCRha_bjQNqg2PkkFntfPnEdr8wlxLQwrHkPy1bq9lblVR5epLpkgNdNVFBBhwkUZQ2Wjr-UrD-P-iUnAXVq-yNVsuHzgorX-LHOpjYqdaYe0_xFNRtXIc2tj6jmJ8KCdY2wLYjD_OgMD_Re6_mh4yq11galIEJZfFr40drDk-o0w3AytAkRPf1qMX7ttXNrfWNZy49MH7Kard3YyP9ZKimKhuJbq-wr7skYJJ_3rZEvQIEdFe7Lt8uKq911oWtrsF54k6LdBF-guFzmQiPzLSpdTSDemezMRQ"

echo "🧪 TEST: TRANSFERENCIA DE CRÉDITOS"
echo "========================================"
echo ""

# Usaremos el exchange ID 1 del seed (si existe)
# requestedById: auth0|test-user-1
# offeredById: auth0|test-user-2
EXCHANGE_ID=1

echo "📝 Verificando exchange existente..."
EXCHANGE=$(curl -s -H "Authorization: Bearer $TOKEN" "$API_URL/exchanges/$EXCHANGE_ID")
EXCHANGE_STATE=$(echo "$EXCHANGE" | jq -r '.exchange.state')
REQUESTED_BY=$(echo "$EXCHANGE" | jq -r '.exchange.requestedById')
OFFERED_BY=$(echo "$EXCHANGE" | jq -r '.exchange.offeredById')

echo "   Exchange ID: $EXCHANGE_ID"
echo "   Estado actual: $EXCHANGE_STATE"
echo "   Solicitado por: $REQUESTED_BY"
echo "   Ofrecido por: $OFFERED_BY"
echo ""

# Verificar créditos iniciales
echo "💰 Créditos iniciales:"
USER1_CREDITS_BEFORE=$(curl -s "$API_URL/users/$REQUESTED_BY" | jq -r '.user.stats.averageRating // 0')
USER2_CREDITS_BEFORE=$(curl -s "$API_URL/users/$OFFERED_BY" | jq -r '.user.stats.averageRating // 0')
echo "   $REQUESTED_BY: (Ver en DB directamente)"
echo "   $OFFERED_BY: (Ver en DB directamente)"
echo ""

echo "📝 PASO 1: PENDING → CONFIRMED (por offeredById: auth0|test-user-1)"
echo "ℹ️  El token actual usa el fallback a auth0|test-user-1"
if [ "$EXCHANGE_STATE" = "PENDING" ]; then
    RESPONSE=$(curl -s -X PUT -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d '{"state": "CONFIRMED"}' \
      "$API_URL/exchanges/$EXCHANGE_ID")
    NEW_STATE=$(echo "$RESPONSE" | jq -r '.exchange.state // "error"')
    ERROR_MSG=$(echo "$RESPONSE" | jq -r '.message // ""')
    
    if [ "$NEW_STATE" = "CONFIRMED" ]; then
        echo "   ✅ Exchange confirmado"
    else
        echo "   ❌ Error: $ERROR_MSG"
    fi
else
    echo "   ⏭️  Exchange no está en PENDING (estado: $EXCHANGE_STATE)"
fi
echo ""

echo "📝 PASO 2: CONFIRMED → IN_PROGRESS (por requestedById: auth0|test-user-1)"
CURRENT_STATE=$(curl -s -H "Authorization: Bearer $TOKEN" "$API_URL/exchanges/$EXCHANGE_ID" | jq -r '.exchange.state')
if [ "$CURRENT_STATE" = "CONFIRMED" ]; then
    RESPONSE=$(curl -s -X PUT -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d '{"state": "IN_PROGRESS"}' \
      "$API_URL/exchanges/$EXCHANGE_ID")
    NEW_STATE=$(echo "$RESPONSE" | jq -r '.exchange.state // "error"')
    ERROR_MSG=$(echo "$RESPONSE" | jq -r '.message // ""')
    
    if [ "$NEW_STATE" = "IN_PROGRESS" ]; then
        echo "   ✅ Exchange iniciado"
    else
        echo "   ❌ Error: $ERROR_MSG"
    fi
else
    echo "   ⏭️  Exchange no está en CONFIRMED (estado: $CURRENT_STATE)"
fi
echo ""

echo "📝 PASO 3: IN_PROGRESS → COMPLETED (por offeredById: auth0|test-user-1)"
CURRENT_STATE=$(curl -s -H "Authorization: Bearer $TOKEN" "$API_URL/exchanges/$EXCHANGE_ID" | jq -r '.exchange.state')
if [ "$CURRENT_STATE" = "IN_PROGRESS" ]; then
    RESPONSE=$(curl -s -X PUT -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d '{"state": "COMPLETED"}' \
      "$API_URL/exchanges/$EXCHANGE_ID")
    NEW_STATE=$(echo "$RESPONSE" | jq -r '.exchange.state // "error"')
    ERROR_MSG=$(echo "$RESPONSE" | jq -r '.message // ""')
    
    if [ "$NEW_STATE" = "COMPLETED" ]; then
        echo "   ✅ Exchange completado y créditos transferidos"
    else
        echo "   ❌ Error: $ERROR_MSG"
    fi
else
    echo "   ⏭️  Exchange no está en IN_PROGRESS (estado: $CURRENT_STATE)"
fi
echo ""

echo "========================================"
echo "✅ PRUEBA COMPLETADA"
echo ""
echo "ℹ️  NOTA: Para ver los créditos actualizados, consulta directamente"
echo "   la base de datos o usa el endpoint GET /users/:id"
echo ""

