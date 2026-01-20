'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Flame, Calendar, MapPin, Clock, Loader2 } from 'lucide-react'
import { BlurFade } from '@/components/ui/blur-fade'
import { useTranslation } from '@/hooks/use-translation'

interface Team {
  id: string
  nombre: string
  codigo: string
  bandera_url?: string
}

interface FeaturedMatch {
  id: string
  fase: string
  fecha_hora: string
  estadio: string
  goles_local: number | null
  goles_visitante: number | null
  estado: string
  equipo_local: Team
  equipo_visitante: Team
}

const faseLabels: Record<string, string> = {
  grupos: 'Fase de Grupos',
  octavos: 'Octavos de Final',
  cuartos: 'Cuartos de Final',
  semifinal: 'Semifinal',
  tercer_puesto: 'Tercer Puesto',
  final: 'Final',
}

function codeToFlag(code: string): string {
  const flagMap: Record<string, string> = {
    'AR': '🇦🇷', 'BR': '🇧🇷', 'CO': '🇨🇴', 'US': '🇺🇸', 'MX': '🇲🇽', 'CA': '🇨🇦',
    'FR': '🇫🇷', 'ES': '🇪🇸', 'DE': '🇩🇪', 'IT': '🇮🇹', 'PT': '🇵🇹', 'NL': '🇳🇱',
    'GB': '🇬🇧', 'BE': '🇧🇪', 'HR': '🇭🇷', 'UY': '🇺🇾', 'CL': '🇨🇱', 'PE': '🇵🇪',
    'EC': '🇪🇨', 'JP': '🇯🇵', 'KR': '🇰🇷', 'SA': '🇸🇦', 'IR': '🇮🇷', 'AU': '🇦🇺',
    'NZ': '🇳🇿', 'MA': '🇲🇦', 'SN': '🇸🇳', 'GH': '🇬🇭', 'NG': '🇳🇬', 'EG': '🇪🇬',
  }
  return flagMap[code.toUpperCase()] || '🏴'
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('es-ES', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleTimeString('es-ES', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

export function FeaturedMatch() {
  const { t } = useTranslation()
  const [match, setMatch] = useState<FeaturedMatch | null>(null)
  const [loading, setLoading] = useState(true)
  const [isLive, setIsLive] = useState(false)

  useEffect(() => {
    async function fetchFeaturedMatch() {
      try {
        const res = await fetch('/api/matches/featured')
        const data = await res.json()

        if (data.success && data.match) {
          setMatch(data.match)
          setIsLive(data.isLive || false)
        }
      } catch (error) {
        console.error('Error fetching featured match:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedMatch()

    // Refrescar cada 5 minutos para partidos en vivo
    const interval = setInterval(fetchFeaturedMatch, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <BlurFade delay={0.2} direction="up">
        <Card className="overflow-hidden border-border bg-card">
          <div className="relative h-48 sm:h-56 lg:h-auto lg:min-h-[280px] flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </Card>
      </BlurFade>
    )
  }

  if (!match) {
    return null
  }

  // Generar imagen basada en los equipos para que sea única por partido
  const matchImage = `/images/matches/${match.equipo_local.codigo.toLowerCase()}-vs-${match.equipo_visitante.codigo.toLowerCase()}.jpg`
  const fallbackImage = '/images/mundial-2026.png'

  return (
    <BlurFade delay={0.2} direction="up">
      <Link href={`/predicciones?match=${match.id}`}>
        <Card className="group cursor-pointer overflow-hidden border-border bg-card transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
          <div className="relative h-48 sm:h-56 lg:h-auto lg:min-h-[320px]">
            <Image
              src={matchImage}
              alt={`${match.equipo_local.nombre} vs ${match.equipo_visitante.nombre}`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                // Si la imagen del partido no existe, usar la imagen por defecto
                const target = e.target as HTMLImageElement
                if (target.src !== fallbackImage) {
                  target.src = fallbackImage
                }
              }}
              fallback={fallbackImage}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent lg:bg-gradient-to-r" />
            
            {/* Badge de estado */}
            <div className="absolute top-3 left-3">
              <Badge
                className={`gap-1 ${
                  isLive
                    ? 'bg-destructive text-destructive-foreground animate-pulse'
                    : match.estado === 'finished' || match.estado === 'finalizado'
                    ? 'bg-muted text-muted-foreground'
                    : 'bg-primary text-primary-foreground'
                }`}
              >
                <Flame className="h-3 w-3" />
                {isLive ? 'EN VIVO' : match.estado === 'finalizado' ? 'FINALIZADO' : 'PRÓXIMO'}
              </Badge>
            </div>

            {/* Información del partido */}
            <div className="absolute bottom-0 left-0 right-0 p-4 lg:p-6">
              <div className="mb-2">
                <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
                  {faseLabels[match.fase] || match.fase}
                </Badge>
              </div>
              
              <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(match.fecha_hora)}</span>
                <Clock className="h-4 w-4 ml-2" />
                <span>{formatTime(match.fecha_hora)}</span>
              </div>

              <div className="mb-2 flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-3xl">{codeToFlag(match.equipo_local.codigo)}</span>
                  <span className="text-lg font-bold text-foreground">{match.equipo_local.nombre}</span>
                  {match.goles_local !== null && (
                    <span className="text-2xl font-bold text-primary">{match.goles_local}</span>
                  )}
                </div>
                <span className="text-xl text-muted-foreground">vs</span>
                <div className="flex items-center gap-2">
                  {match.goles_visitante !== null && (
                    <span className="text-2xl font-bold text-primary">{match.goles_visitante}</span>
                  )}
                  <span className="text-lg font-bold text-foreground">{match.equipo_visitante.nombre}</span>
                  <span className="text-3xl">{codeToFlag(match.equipo_visitante.codigo)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span>{match.estadio}</span>
              </div>
            </div>
          </div>
        </Card>
      </Link>
    </BlurFade>
  )
}
