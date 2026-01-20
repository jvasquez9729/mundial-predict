#!/usr/bin/env node
/**
 * Script para obtener la IP local de tu computadora
 * Útil para configurar NEXT_PUBLIC_APP_URL para acceso desde móviles
 */

const os = require('os');
const { execSync } = require('child_process');

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  
  // Priorizar interfaces WiFi/Ethernet activas
  const preferredInterfaces = ['Wi-Fi', 'Ethernet', 'wlan0', 'eth0', 'en0', 'en1'];
  
  for (const name of preferredInterfaces) {
    const iface = interfaces[name];
    if (iface) {
      for (const addr of iface) {
        // IPv4 y no interna
        if (addr.family === 'IPv4' && !addr.internal) {
          return addr.address;
        }
      }
    }
  }
  
  // Buscar cualquier IPv4 no interna
  for (const name of Object.keys(interfaces)) {
    const iface = interfaces[name];
    if (iface) {
      for (const addr of iface) {
        if (addr.family === 'IPv4' && !addr.internal) {
          return addr.address;
        }
      }
    }
  }
  
  return null;
}

const ip = getLocalIP();

if (ip) {
  console.log('\n✅ IP Local encontrada:');
  console.log(`   ${ip}\n`);
  console.log('📝 Configura en tu archivo .env.local:');
  console.log(`   NEXT_PUBLIC_APP_URL=http://${ip}:3000\n`);
  console.log('📱 Accede desde tu móvil (misma WiFi):');
  console.log(`   http://${ip}:3000\n`);
  console.log('⚠️  Asegúrate de:');
  console.log('   - Tu móvil está en la misma red WiFi');
  console.log('   - Reiniciar el servidor después de cambiar .env.local');
  console.log('   - El firewall permite conexiones al puerto 3000\n');
} else {
  console.log('\n❌ No se pudo detectar la IP local automáticamente.\n');
  console.log('🔍 Obtén tu IP manualmente:');
  console.log('   Windows: ipconfig');
  console.log('   macOS/Linux: ifconfig\n');
  console.log('Luego configura en .env.local:');
  console.log('   NEXT_PUBLIC_APP_URL=http://TU_IP:3000\n');
}
