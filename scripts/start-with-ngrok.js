#!/usr/bin/env node

/**
 * Script para iniciar el servidor Next.js con ngrok automáticamente
 * Esto permite que los links funcionen desde cualquier red (internet)
 * 
 * Uso:
 *   node scripts/start-with-ngrok.js
 *   npm run dev:tunnel
 */

const { spawn } = require('child_process')
const fs = require('fs')
const path = require('path')

const NGROK_CONFIG_PATH = path.join(__dirname, '..', '.ngrok.json')
const PORT = process.env.PORT || 3000

console.log('🚀 Iniciando servidor con túnel público (ngrok)...\n')

// Verificar si ngrok está instalado
function checkNgrokInstalled() {
  return new Promise((resolve) => {
    // Intentar encontrar ngrok en diferentes ubicaciones comunes
    const ngrokPaths = [
      'ngrok',  // En PATH
      'C:\\ngrok\\ngrok.exe',  // Ubicación común en Windows
      process.env.LOCALAPPDATA + '\\ngrok\\ngrok.exe',  // AppData Local
    ]
    
    let foundPath = null
    
    function tryNext() {
      if (ngrokPaths.length === 0) {
        resolve(false)
        return
      }
      
      const path = ngrokPaths.shift()
      const check = spawn(path, ['version'], { shell: true })
      
      check.on('close', (code) => {
        if (code === 0) {
          // Guardar la ruta encontrada para uso futuro
          process.env.NGROK_PATH = path
          resolve(path)
        } else {
          tryNext()
        }
      })
      
      check.on('error', () => {
        tryNext()
      })
    }
    
    tryNext()
  })
}

// Detener procesos ngrok existentes
function stopExistingNgrok() {
  return new Promise((resolve) => {
    const isWindows = process.platform === 'win32'
    const checkCommand = isWindows 
      ? ['tasklist', ['/FI', 'IMAGENAME eq ngrok.exe']]
      : ['ps', ['aux']]
    
    const check = spawn(checkCommand[0], checkCommand[1], { shell: false, stdio: 'pipe' })
    let output = ''
    
    check.stdout.on('data', (data) => {
      output += data.toString()
    })
    
    check.on('close', () => {
      const hasNgrok = output.toLowerCase().includes('ngrok')
      
      if (hasNgrok) {
        console.log('⚠️  Detectado ngrok corriendo, deteniendo...')
        const killCommand = isWindows 
          ? ['taskkill', ['/F', '/IM', 'ngrok.exe']]
          : ['pkill', ['ngrok']]
        
        const kill = spawn(killCommand[0], killCommand[1], { shell: false, stdio: 'ignore' })
        kill.on('close', () => {
          // Esperar un momento para que se detenga completamente
          setTimeout(resolve, 1000)
        })
        kill.on('error', () => resolve())
      } else {
        resolve()
      }
    })
    
    check.on('error', () => resolve())
  })
}

