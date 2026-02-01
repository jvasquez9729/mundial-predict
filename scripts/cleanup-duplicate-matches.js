/**
 * Script de limpieza: Eliminar partidos duplicados
 *
 * Detecta y elimina partidos duplicados en la tabla matches,
 * conservando solo uno de cada partido (el que tiene external_id si existe).
 *
 * Uso: node scripts/cleanup-duplicate-matches.js
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

async function main() {
  console.log('🧹 Limpieza de partidos duplicados')
  console.log('===================================\n')

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Falta NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local')
    process.exit(1)
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  // 1. Obtener todos los partidos
  console.log('1. Obteniendo todos los partidos...')
  const { data: allMatches, error: fetchError } = await supabase
    .from('matches')
    .select('id, equipo_local_id, equipo_visitante_id, fecha_hora, external_id, fase')
    .order('fecha_hora', { ascending: true })

  if (fetchError) {
    console.error('❌ Error al leer partidos:', fetchError.message)
    process.exit(1)
  }

  console.log(`   📊 Total de partidos en BD: ${allMatches.length}`)

  // 2. Identificar duplicados
  console.log('\n2. Identificando duplicados...')

  const matchGroups = new Map()

  for (const match of allMatches) {
    // Crear una clave única basada en equipos y fecha
    const key = `${match.equipo_local_id}|${match.equipo_visitante_id}|${match.fecha_hora}`

    if (!matchGroups.has(key)) {
      matchGroups.set(key, [])
    }
    matchGroups.get(key).push(match)
  }

  // Filtrar solo los grupos con duplicados
  const duplicateGroups = Array.from(matchGroups.values()).filter(group => group.length > 1)

  console.log(`   🔍 Grupos de partidos únicos: ${matchGroups.size}`)
  console.log(`   ⚠️  Grupos con duplicados: ${duplicateGroups.length}`)

  if (duplicateGroups.length === 0) {
    console.log('\n✅ No hay duplicados. La base de datos está limpia.')
    return
  }

  // 3. Mostrar detalles de duplicados
  console.log('\n3. Detalles de duplicados encontrados:')
  let totalDuplicatesToDelete = 0

  for (const group of duplicateGroups) {
    console.log(`\n   Partido duplicado ${group.length} veces:`)
    group.forEach((match, index) => {
      console.log(`     [${index + 1}] ID: ${match.id.substring(0, 8)}... | external_id: ${match.external_id || 'NULL'} | fase: ${match.fase}`)
    })
    totalDuplicatesToDelete += group.length - 1
  }

  console.log(`\n   💡 Se eliminarán ${totalDuplicatesToDelete} partidos duplicados`)
  console.log(`   ✅ Quedarán ${allMatches.length - totalDuplicatesToDelete} partidos únicos`)

  // 4. Seleccionar qué partidos conservar y cuáles eliminar
  const idsToDelete = []

  for (const group of duplicateGroups) {
    // Ordenar: primero los que tienen external_id, luego por fecha de creación implícita (id)
    const sorted = group.sort((a, b) => {
      // Priorizar los que tienen external_id
      if (a.external_id && !b.external_id) return -1
      if (!a.external_id && b.external_id) return 1
      // Si ambos tienen o ambos no tienen, mantener el primero
      return 0
    })

    // Conservar el primero, eliminar el resto
    const [keep, ...toDelete] = sorted
    console.log(`\n   Conservando: ${keep.id.substring(0, 8)}... (external_id: ${keep.external_id || 'NULL'})`)

    toDelete.forEach(match => {
      console.log(`   Eliminando: ${match.id.substring(0, 8)}... (external_id: ${match.external_id || 'NULL'})`)
      idsToDelete.push(match.id)
    })
  }

  // 5. Confirmar eliminación
  console.log(`\n\n⚠️  ADVERTENCIA: Se eliminarán ${idsToDelete.length} partidos duplicados`)
  console.log('   Esta acción NO se puede deshacer.')
  console.log('\n   Para proceder, ejecuta: node scripts/cleanup-duplicate-matches.js --confirm\n')

  // Solo ejecutar si se pasa el flag --confirm
  if (process.argv.includes('--confirm')) {
    console.log('\n4. Eliminando duplicados...')

    const { error: deleteError } = await supabase
      .from('matches')
      .delete()
      .in('id', idsToDelete)

    if (deleteError) {
      console.error('❌ Error al eliminar duplicados:', deleteError.message)
      process.exit(1)
    }

    console.log(`   ✅ ${idsToDelete.length} partidos duplicados eliminados`)

    // Verificar resultado
    const { data: remainingMatches } = await supabase
      .from('matches')
      .select('id')

    console.log(`\n✅ Limpieza completada. Partidos restantes: ${remainingMatches.length}`)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
