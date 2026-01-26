/**
 * Script para actualizar la contraseña de un usuario existente
 * 
 * Uso:
 *   node scripts/update-password.js
 * 
 * O con npm:
 *   npm run update-password
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const bcrypt = require('bcryptjs')
const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

function question(query) {
  return new Promise((resolve) => {
    rl.question(query, resolve)
  })
}

async function main() {
  console.log('🔐 Actualizar Contraseña de Usuario')
  console.log('====================================\n')

  try {
    // Verificar variables de entorno
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('❌ Error: Variables de entorno no configuradas')
      console.error('   Asegúrate de tener NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env.local')
      process.exit(1)
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // Solicitar identificador del usuario
    console.log('¿Cómo quieres identificar al usuario?')
    console.log('1. Email')
    console.log('2. Cédula')
    console.log('3. Celular')
    const identifierType = await question('\nOpción (1-3): ')

    let identifier = ''
    let field = ''
    
    switch (identifierType.trim()) {
      case '1':
        field = 'email'
        identifier = await question('Email del usuario: ')
        if (!identifier.trim() || !identifier.includes('@')) {
          console.error('❌ Email inválido')
          process.exit(1)
        }
        identifier = identifier.toLowerCase().trim()
        break
      case '2':
        field = 'cedula'
        identifier = await question('Cédula del usuario: ')
        if (!identifier.trim()) {
          console.error('❌ Cédula inválida')
          process.exit(1)
        }
        identifier = identifier.trim()
        break
      case '3':
        field = 'celular'
        identifier = await question('Celular del usuario: ')
        if (!identifier.trim()) {
          console.error('❌ Celular inválido')
          process.exit(1)
        }
        identifier = identifier.trim()
        break
      default:
        console.error('❌ Opción inválida')
        process.exit(1)
    }

    console.log('\n⏳ Buscando usuario...')

    // Buscar usuario
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, nombre_completo, email, cedula, celular, es_admin')
      .eq(field, identifier)
      .single()

    if (userError || !user) {
      console.error(`❌ Usuario no encontrado con ${field}: ${identifier}`)
      process.exit(1)
    }

    console.log('\n✅ Usuario encontrado:')
    console.log(`   Nombre: ${user.nombre_completo}`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Cédula: ${user.cedula}`)
    console.log(`   Celular: ${user.celular}`)
    console.log(`   Es Admin: ${user.es_admin ? 'Sí' : 'No'}`)

    // Confirmar que es el usuario correcto
    const confirm = await question('\n¿Es el usuario correcto? (s/n): ')
    if (confirm.toLowerCase() !== 's' && confirm.toLowerCase() !== 'si') {
      console.log('❌ Operación cancelada')
      process.exit(0)
    }

    // Solicitar nueva contraseña
    console.log('\n🔒 Nueva Contraseña')
    console.log('==================')
    const newPassword = await question('Nueva contraseña (mínimo 6 caracteres): ')
    if (!newPassword.trim() || newPassword.length < 6) {
      console.error('❌ La contraseña debe tener al menos 6 caracteres')
      process.exit(1)
    }

    const confirmPassword = await question('Confirmar nueva contraseña: ')
    if (newPassword !== confirmPassword) {
      console.error('❌ Las contraseñas no coinciden')
      process.exit(1)
    }

    // Hashear nueva contraseña
    console.log('\n⏳ Actualizando contraseña...')
    const password_hash = await bcrypt.hash(newPassword, 12)

    // Actualizar contraseña
    const { error: updateError } = await supabase
      .from('users')
      .update({ password_hash })
      .eq('id', user.id)

    if (updateError) {
      console.error('❌ Error al actualizar contraseña:', updateError.message)
      process.exit(1)
    }

    console.log('\n✅ Contraseña actualizada exitosamente!')
    console.log('====================================')
    console.log(`Usuario: ${user.nombre_completo}`)
    console.log(`Email: ${user.email}`)
    console.log('\n📝 El usuario ahora puede iniciar sesión con:')
    console.log(`   Email/Cédula/Celular: ${identifier}`)
    console.log(`   Nueva contraseña: [la que acabas de configurar]`)
    console.log('\n🔗 URL de login: http://localhost:3000/login')

  } catch (error) {
    console.error('\n❌ Error:', error.message)
    if (error.message.includes('Cannot find module')) {
      console.error('\n💡 Asegúrate de haber instalado las dependencias:')
      console.error('   npm install')
    }
    process.exit(1)
  } finally {
    rl.close()
  }
}

main()
