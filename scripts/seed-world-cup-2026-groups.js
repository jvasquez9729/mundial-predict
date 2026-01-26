/**
 * Seed manual: equipos y partidos de fase de grupos - Mundial 2026
 * Calendario oficial FIFA (jun 2026). Ejecutar una vez.
 *
 * Uso: node scripts/seed-world-cup-2026-groups.js
 * Requiere: .env.local con NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

// --- Equipos a asegurar (codigo único). Los existentes se ignoran.
const TEAMS = [
  { codigo: 'RSA', nombre: 'Sudáfrica', grupo: 'A' },
  { codigo: 'KOR', nombre: 'Corea del Sur', grupo: 'A' },
  { codigo: 'UEP_D', nombre: 'Por definir (UEFA Path D)', grupo: 'A' },
  { codigo: 'QAT', nombre: 'Catar', grupo: 'B' },
  { codigo: 'SUI', nombre: 'Suiza', grupo: 'B' },
  { codigo: 'UEP_A', nombre: 'Por definir (UEFA Path A)', grupo: 'B' },
  { codigo: 'MAR', nombre: 'Marruecos', grupo: 'C' },
  { codigo: 'HAI', nombre: 'Haití', grupo: 'C' },
  { codigo: 'SCO', nombre: 'Escocia', grupo: 'C' },
  { codigo: 'PAR', nombre: 'Paraguay', grupo: 'D' },
  { codigo: 'AUS', nombre: 'Australia', grupo: 'D' },
  { codigo: 'UEP_C', nombre: 'Por definir (UEFA Path C)', grupo: 'D' },
  { codigo: 'CUW', nombre: 'Curazao', grupo: 'E' },
  { codigo: 'CIV', nombre: 'Costa de Marfil', grupo: 'E' },
  { codigo: 'ECU', nombre: 'Ecuador', grupo: 'E' },
  { codigo: 'JPN', nombre: 'Japón', grupo: 'F' },
  { codigo: 'UEP_B', nombre: 'Por definir (UEFA Path B)', grupo: 'F' },
  { codigo: 'TUN', nombre: 'Túnez', grupo: 'F' },
  { codigo: 'EGY', nombre: 'Egipto', grupo: 'G' },
  { codigo: 'IRN', nombre: 'Irán', grupo: 'G' },
  { codigo: 'NZL', nombre: 'Nueva Zelanda', grupo: 'G' },
  { codigo: 'CPV', nombre: 'Cabo Verde', grupo: 'H' },
  { codigo: 'KSA', nombre: 'Arabia Saudita', grupo: 'H' },
  { codigo: 'SEN', nombre: 'Senegal', grupo: 'I' },
  { codigo: 'ICP_2', nombre: 'Por definir (IC Path 2)', grupo: 'I' },
  { codigo: 'NOR', nombre: 'Noruega', grupo: 'I' },
  { codigo: 'ALG', nombre: 'Argelia', grupo: 'J' },
  { codigo: 'AUT', nombre: 'Austria', grupo: 'J' },
  { codigo: 'JOR', nombre: 'Jordania', grupo: 'J' },
  { codigo: 'ICP_1', nombre: 'Por definir (IC Path 1)', grupo: 'K' },
  { codigo: 'UZB', nombre: 'Uzbekistán', grupo: 'K' },
  { codigo: 'CRO', nombre: 'Croacia', grupo: 'L' },
  { codigo: 'GHA', nombre: 'Ghana', grupo: 'L' },
  { codigo: 'PAN', nombre: 'Panamá', grupo: 'L' },
]

// Convierte fecha local a ISO UTC. hour en 24h, tzOffset ej. -6 para UTC-6.
function toUtc(year, month, day, hour, min, tzOffset) {
  const utcHour = hour - tzOffset
  const d = new Date(Date.UTC(year, month - 1, day, utcHour, min || 0, 0, 0))
  return d.toISOString().slice(0, 19) + 'Z'
}

// Partidos fase de grupos (1–72). [num, home, away, fecha UTC, estadio]
function buildMatches() {
  const m = (num, home, away, y, mo, d, h, tz, stadium) => [
    num,
    home,
    away,
    toUtc(y, mo, d, h, 0, tz),
    stadium,
  ]
  return [
    m(1, 'MEX', 'RSA', 2026, 6, 11, 13, -6, 'Estadio Azteca, Ciudad de México'),
    m(2, 'KOR', 'UEP_D', 2026, 6, 11, 20, -6, 'Estadio Akron, Guadalajara'),
    m(3, 'CAN', 'UEP_A', 2026, 6, 12, 15, -4, 'BMO Field, Toronto'),
    m(4, 'USA', 'PAR', 2026, 6, 12, 18, -7, 'SoFi Stadium, Los Ángeles'),
    m(5, 'BRA', 'MAR', 2026, 6, 13, 18, -4, 'Gillette Stadium, Boston'),
    m(6, 'AUS', 'UEP_C', 2026, 6, 13, 21, -7, 'BC Place, Vancouver'),
    m(7, 'HAI', 'SCO', 2026, 6, 13, 18, -4, 'MetLife Stadium, Nueva York/Nueva Jersey'),
    m(8, 'QAT', 'SUI', 2026, 6, 13, 12, -7, "Levi's Stadium, San Francisco"),
    m(9, 'GER', 'CUW', 2026, 6, 14, 12, -5, 'Lincoln Financial Field, Filadelfia'),
    m(10, 'CIV', 'ECU', 2026, 6, 14, 19, -4, 'NRG Stadium, Houston'),
    m(11, 'NED', 'JPN', 2026, 6, 14, 15, -5, 'AT&T Stadium, Arlington'),
    m(12, 'UEP_B', 'TUN', 2026, 6, 14, 20, -6, 'Estadio BBVA, Monterrey'),
    m(13, 'ESP', 'CPV', 2026, 6, 15, 12, -4, 'Hard Rock Stadium, Miami'),
    m(14, 'KSA', 'URU', 2026, 6, 15, 18, -4, 'Mercedes-Benz Stadium, Atlanta'),
    m(15, 'BEL', 'EGY', 2026, 6, 15, 12, -7, 'SoFi Stadium, Los Ángeles'),
    m(16, 'IRN', 'NZL', 2026, 6, 15, 18, -7, 'Lumen Field, Seattle'),
    m(17, 'FRA', 'SEN', 2026, 6, 16, 15, -4, 'MetLife Stadium, Nueva York/Nueva Jersey'),
    m(18, 'ICP_2', 'NOR', 2026, 6, 16, 18, -4, 'Gillette Stadium, Boston'),
    m(19, 'ARG', 'ALG', 2026, 6, 16, 20, -5, 'Arrowhead Stadium, Kansas City'),
    m(20, 'AUT', 'JOR', 2026, 6, 16, 21, -7, "Levi's Stadium, Santa Clara"),
    m(21, 'ENG', 'CRO', 2026, 6, 17, 15, -5, 'BMO Field, Toronto'),
    m(22, 'GHA', 'PAN', 2026, 6, 17, 19, -4, 'AT&T Stadium, Arlington'),
    m(23, 'POR', 'ICP_1', 2026, 6, 17, 12, -5, 'NRG Stadium, Houston'),
    m(24, 'UZB', 'COL', 2026, 6, 17, 20, -6, 'Estadio Azteca, Ciudad de México'),
    m(25, 'UEP_D', 'RSA', 2026, 6, 18, 12, -4, 'Mercedes-Benz Stadium, Atlanta'),
    m(26, 'SUI', 'UEP_A', 2026, 6, 18, 12, -7, 'SoFi Stadium, Los Ángeles'),
    m(27, 'CAN', 'QAT', 2026, 6, 18, 15, -7, 'BC Place, Vancouver'),
    m(28, 'MEX', 'KOR', 2026, 6, 18, 19, -6, 'Estadio Akron, Guadalajara'),
    m(29, 'BRA', 'HAI', 2026, 6, 19, 21, -4, 'Lincoln Financial Field, Filadelfia'),
    m(30, 'SCO', 'MAR', 2026, 6, 19, 18, -4, 'Gillette Stadium, Boston'),
    m(31, 'UEP_C', 'PAR', 2026, 6, 19, 21, -7, "Levi's Stadium, Santa Clara"),
    m(32, 'USA', 'AUS', 2026, 6, 19, 12, -7, 'Lumen Field, Seattle'),
    m(33, 'GER', 'CIV', 2026, 6, 20, 16, -4, 'BMO Field, Toronto'),
    m(34, 'ECU', 'CUW', 2026, 6, 20, 19, -5, 'Arrowhead Stadium, Kansas City'),
    m(35, 'NED', 'UEP_B', 2026, 6, 20, 12, -5, 'NRG Stadium, Houston'),
    m(36, 'TUN', 'JPN', 2026, 6, 20, 22, -6, 'Estadio BBVA, Monterrey'),
    m(37, 'ESP', 'KSA', 2026, 6, 21, 12, -4, 'Hard Rock Stadium, Miami'),
    m(38, 'URU', 'CPV', 2026, 6, 21, 18, -4, 'Mercedes-Benz Stadium, Atlanta'),
    m(39, 'BEL', 'IRN', 2026, 6, 21, 12, -7, 'SoFi Stadium, Los Ángeles'),
    m(40, 'NZL', 'EGY', 2026, 6, 21, 18, -7, 'BC Place, Vancouver'),
    m(41, 'FRA', 'ICP_2', 2026, 6, 22, 17, -4, 'MetLife Stadium, Nueva York/Nueva Jersey'),
    m(42, 'NOR', 'SEN', 2026, 6, 22, 20, -4, 'Lincoln Financial Field, Filadelfia'),
    m(43, 'ARG', 'AUT', 2026, 6, 22, 12, -5, 'AT&T Stadium, Arlington'),
    m(44, 'JOR', 'ALG', 2026, 6, 22, 20, -7, "Levi's Stadium, Santa Clara"),
    m(45, 'ENG', 'GHA', 2026, 6, 23, 16, -4, 'MetLife Stadium, Nueva York/Nueva Jersey'),
    m(46, 'PAN', 'CRO', 2026, 6, 23, 19, -4, 'BMO Field, Toronto'),
    m(47, 'POR', 'UZB', 2026, 6, 23, 12, -5, 'NRG Stadium, Houston'),
    m(48, 'COL', 'ICP_1', 2026, 6, 23, 20, -6, 'Estadio Akron, Guadalajara'),
    m(49, 'SCO', 'BRA', 2026, 6, 24, 18, -4, 'Hard Rock Stadium, Miami'),
    m(50, 'MAR', 'HAI', 2026, 6, 24, 18, -4, 'Mercedes-Benz Stadium, Atlanta'),
    m(51, 'SUI', 'CAN', 2026, 6, 24, 12, -7, 'BC Place, Vancouver'),
    m(52, 'UEP_A', 'QAT', 2026, 6, 24, 12, -7, 'Lumen Field, Seattle'),
    m(53, 'UEP_D', 'MEX', 2026, 6, 24, 19, -6, 'Estadio Azteca, Ciudad de México'),
    m(54, 'RSA', 'KOR', 2026, 6, 24, 19, -6, 'Estadio BBVA, Monterrey'),
    m(55, 'ECU', 'GER', 2026, 6, 25, 19, -5, 'Lincoln Financial Field, Filadelfia'),
    m(56, 'CUW', 'CIV', 2026, 6, 25, 16, -4, 'MetLife Stadium, Nueva York/Nueva Jersey'),
    m(57, 'TUN', 'NED', 2026, 6, 25, 18, -5, 'AT&T Stadium, Arlington'),
    m(58, 'JPN', 'UEP_B', 2026, 6, 25, 18, -5, 'Arrowhead Stadium, Kansas City'),
    m(59, 'UEP_C', 'USA', 2026, 6, 25, 19, -7, 'SoFi Stadium, Los Ángeles'),
    m(60, 'PAR', 'AUS', 2026, 6, 25, 19, -7, "Levi's Stadium, Santa Clara"),
    m(61, 'NOR', 'FRA', 2026, 6, 26, 15, -4, 'Gillette Stadium, Boston'),
    m(62, 'SEN', 'ICP_2', 2026, 6, 26, 15, -4, 'BMO Field, Toronto'),
    m(63, 'NZL', 'BEL', 2026, 6, 26, 20, -7, 'Lumen Field, Seattle'),
    m(64, 'EGY', 'IRN', 2026, 6, 26, 20, -7, 'BC Place, Vancouver'),
    m(65, 'URU', 'ESP', 2026, 6, 26, 18, -6, 'NRG Stadium, Houston'),
    m(66, 'CPV', 'KSA', 2026, 6, 26, 19, -5, 'Estadio Akron, Guadalajara'),
    m(67, 'PAN', 'ENG', 2026, 6, 27, 17, -4, 'MetLife Stadium, Nueva York/Nueva Jersey'),
    m(68, 'CRO', 'GHA', 2026, 6, 27, 17, -4, 'Lincoln Financial Field, Filadelfia'),
    m(69, 'JOR', 'ARG', 2026, 6, 27, 21, -5, 'Arrowhead Stadium, Kansas City'),
    m(70, 'ALG', 'AUT', 2026, 6, 27, 21, -5, 'AT&T Stadium, Arlington'),
    m(71, 'COL', 'POR', 2026, 6, 27, 19, -4, 'Hard Rock Stadium, Miami'),
    m(72, 'ICP_1', 'UZB', 2026, 6, 27, 19, -4, 'Mercedes-Benz Stadium, Atlanta'),
  ]
}

async function main() {
  console.log('🌍 Seed Mundial 2026 - Fase de grupos')
  console.log('=====================================\n')

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Falta NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local')
    process.exit(1)
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  // 1. Upsert equipos (solo insertar los que no existan)
  console.log('1. Sincronizando equipos…')
  const { data: existingTeams, error: fetchTeamsError } = await supabase
    .from('teams')
    .select('id, codigo')

  if (fetchTeamsError) {
    console.error('❌ Error al leer equipos:', fetchTeamsError.message)
    process.exit(1)
  }

  const existingCodes = new Set((existingTeams || []).map((t) => t.codigo))
  const toInsert = TEAMS.filter((t) => !existingCodes.has(t.codigo))

  if (toInsert.length > 0) {
    const { error: insertError } = await supabase.from('teams').insert(toInsert)
    if (insertError) {
      console.error('❌ Error al insertar equipos:', insertError.message)
      process.exit(1)
    }
    console.log(`   ✅ ${toInsert.length} equipos nuevos insertados.`)
  } else {
    console.log('   ✅ Todos los equipos ya existen.')
  }

  // 2. Mapa codigo -> id
  const { data: allTeams, error: allError } = await supabase.from('teams').select('id, codigo')
  if (allError || !allTeams) {
    console.error('❌ Error al listar equipos:', allError?.message)
    process.exit(1)
  }
  const codeToId = Object.fromEntries(allTeams.map((t) => [t.codigo, t.id]))

  // 3. Partidos ya existentes por external_id
  const { data: existingMatches } = await supabase.from('matches').select('external_id')
  const existingIds = new Set((existingMatches || []).map((m) => m.external_id).filter(Boolean))

  const matches = buildMatches()
  let inserted = 0
  let skipped = 0

  console.log('\n2. Insertando partidos de fase de grupos…')

  for (const [num, home, away, fecha_hora, estadio] of matches) {
    if (existingIds.has(num)) {
      skipped++
      continue
    }
    const homeId = codeToId[home]
    const awayId = codeToId[away]
    if (!homeId || !awayId) {
      console.warn(`   ⚠ Omitido partido ${num}: ${home} vs ${away} (equipo no encontrado)`)
      skipped++
      continue
    }
    const { error } = await supabase.from('matches').insert({
      equipo_local_id: homeId,
      equipo_visitante_id: awayId,
      fase: 'grupos',
      fecha_hora,
      estadio,
      estado: 'proximo',
      predicciones_cerradas: false,
      external_id: num,
    })
    if (error) {
      if (error.code === '23505') {
        existingIds.add(num)
        skipped++
      } else {
        console.error(`   ❌ Error en partido ${num}:`, error.message)
      }
      continue
    }
    inserted++
    existingIds.add(num)
  }

  console.log(`   ✅ ${inserted} partidos insertados.`)
  if (skipped > 0) console.log(`   ⏭ ${skipped} omitidos (ya existían o equipo faltante).`)
  console.log('\n✅ Seed completado.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
