'use client'

import { Marquee } from '@/components/ui/marquee'
import { BlurFade } from '@/components/ui/blur-fade'

// Lista de países participantes del Mundial 2026 (48 equipos)
const countries = [
  '🇦🇷 Argentina', '🇧🇷 Brasil', '🇨🇴 Colombia', '🇺🇸 Estados Unidos',
  '🇲🇽 México', '🇨🇦 Canadá', '🇫🇷 Francia', '🇪🇸 España',
  '🇩🇪 Alemania', '🇮🇹 Italia', '🇵🇹 Portugal', '🇳🇱 Países Bajos',
  '🇬🇧 Inglaterra', '🇧🇪 Bélgica', '🇭🇷 Croacia', '🇺🇾 Uruguay',
  '🇨🇱 Chile', '🇵🇪 Perú', '🇪🇨 Ecuador', '🇯🇵 Japón',
  '🇰🇷 Corea del Sur', '🇸🇦 Arabia Saudí', '🇮🇷 Irán', '🇦🇺 Australia',
  '🇳🇿 Nueva Zelanda', '🇲🇦 Marruecos', '🇸🇳 Senegal', '🇬🇭 Ghana',
  '🇳🇬 Nigeria', '🇪🇬 Egipto', '🇹🇳 Túnez', '🇨🇲 Camerún',
  '🇿🇦 Sudáfrica', '🇬🇼 Guinea', '🇦🇱 Albania', '🇨🇭 Suiza',
  '🇸🇪 Suecia', '🇳🇴 Noruega', '🇩🇰 Dinamarca', '🇵🇱 Polonia',
  '🇷🇸 Serbia', '🇹🇷 Turquía', '🇬🇷 Grecia', '🇷🇺 Rusia',
  '🇺🇦 Ucrania', '🇨🇿 República Checa', '🇦🇹 Austria', '🇭🇺 Hungría',
]

export function CountriesMarquee() {
  return (
    <BlurFade delay={0.2} direction="up">
      <div className="relative overflow-hidden bg-transparent">
        <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background z-10 pointer-events-none" />
        <Marquee pauseOnHover className="[--duration:60s] py-2">
          {countries.map((country, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors whitespace-nowrap mx-1"
            >
              <span className="text-lg sm:text-xl">{country}</span>
            </div>
          ))}
        </Marquee>
      </div>
    </BlurFade>
  )
}
