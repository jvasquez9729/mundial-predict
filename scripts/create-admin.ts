/**
 * Script para crear el primer usuario administrador
 * 
 * Uso:
 *   npx tsx scripts/create-admin.ts
 * 
 * O con ts-node:
 *   ts-node scripts/create-admin.ts
 */

import { createServiceClient } from '../lib/supabase/server'
import { hashPassword } from '../lib/auth/password'
import * as readline from 'readline'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve)
  })
}

async function main() {
  console.log('🔐 Configuración de Usuario Administrador')
  console.log('==========================================\n')

  try {
    // Solicitar datos del administrador
    const nombreCompleto = await question('Nombre completo: ')
    if (!nombreCompleto.trim()) {
      console.error('❌ El nombre completo es requerido')
      process.exit(1)
    }

    const cedula = await question('Cédula: ')
    if (!cedula.trim()) {
      console.error('❌ La cédula es requerida')
      process.exit(1)
    }

    const email = await question('Email: ')
    if (!email.trim() || !email.includes('@')) {
      console.error('❌ El email es requerido y debe ser válido')
      process.exit(1)
    }

    const celular = await question('Celular: ')
    if (!celular.trim()) {
      console.error('❌ El celular es requerido')
      process.exit(1)
    }

    const password = await question('Contraseña: ')
    if (!password.trim() || password.length < 6) {
      console.error('❌ La contraseña es requerida y debe tener al menos 6 caracteres')
      process.exit(1)
    }

    const confirmPassword = await question('Confirmar contraseña: ')
    if (password !== confirmPassword) {
      console.error('❌ Las contraseñas no coinciden')
      process.exit(1)
    }

    console.log('\n⏳ Creando usuario administrador...')

    const supabase = createServiceClient()

    // Verificar si ya existe un usuario con ese email o cédula
    const { data: existingEmail } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle()

    if (existingEmail) {
      console.error('❌ Ya existe un usuario con ese email')
      process.exit(1)
    }

    const { data: existingCedula } = await supabase
      .from('users')
      .select('id')
      .eq('cedula', cedula.trim())
      .maybeSingle()

    if (existingCedula) {
      console.error('❌ Ya existe un usuario con esa cédula')
      process.exit(1)
    }

    // Crear hash de la contraseña
    const password_hash = await hashPassword(password)

    // Insertar usuario admin
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        nombre_completo: nombreCompleto.trim(),
        cedula: cedula.trim(),
        email: email.toLowerCase().trim(),
        celular: celular.trim(),
        password_hash,
        es_admin: true,
      })
      .select('id, nombre_completo, email, es_admin')
      .single()

    if (error) {
      console.error('❌ Error al crear usuario:', error.message)
      process.exit(1)
    }

    console.log('\n✅ Usuario administrador creado exitosamente!')
    console.log('==========================================')
    console.log(`ID: ${user.id}`)
    console.log(`Nombre: ${user.nombre_completo}`)
    console.log(`Email: ${user.email}`)
    console.log(`Es Admin: ${user.es_admin ? 'Sí' : 'No'}`)
    console.log('\n📝 Puedes iniciar sesión con:')
    console.log(`   Email: ${user.email}`)
    console.log(`   Contraseña: [la que acabas de crear]`)
    console.log('\n🔗 URL de login: http://localhost:3000/login')

  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error)
    process.exit(1)
  } finally {
    rl.close()
  }
}

main()
