'use client'

import { Globe } from '@/components/ui/globe'
import { BlurFade } from '@/components/ui/blur-fade'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Globe as GlobeIcon } from 'lucide-react'
import { useTranslation } from '@/hooks/use-translation'
import type { COBEOptions } from 'cobe'

// Países participantes con sus coordenadas (48 equipos principales)
const worldCupCountries: { location: [number, number]; size: number }[] = [
  { location: [-34.6037, -58.3816], size: 0.1 }, // Argentina
  { location: [-23.5505, -46.6333], size: 0.12 }, // Brasil
  { location: [4.7110, -74.0721], size: 0.08 }, // Colombia
  { location: [40.7128, -74.0060], size: 0.1 }, // Estados Unidos (NYC)
  { location: [19.4326, -99.1332], size: 0.1 }, // México
  { location: [45.5017, -73.5673], size: 0.08 }, // Canadá (Montreal)
  { location: [48.8566, 2.3522], size: 0.1 }, // Francia
  { location: [40.4168, -3.7038], size: 0.1 }, // España
  { location: [52.5200, 13.4050], size: 0.1 }, // Alemania
  { location: [41.9028, 12.4964], size: 0.1 }, // Italia
  { location: [38.7223, -9.1393], size: 0.08 }, // Portugal
  { location: [52.3676, 4.9041], size: 0.08 }, // Países Bajos
  { location: [51.5074, -0.1278], size: 0.1 }, // Inglaterra
  { location: [50.8503, 4.3517], size: 0.08 }, // Bélgica
  { location: [45.8150, 15.9819], size: 0.08 }, // Croacia
  { location: [-34.9011, -56.1645], size: 0.08 }, // Uruguay
  { location: [-33.4489, -70.6693], size: 0.08 }, // Chile
  { location: [-12.0464, -77.0428], size: 0.08 }, // Perú
  { location: [-0.1807, -78.4678], size: 0.08 }, // Ecuador
  { location: [35.6762, 139.6503], size: 0.1 }, // Japón
  { location: [37.5665, 126.9780], size: 0.1 }, // Corea del Sur
  { location: [24.7136, 46.6753], size: 0.08 }, // Arabia Saudí
  { location: [35.6892, 51.3890], size: 0.08 }, // Irán
  { location: [-33.8688, 151.2093], size: 0.08 }, // Australia
  { location: [-36.8485, 174.7633], size: 0.06 }, // Nueva Zelanda
  { location: [33.5731, -7.5898], size: 0.08 }, // Marruecos
  { location: [14.7167, -17.4677], size: 0.08 }, // Senegal
  { location: [5.6037, -0.1870], size: 0.08 }, // Ghana
  { location: [6.5244, 3.3792], size: 0.08 }, // Nigeria
  { location: [30.0444, 31.2357], size: 0.08 }, // Egipto
]

const globeConfig: COBEOptions = {
  width: 320,
  height: 320,
  onRender: () => {},
  devicePixelRatio: 2,
  phi: 0,
  theta: 0.3,
  dark: 1, // Dark mode
  diffuse: 1.2,
  mapSamples: 16000,
  mapBrightness: 6,
  baseColor: [0.2, 0.2, 0.2],
  markerColor: [0.98, 0.4, 0.08], // Color naranja/amarillo para los marcadores
  glowColor: [1, 0.5, 0.2],
  markers: worldCupCountries,
}

export function GlobalParticipation() {
  const { t } = useTranslation()

  return (
    <BlurFade delay={0.3} direction="up">
      <Card className="border-border bg-card overflow-hidden">
        <CardHeader>
          <div className="flex items-center gap-2">
            <GlobeIcon className="h-5 w-5 text-primary" />
            <CardTitle>Participación Global</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            48 países compitiendo desde alrededor del mundo
          </p>
        </CardHeader>
        <CardContent>
          <div className="relative h-[400px] w-full overflow-hidden rounded-lg bg-gradient-to-br from-muted/20 to-muted/10">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative flex items-center justify-center" style={{ width: '320px', height: '320px', maxWidth: '80%', maxHeight: '80%' }}>
                <Globe className="w-full h-full" config={globeConfig} />
              </div>
            </div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 rounded-full bg-background/90 border border-border px-4 py-2 backdrop-blur-sm shadow-lg">
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-primary" />
                <span className="font-medium">1,234+ participantes</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </BlurFade>
  )
}
