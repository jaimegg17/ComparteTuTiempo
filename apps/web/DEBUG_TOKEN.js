// Script para debuggear el token JWT
// Ejecuta esto en la consola del navegador después de iniciar sesión

(async () => {
  try {
    console.log('🔍 Obteniendo token...');
    const res = await fetch('/api/auth/token');
    const { accessToken } = await res.json();
    
    if (!accessToken) {
      console.error('❌ No se pudo obtener el token');
      return;
    }
    
    console.log('✅ Token obtenido, length:', accessToken.length);
    
    // Decodificar el token
    const parts = accessToken.split('.');
    if (parts.length !== 3) {
      console.error('❌ Token no es un JWT válido (debe tener 3 partes)');
      return;
    }
    
    const header = JSON.parse(atob(parts[0]));
    const payload = JSON.parse(atob(parts[1]));
    
    console.log('\n📋 Token Header:');
    console.log(header);
    
    console.log('\n📋 Token Payload:');
    console.log(payload);
    
    // Configuración esperada
    const expectedAudience = 'https://api.compartetutiempo.com';
    const expectedDomain = 'dev-b1nguzyezats1jpq.us.auth0.com';
    const expectedIssuer = `https://${expectedDomain}/`;
    
    console.log('\n🔍 Validación:');
    console.log('  Audience (token):', payload.aud);
    console.log('  Audience (esperado):', expectedAudience);
    console.log('  ✅ Audience coincide:', payload.aud === expectedAudience);
    
    console.log('  Issuer (token):', payload.iss);
    console.log('  Issuer (esperado):', expectedIssuer);
    console.log('  ✅ Issuer coincide:', payload.iss === expectedIssuer);
    
    const now = Math.floor(Date.now() / 1000);
    const isExpired = payload.exp < now;
    console.log('  Expira en:', new Date(payload.exp * 1000).toLocaleString());
    console.log('  Tiempo actual:', new Date().toLocaleString());
    console.log('  ⚠️ Token expirado:', isExpired);
    
    if (isExpired) {
      const expiredSeconds = now - payload.exp;
      console.log('  ⚠️ Expiró hace', expiredSeconds, 'segundos');
    } else {
      const expiresInSeconds = payload.exp - now;
      console.log('  ✅ Expira en', expiresInSeconds, 'segundos');
    }
    
    console.log('\n👤 Usuario:');
    console.log('  ID:', payload.sub);
    console.log('  Email:', payload.email);
    console.log('  Name:', payload.name);
    
    // Verificar si el problema es el audience
    if (payload.aud !== expectedAudience) {
      console.error('\n❌ PROBLEMA DETECTADO: El audience del token no coincide');
      console.error('   Token audience:', payload.aud);
      console.error('   Esperado:', expectedAudience);
      console.error('\n💡 SOLUCIÓN:');
      console.error('   1. Verifica que AUTH0_AUDIENCE en .env.local sea:', expectedAudience);
      console.error('   2. Cierra sesión y vuelve a iniciar sesión');
      console.error('   3. El login debe solicitar el token con el audience correcto');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
})();
