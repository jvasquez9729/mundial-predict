/**
 * Configuración del Sistema de Puntos
 *
 * Este módulo proporciona acceso a la configuración de puntos
 * tanto desde valores por defecto como desde la base de datos.
 *
 * Para usar la configuración de la base de datos, ejecutar la migración:
 * supabase/migrations/005_scoring_config.sql
 */

import { createServiceClient } from '@/lib/supabase/server'

// --- Tipos ---

export interface ScoringConfig {
  // Puntos por predicción de partidos
  puntosExacto: number
  puntosResultado: number
  puntosFallido: number

  // Puntos por predicciones especiales
  puntosCampeon: number
  puntosSubcampeon: number
  puntosGoleador: number
  puntosColombia: {
    grupos: number
    octavos: number
    cuartos: number
    semifinal: number
    final: number
    campeon: number
  }

  // Configuración del pozo
  inscripcionValor: number
  premios: {
    primeroPorcentaje: number
    exactosPorcentaje: number
    gruposPorcentaje: number
    reservaPorcentaje: number
  }
}

// --- Configuración por defecto ---

export const defaultScoringConfig: ScoringConfig = {
  // Puntos por predicción de partidos
  puntosExacto: 3,
  puntosResultado: 1,
  puntosFallido: 0,

  // Puntos por predicciones especiales
  puntosCampeon: 10,
  puntosSubcampeon: 5,
  puntosGoleador: 5,
  puntosColombia: {
    grupos: 2,
    octavos: 3,
    cuartos: 5,
    semifinal: 7,
    final: 10,
    campeon: 15,
  },

  // Configuración del pozo
  inscripcionValor: 100000, // COP
  premios: {
    primeroPorcentaje: 55,
    exactosPorcentaje: 25,
    gruposPorcentaje: 10,
    reservaPorcentaje: 10,
  },
}

// --- Cache ---

let cachedConfig: ScoringConfig | null = null
let cacheExpiry: number = 0
const CACHE_TTL = 5 * 60 * 1000 // 5 minutos

// --- Funciones ---

/**
 * Obtiene la configuración de puntos desde la base de datos.
 * Usa caché para evitar consultas frecuentes.
 * Si no hay configuración en BD, retorna los valores por defecto.
 */
export async function getScoringConfig(): Promise<ScoringConfig> {
  const now = Date.now()

  // Retornar desde caché si está vigente
  if (cachedConfig && cacheExpiry > now) {
    return cachedConfig
  }

  try {
    const supabase = createServiceClient()

    const { data, error } = await supabase
      .from('scoring_config')
      .select('*')
      .eq('activo', true)
      .single()

    if (error || !data) {
      // Si la tabla no existe o no hay datos, usar defaults
      cachedConfig = defaultScoringConfig
      cacheExpiry = now + CACHE_TTL
      return defaultScoringConfig
    }

    // Mapear datos de la BD a nuestro tipo
    cachedConfig = {
      puntosExacto: data.puntos_exacto,
      puntosResultado: data.puntos_resultado,
      puntosFallido: data.puntos_fallido,
      puntosCampeon: data.puntos_campeon,
      puntosSubcampeon: data.puntos_subcampeon,
      puntosGoleador: data.puntos_goleador,
      puntosColombia: {
        grupos: data.puntos_colombia_grupos,
        octavos: data.puntos_colombia_octavos,
        cuartos: data.puntos_colombia_cuartos,
        semifinal: data.puntos_colombia_semifinal,
        final: data.puntos_colombia_final,
        campeon: data.puntos_colombia_campeon,
      },
      inscripcionValor: data.inscripcion_valor,
      premios: {
        primeroPorcentaje: parseFloat(data.premio_primero_porcentaje),
        exactosPorcentaje: parseFloat(data.premio_exactos_porcentaje),
        gruposPorcentaje: parseFloat(data.premio_grupos_porcentaje),
        reservaPorcentaje: parseFloat(data.premio_reserva_porcentaje),
      },
    }

    cacheExpiry = now + CACHE_TTL
    return cachedConfig

  } catch {
    // Si hay error (ej: tabla no existe), usar defaults
    cachedConfig = defaultScoringConfig
    cacheExpiry = now + CACHE_TTL
    return defaultScoringConfig
  }
}

/**
 * Obtiene la configuración de forma sincrónica (solo desde caché o defaults).
 * Útil para componentes que no pueden ser async.
 */
export function getScoringConfigSync(): ScoringConfig {
  if (cachedConfig && cacheExpiry > Date.now()) {
    return cachedConfig
  }
  return defaultScoringConfig
}

/**
 * Invalida el caché de configuración.
 * Útil después de actualizar la configuración en la BD.
 */
export function invalidateScoringConfigCache(): void {
  cachedConfig = null
  cacheExpiry = 0
}

/**
 * Calcula los puntos para una predicción de partido.
 */
export function calculateMatchPoints(
  prediction: { golesLocal: number; golesVisitante: number },
  result: { golesLocal: number; golesVisitante: number },
  config: ScoringConfig = defaultScoringConfig
): { puntos: number; esExacto: boolean } {
  // Marcador exacto
  if (prediction.golesLocal === result.golesLocal &&
      prediction.golesVisitante === result.golesVisitante) {
    return { puntos: config.puntosExacto, esExacto: true }
  }

  // Determinamos el resultado (victoria local, empate, victoria visitante)
  const predResultado = Math.sign(prediction.golesLocal - prediction.golesVisitante)
  const realResultado = Math.sign(result.golesLocal - result.golesVisitante)

  // Acertó el resultado
  if (predResultado === realResultado) {
    return { puntos: config.puntosResultado, esExacto: false }
  }

  // No acertó
  return { puntos: config.puntosFallido, esExacto: false }
}

/**
 * Calcula los puntos por predicción de Colombia.
 */
export function calculateColombiaPoints(
  prediction: string | null, // 'grupos' | 'octavos' | etc.
  actual: string | null,
  config: ScoringConfig = defaultScoringConfig
): number {
  if (!prediction || !actual) return 0

  // Si acertó exactamente
  if (prediction === actual) {
    const key = prediction as keyof typeof config.puntosColombia
    return config.puntosColombia[key] || 0
  }

  return 0
}

/**
 * Calcula la distribución de premios basada en el número de participantes.
 */
export function calculatePrizeDistribution(
  totalParticipantes: number,
  config: ScoringConfig = defaultScoringConfig
): {
  pozoTotal: number
  premioPrimero: number
  premioExactos: number
  premioGrupos: number
  premioReserva: number
} {
  const pozoTotal = totalParticipantes * config.inscripcionValor

  return {
    pozoTotal,
    premioPrimero: Math.floor(pozoTotal * (config.premios.primeroPorcentaje / 100)),
    premioExactos: Math.floor(pozoTotal * (config.premios.exactosPorcentaje / 100)),
    premioGrupos: Math.floor(pozoTotal * (config.premios.gruposPorcentaje / 100)),
    premioReserva: Math.floor(pozoTotal * (config.premios.reservaPorcentaje / 100)),
  }
}

/**
 * Formatea un valor en pesos colombianos.
 */
export function formatCOP(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}
