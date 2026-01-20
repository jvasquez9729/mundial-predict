'use client'

import { Badge } from '@/components/ui/badge'
import { Clock, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MatchCardProps {
  match: {
    id: string
    fecha_hora: string
    estadio: string
    fase: string
    predicciones_cerradas: boolean
    equipo_local: {
      nombre: string
      codigo: string
      bandera_url?: string
    }
    equipo_visitante: {
      nombre: string
      codigo: string
      bandera_url?: string
    }
    mi_prediccion?: {
      goles_local: number
      goles_visitante: number
    } | null
  }
}

const faseLabels: Record<string, string> = {
  grupos: 'Fase de Grupos',
  octavos: 'Octavos',
  cuartos: 'Cuartos',
  semifinal: 'Semifinal',
  tercer_puesto: '3er Puesto',
  final: 'Final',
}

const codeToFlag: Record<string, string> = {
  ARG: '🇦🇷', BRA: '🇧🇷', MEX: '🇲🇽', USA: '🇺🇸', COL: '🇨🇴',
  GER: '🇩🇪', FRA: '🇫🇷', ESP: '🇪🇸', ENG: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', ITA: '🇮🇹',
  POR: '🇵🇹', NED: '🇳🇱', BEL: '🇧🇪', CRO: '🇭🇷', URU: '🇺🇾',
  JPN: '🇯🇵', KOR: '🇰🇷', AUS: '🇦🇺', SEN: '🇸🇳', MAR: '🇲🇦',
  GHA: '🇬🇭', CAM: '🇨🇲', NGA: '🇳🇬', TUN: '🇹🇳', EGY: '🇪🇬',
  KSA: '🇸🇦', QAT: '🇶🇦', IRN: '🇮🇷', CAN: '🇨🇦', CRC: '🇨🇷',
  ECU: '🇪🇨', CHI: '🇨🇱', PER: '🇵🇪', PAR: '🇵🇾', VEN: '🇻🇪',
  SUI: '🇨🇭', DEN: '🇩🇰', SWE: '🇸🇪', NOR: '🇳🇴', POL: '🇵🇱',
}

function getFlag(codigo: string): string {
  return codeToFlag[codigo] || '🏳️'
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getTimeUntil(dateStr: string): string {
  const diff = new Date(dateStr).getTime() - Date.now()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}d ${hours % 24}h`
  if (hours > 0) return `${hours}h`
  return 'Pronto'
}

export function MatchCard({ match }: MatchCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card p-4 transition-all hover:shadow-lg hover:border-primary/20',
        match.predicciones_cerradas && 'opacity-75'
      )}
    >
      {/* Header with Phase and Time */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <Badge variant="secondary" className="text-xs font-medium">
          {faseLabels[match.fase] || match.fase}
        </Badge>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{getTimeUntil(match.fecha_hora)}</span>
        </div>
      </div>

      {/* Teams */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex flex-1 items-center gap-3">
          <span className="text-3xl" role="img" aria-label={match.equipo_local.nombre}>
            {getFlag(match.equipo_local.codigo)}
          </span>
          <div className="flex-1">
            <p className="font-semibold text-foreground">{match.equipo_local.nombre}</p>
            <p className="text-xs text-muted-foreground">{match.equipo_local.codigo}</p>
          </div>
        </div>

        {match.mi_prediccion && (
          <div className="mx-4 flex items-center gap-2">
            <span className="text-lg font-bold text-foreground">
              {match.mi_prediccion.goles_local}
            </span>
            <span className="text-muted-foreground">-</span>
            <span className="text-lg font-bold text-foreground">
              {match.mi_prediccion.goles_visitante}
            </span>
          </div>
        )}

        <div className="flex flex-1 items-center gap-3 justify-end">
          <div className="flex-1 text-right">
            <p className="font-semibold text-foreground">{match.equipo_visitante.nombre}</p>
            <p className="text-xs text-muted-foreground">{match.equipo_visitante.codigo}</p>
          </div>
          <span className="text-3xl" role="img" aria-label={match.equipo_visitante.nombre}>
            {getFlag(match.equipo_visitante.codigo)}
          </span>
        </div>
      </div>

      {/* Footer with Date and Stadium */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3 text-xs">
        <div className="flex items-center gap-1 text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{formatDate(match.fecha_hora)}</span>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <MapPin className="h-3 w-3" />
          <span>{match.estadio}</span>
        </div>
        {match.predicciones_cerradas && (
          <Badge variant="outline" className="border-destructive text-destructive text-xs">
            Cerrado
          </Badge>
        )}
        {!match.mi_prediccion && !match.predicciones_cerradas && (
          <Badge variant="outline" className="border-primary text-primary text-xs">
            Sin predicción
          </Badge>
        )}
        {match.mi_prediccion && (
          <Badge className="bg-success/20 text-success text-xs">
            Predicción enviada
          </Badge>
        )}
      </div>
    </div>
  )
}