// Obtener URL de ngrok
async function getNgrokUrl() {
  // Primero detener cualquier ngrok existente
  await stopExistingNgrok()
  
  return new Promise((resolve, reject) => {
    // Intentar leer URL guardada primero
    if (fs.existsSync(NGROK_CONFIG_PATH)) {
      try {
        const config = JSON.parse(fs.readFileSync(NGROK_CONFIG_PATH, 'utf8'))
        if (config.url && config.expiresAt > Date.now()) {
          console.log(`✅ Usando URL de ngrok guardada: ${config.url}`)
          resolve(config.url)
          return
        }
      } catch (e) {
        // Continuar con nueva conexión
      }
    }

    console.log('⏳ Iniciando túnel ngrok...')
    console.log('📋 Esperando a que ngrok genere la URL pública...\n')
    const ngrokCommand = process.env.NGROK_PATH || 'ngrok'
    const ngrok = spawn(ngrokCommand, ['http', String(PORT), '--log=stdout'], { 
      shell: false,
      stdio: ['ignore', 'pipe', 'pipe'] // Cambiar a 'pipe' para stderr también
    })

    let output = ''
    let url = null

    ngrok.stdout.on('data', (data) => {
      const text = data.toString()
      output += text
      
      // Mostrar el output en tiempo real para debugging
      process.stdout.write(text)
      
      // Buscar la URL de ngrok en diferentes formatos posibles
      const urlPatterns = [
        /https:\/\/[a-z0-9-]+\.ngrok-free\.app/g,  // Formato nuevo
        /https:\/\/[a-z0-9-]+\.ngrok-free\.dev/g,  // Formato nuevo alternativo
        /https:\/\/[a-z0-9-]+\.ngrok\.io/g,        // Formato antiguo
        /Forwarding\s+https:\/\/([a-z0-9-]+\.[a-z0-9.-]+)/gi,  // Formato "Forwarding"
      ]
      
      for (const pattern of urlPatterns) {
        const matches = output.match(pattern)
        if (matches && !url) {
          // Tomar la primera URL encontrada
          url = matches[0].replace(/Forwarding\s+/i, '').trim()
          
          // Si el match incluye "Forwarding", extraer solo la URL
          if (url.includes('Forwarding')) {
            const urlMatch = url.match(/https:\/\/[^\s]+/)
            if (urlMatch) url = urlMatch[0]
          }
          
          // Validar que es una URL válida
          if (url.startsWith('https://')) {
            console.log(`\n\n✅ Túnel ngrok activo: ${url}`)
            console.log(`📱 Los links funcionarán desde cualquier red usando esta URL\n`)
            
            // Guardar URL
            try {
              fs.writeFileSync(NGROK_CONFIG_PATH, JSON.stringify({
                url,
                expiresAt: Date.now() + (8 * 60 * 60 * 1000) // 8 horas (ngrok free dura ~8 horas)
              }))
            } catch (e) {
              console.warn('⚠️  No se pudo guardar la configuración:', e.message)
            }

            resolve(url)
            break
          }
        }
      }
    })

    // También revisar stderr por si acaso
    ngrok.stderr.on('data', (data) => {
      const text = data.toString()
      output += text
      process.stderr.write(text)
      
      // Buscar URL también en stderr
      const urlPatterns = [
        /https:\/\/[a-z0-9-]+\.ngrok-free\.app/g,
        /https:\/\/[a-z0-9-]+\.ngrok-free\.dev/g,
        /https:\/\/[a-z0-9-]+\.ngrok\.io/g,
      ]
      
      for (const pattern of urlPatterns) {
        const matches = text.match(pattern)
        if (matches && !url) {
          url = matches[0]
          console.log(`\n\n✅ Túnel ngrok activo: ${url}`)
          console.log(`📱 Los links funcionarán desde cualquier red usando esta URL\n`)
          resolve(url)
          break
        }
      }
    })

    ngrok.on('error', (error) => {
      console.error('❌ Error al iniciar ngrok:', error.message)
      reject(error)
    })
    
    // Timeout de seguridad - si después de 30 segundos no obtiene URL, rechazar
    setTimeout(() => {
      if (!url) {
        console.error('\n❌ Timeout: No se pudo obtener la URL de ngrok después de 30 segundos')
        console.log('💡 Intenta ejecutar ngrok manualmente: ngrok http 3000')
        ngrok.kill()
        reject(new Error('Timeout esperando URL de ngrok'))
      }
    }, 30000)
  })
}

async function main() {
  // Verificar si ngrok está instalado
  const ngrokPath = await checkNgrokInstalled()
  
  if (!ngrokPath) {
    console.error('❌ ngrok no está instalado.\n')
    console.log('📥 Instala ngrok:')
    console.log('   Windows (con Chocolatey): choco install ngrok')
    console.log('   macOS: brew install ngrok')
    console.log('   O descarga desde: https://ngrok.com/download\n')
    console.log('🔑 Luego configura tu token:')
    console.log('   ngrok config add-authtoken TU_AUTH_TOKEN')
    console.log('   (Obtén tu token en: https://dashboard.ngrok.com/get-started/your-authtoken)\n')
    process.exit(1)
  }

  // Iniciar ngrok en background
  let ngrokUrl
  try {
    ngrokUrl = await getNgrokUrl()
  } catch (error) {
    console.error('❌ Error al iniciar ngrok:', error.message)
    console.log('\n💡 Asegúrate de haber configurado tu token:')
    console.log('   ngrok config add-authtoken TU_AUTH_TOKEN\n')
    process.exit(1)
  }

  // Actualizar .env.local con la URL de ngrok
  const envPath = path.join(__dirname, '..', '.env.local')
  let envContent = ''
  
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8')
  }

  // Actualizar o agregar NEXT_PUBLIC_APP_URL
  const urlLine = `NEXT_PUBLIC_APP_URL=${ngrokUrl}`
  
  if (envContent.includes('NEXT_PUBLIC_APP_URL=')) {
    envContent = envContent.replace(/NEXT_PUBLIC_APP_URL=.*/g, urlLine)
  } else {
    envContent += `\n${urlLine}\n`
  }

  fs.writeFileSync(envPath, envContent)
  console.log(`📝 Actualizado .env.local con: ${urlLine}`)
  console.log('🔄 Reinicia el servidor Next.js para aplicar los cambios\n')

  // Iniciar servidor Next.js
  console.log('🚀 Iniciando servidor Next.js...\n')
  const nextServer = spawn('npm', ['run', 'dev'], {
    shell: true,
    stdio: 'inherit',
    env: {
      ...process.env,
      NEXT_PUBLIC_APP_URL: ngrokUrl,
      PORT: PORT
    }
  })

  nextServer.on('close', (code) => {
    console.log(`\n👋 Servidor cerrado (código: ${code})`)
    process.exit(code)
  })

  // Manejar Ctrl+C
  process.on('SIGINT', () => {
    console.log('\n\n🛑 Cerrando servidor...')
    nextServer.kill()
    process.exit(0)
  })
}

main().catch((error) => {
  console.error('❌ Error:', error)
  process.exit(1)
})
