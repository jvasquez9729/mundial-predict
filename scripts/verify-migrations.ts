/**
 * Script para verificar que las migraciones se aplicaron correctamente
 *
 * Uso:
 *   npx tsx scripts/verify-migrations.ts
 *
 * Requiere:
 *   - NEXT_PUBLIC_SUPABASE_URL
 *   - SUPABASE_SERVICE_KEY (o NEXT_PUBLIC_SUPABASE_ANON_KEY)
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Variables de entorno no configuradas')
  console.error('   Necesitas: NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

interface VerificationResult {
  name: string
  status: 'ok' | 'error' | 'warning'
  details: string
}

async function verifyMigrations(): Promise<VerificationResult[]> {
  const results: VerificationResult[] = []

  // 1. Verificar estructura de push_subscriptions (Migración 006)
  try {
    const { data, error } = await supabase
      .from('push_subscriptions')
      .select('id, creado_en, actualizado_en')
      .limit(1)

    if (error) {
      if (error.message.includes('creado_en') || error.message.includes('actualizado_en')) {
        results.push({
          name: 'Migración 006 (push_subscriptions)',
          status: 'error',
          details: 'Columnas en español no encontradas. ¿Se ejecutó la migración?'
        })
      } else {
        results.push({
          name: 'Migración 006 (push_subscriptions)',
          status: 'warning',
          details: `Error al consultar: ${error.message}`
        })
      }
    } else {
      results.push({
        name: 'Migración 006 (push_subscriptions)',
        status: 'ok',
        details: 'Columnas creado_en y actualizado_en existen'
      })
    }
  } catch (e) {
    results.push({
      name: 'Migración 006 (push_subscriptions)',
      status: 'error',
      details: `Error: ${e}`
    })
  }

  // 2. Verificar RLS deshabilitado (Migración 007)
  // Intentar leer users sin autenticación - si RLS está deshabilitado, debería funcionar
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .limit(1)

    if (error && error.message.includes('permission denied')) {
      results.push({
        name: 'Migración 007 (RLS deshabilitado)',
        status: 'warning',
        details: 'RLS parece estar activo aún. Verifica la migración.'
      })
    } else {
      results.push({
        name: 'Migración 007 (RLS deshabilitado)',
        status: 'ok',
        details: 'Tabla users accesible (RLS deshabilitado o con permisos)'
      })
    }
  } catch (e) {
    results.push({
      name: 'Migración 007 (RLS deshabilitado)',
      status: 'error',
      details: `Error: ${e}`
    })
  }

  // 3. Verificar triggers (Migración 008)
  // Verificar que special_predictions tiene actualizado_en
  try {
    const { data, error } = await supabase
      .from('special_predictions')
      .select('id, actualizado_en')
      .limit(1)

    if (error) {
      if (error.message.includes('actualizado_en')) {
        results.push({
          name: 'Migración 008 (triggers actualizado_en)',
          status: 'error',
          details: 'special_predictions no tiene columna actualizado_en'
        })
      } else {
        results.push({
          name: 'Migración 008 (triggers actualizado_en)',
          status: 'warning',
          details: `Error al consultar: ${error.message}`
        })
      }
    } else {
      results.push({
        name: 'Migración 008 (triggers actualizado_en)',
        status: 'ok',
        details: 'Columna actualizado_en existe en special_predictions'
      })
    }
  } catch (e) {
    results.push({
      name: 'Migración 008 (triggers actualizado_en)',
      status: 'error',
      details: `Error: ${e}`
    })
  }

  // 4. Verificar scoring_config existe (Migración 005)
  try {
    const { data, error } = await supabase
      .from('scoring_config')
      .select('id, puntos_exacto, activo')
      .eq('activo', true)
      .limit(1)

    if (error) {
      results.push({
        name: 'Migración 005 (scoring_config)',
        status: 'error',
        details: `Error: ${error.message}`
      })
    } else if (!data || data.length === 0) {
      results.push({
        name: 'Migración 005 (scoring_config)',
        status: 'warning',
        details: 'Tabla existe pero no hay configuración activa'
      })
    } else {
      results.push({
        name: 'Migración 005 (scoring_config)',
        status: 'ok',
        details: `Configuración activa encontrada (puntos_exacto: ${data[0].puntos_exacto})`
      })
    }
  } catch (e) {
    results.push({
      name: 'Migración 005 (scoring_config)',
      status: 'error',
      details: `Error: ${e}`
    })
  }

  // 5. Verificar password_reset_tokens (Migración 003)
  try {
    const { error } = await supabase
      .from('password_reset_tokens')
      .select('id')
      .limit(1)

    if (error && error.message.includes('does not exist')) {
      results.push({
        name: 'Migración 003 (password_reset_tokens)',
        status: 'error',
        details: 'Tabla no existe'
      })
    } else {
      results.push({
        name: 'Migración 003 (password_reset_tokens)',
        status: 'ok',
        details: 'Tabla existe'
      })
    }
  } catch (e) {
    results.push({
      name: 'Migración 003 (password_reset_tokens)',
      status: 'error',
      details: `Error: ${e}`
    })
  }

  return results
}

async function main() {
  console.log('🔍 Verificando migraciones de Supabase...\n')
  console.log(`   URL: ${supabaseUrl}\n`)

  const results = await verifyMigrations()

  console.log('═══════════════════════════════════════════════════════')
  console.log(' RESULTADOS DE VERIFICACIÓN')
  console.log('═══════════════════════════════════════════════════════\n')

  let hasErrors = false
  let hasWarnings = false

  for (const result of results) {
    const icon = result.status === 'ok' ? '✅' : result.status === 'warning' ? '⚠️' : '❌'
    console.log(`${icon} ${result.name}`)
    console.log(`   ${result.details}\n`)

    if (result.status === 'error') hasErrors = true
    if (result.status === 'warning') hasWarnings = true
  }

  console.log('═══════════════════════════════════════════════════════')

  if (hasErrors) {
    console.log('❌ Algunas migraciones tienen errores. Revisa los detalles arriba.')
    process.exit(1)
  } else if (hasWarnings) {
    console.log('⚠️  Algunas verificaciones tienen advertencias. Revisa los detalles.')
    process.exit(0)
  } else {
    console.log('✅ Todas las migraciones verificadas correctamente!')
    process.exit(0)
  }
}

main().catch(console.error)
