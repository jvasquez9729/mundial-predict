#!/usr/bin/env node

/**
 * Script para limpiar procesos existentes y preparar el entorno
 * 
 * Uso:
 *   node scripts/clean-start.js
 */

const { exec } = require('child_process')
const fs = require('fs')
const path = require('path')

const isWindows = process.platform === 'win32'

console.log('🧹 Limpiando procesos existentes...\n')

// Detener procesos de Next.js
function killProcesses() {
  return new Promise((resolve) => {
    if (isWindows) {
      // Windows: detener node, ngrok, y cualquier proceso en puerto 3000
      exec('taskkill /F /IM node.exe /T 2>$null; taskkill /F /IM ngrok.exe /T 2>$null; netstat -ano | findstr :3000 | findstr LISTENING', (error) => {
        // Ignorar errores si no hay procesos
        setTimeout(resolve, 1000)
      })
    } else {
      // Linux/macOS
      exec('pkill -f "next dev" 2>/dev/null; pkill ngrok 2>/dev/null', (error) => {
        setTimeout(resolve, 1000)
      })
    }
  })
}

// Limpiar lockfiles
function cleanLockFiles() {
  const lockPath = path.join(__dirname, '..', '.next', 'dev', 'lock')
  if (fs.existsSync(lockPath)) {
    try {
      fs.unlinkSync(lockPath)
      console.log('✅ Eliminado lockfile de Next.js')
    } catch (e) {
      console.warn('⚠️  No se pudo eliminar lockfile:', e.message)
    }
  }
}

async function main() {
  console.log('🔄 Deteniendo procesos existentes...')
  await killProcesses()
  
  console.log('🧹 Limpiando lockfiles...')
  cleanLockFiles()
  
  console.log('\n✅ Limpieza completada!\n')
  console.log('💡 Ahora puedes ejecutar:')
  console.log('   npm run dev')
  console.log('   O para usar con túnel público:')
  console.log('   npm run dev:tunnel\n')
}

main()
