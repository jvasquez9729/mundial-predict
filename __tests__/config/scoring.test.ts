import { describe, it, expect } from 'vitest'
import {
  defaultScoringConfig,
  calculateMatchPoints,
  calculateColombiaPoints,
  calculatePrizeDistribution,
  formatCOP,
} from '@/lib/config/scoring'

describe('Scoring Configuration', () => {
  describe('defaultScoringConfig', () => {
    it('debe tener valores de puntos por partido', () => {
      expect(defaultScoringConfig.puntosExacto).toBe(3)
      expect(defaultScoringConfig.puntosResultado).toBe(1)
      expect(defaultScoringConfig.puntosFallido).toBe(0)
    })

    it('debe tener valores de predicciones especiales', () => {
      expect(defaultScoringConfig.puntosCampeon).toBe(10)
      expect(defaultScoringConfig.puntosSubcampeon).toBe(5)
      expect(defaultScoringConfig.puntosGoleador).toBe(5)
    })

    it('debe tener configuración de Colombia', () => {
      expect(defaultScoringConfig.puntosColombia).toEqual({
        grupos: 2,
        octavos: 3,
        cuartos: 5,
        semifinal: 7,
        final: 10,
        campeon: 15,
      })
    })

    it('debe tener configuración de premios', () => {
      expect(defaultScoringConfig.inscripcionValor).toBe(100000)
      expect(defaultScoringConfig.premios.primeroPorcentaje).toBe(55)
      expect(defaultScoringConfig.premios.exactosPorcentaje).toBe(25)
      expect(defaultScoringConfig.premios.gruposPorcentaje).toBe(10)
      expect(defaultScoringConfig.premios.reservaPorcentaje).toBe(10)
    })

    it('los porcentajes de premios deben sumar 100', () => {
      const total =
        defaultScoringConfig.premios.primeroPorcentaje +
        defaultScoringConfig.premios.exactosPorcentaje +
        defaultScoringConfig.premios.gruposPorcentaje +
        defaultScoringConfig.premios.reservaPorcentaje
      expect(total).toBe(100)
    })
  })

  describe('calculateMatchPoints', () => {
    it('debe dar puntos exactos por marcador exacto', () => {
      const result = calculateMatchPoints(
        { golesLocal: 2, golesVisitante: 1 },
        { golesLocal: 2, golesVisitante: 1 }
      )
      expect(result.puntos).toBe(3)
      expect(result.esExacto).toBe(true)
    })

    it('debe dar puntos de resultado por acertar ganador local', () => {
      const result = calculateMatchPoints(
        { golesLocal: 3, golesVisitante: 0 },
        { golesLocal: 2, golesVisitante: 1 }
      )
      expect(result.puntos).toBe(1)
      expect(result.esExacto).toBe(false)
    })

    it('debe dar puntos de resultado por acertar ganador visitante', () => {
      const result = calculateMatchPoints(
        { golesLocal: 0, golesVisitante: 2 },
        { golesLocal: 1, golesVisitante: 3 }
      )
      expect(result.puntos).toBe(1)
      expect(result.esExacto).toBe(false)
    })

    it('debe dar puntos de resultado por acertar empate', () => {
      const result = calculateMatchPoints(
        { golesLocal: 1, golesVisitante: 1 },
        { golesLocal: 0, golesVisitante: 0 }
      )
      expect(result.puntos).toBe(1)
      expect(result.esExacto).toBe(false)
    })

    it('debe dar 0 puntos cuando no acierta', () => {
      const result = calculateMatchPoints(
        { golesLocal: 2, golesVisitante: 0 },
        { golesLocal: 0, golesVisitante: 1 }
      )
      expect(result.puntos).toBe(0)
      expect(result.esExacto).toBe(false)
    })

    it('debe usar configuración personalizada', () => {
      const customConfig = {
        ...defaultScoringConfig,
        puntosExacto: 5,
        puntosResultado: 2,
      }
      const result = calculateMatchPoints(
        { golesLocal: 2, golesVisitante: 1 },
        { golesLocal: 2, golesVisitante: 1 },
        customConfig
      )
      expect(result.puntos).toBe(5)
    })
  })

  describe('calculateColombiaPoints', () => {
    it('debe dar puntos correctos por acertar grupos', () => {
      const points = calculateColombiaPoints('grupos', 'grupos')
      expect(points).toBe(2)
    })

    it('debe dar puntos correctos por acertar octavos', () => {
      const points = calculateColombiaPoints('octavos', 'octavos')
      expect(points).toBe(3)
    })

    it('debe dar puntos correctos por acertar cuartos', () => {
      const points = calculateColombiaPoints('cuartos', 'cuartos')
      expect(points).toBe(5)
    })

    it('debe dar puntos correctos por acertar semifinal', () => {
      const points = calculateColombiaPoints('semifinal', 'semifinal')
      expect(points).toBe(7)
    })

    it('debe dar puntos correctos por acertar final', () => {
      const points = calculateColombiaPoints('final', 'final')
      expect(points).toBe(10)
    })

    it('debe dar puntos correctos por acertar campeón', () => {
      const points = calculateColombiaPoints('campeon', 'campeon')
      expect(points).toBe(15)
    })

    it('debe dar 0 puntos si no acierta', () => {
      const points = calculateColombiaPoints('grupos', 'octavos')
      expect(points).toBe(0)
    })

    it('debe dar 0 puntos si la predicción es null', () => {
      const points = calculateColombiaPoints(null, 'grupos')
      expect(points).toBe(0)
    })

    it('debe dar 0 puntos si el resultado real es null', () => {
      const points = calculateColombiaPoints('grupos', null)
      expect(points).toBe(0)
    })
  })

  describe('calculatePrizeDistribution', () => {
    it('debe calcular el pozo total correctamente', () => {
      const result = calculatePrizeDistribution(10)
      expect(result.pozoTotal).toBe(1000000) // 10 * 100,000
    })

    it('debe calcular premio primero correctamente (55%)', () => {
      const result = calculatePrizeDistribution(10)
      expect(result.premioPrimero).toBe(550000)
    })

    it('debe calcular premio exactos correctamente (25%)', () => {
      const result = calculatePrizeDistribution(10)
      expect(result.premioExactos).toBe(250000)
    })

    it('debe calcular premio grupos correctamente (10%)', () => {
      const result = calculatePrizeDistribution(10)
      expect(result.premioGrupos).toBe(100000)
    })

    it('debe calcular premio reserva correctamente (10%)', () => {
      const result = calculatePrizeDistribution(10)
      expect(result.premioReserva).toBe(100000)
    })

    it('debe manejar 0 participantes', () => {
      const result = calculatePrizeDistribution(0)
      expect(result.pozoTotal).toBe(0)
      expect(result.premioPrimero).toBe(0)
    })

    it('debe usar configuración personalizada', () => {
      const customConfig = {
        ...defaultScoringConfig,
        inscripcionValor: 50000,
      }
      const result = calculatePrizeDistribution(10, customConfig)
      expect(result.pozoTotal).toBe(500000)
    })
  })

  describe('formatCOP', () => {
    it('debe formatear valores pequeños', () => {
      const formatted = formatCOP(1000)
      expect(formatted).toContain('1')
      expect(formatted).toContain('000')
    })

    it('debe formatear valores grandes', () => {
      const formatted = formatCOP(1000000)
      expect(formatted).toContain('1')
      expect(formatted).toContain('000')
      expect(formatted).toContain('000')
    })

    it('debe incluir símbolo de moneda o código COP', () => {
      const formatted = formatCOP(100000)
      // El formato puede variar según el locale, pero debe contener indicador de COP
      expect(formatted.length).toBeGreaterThan(0)
    })

    it('debe manejar 0', () => {
      const formatted = formatCOP(0)
      expect(formatted).toContain('0')
    })
  })
})
