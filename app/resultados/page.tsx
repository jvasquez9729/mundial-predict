'use client'

import { Header } from '@/components/header'
import { LiveResults } from '@/components/live-results'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MatchHighlights } from '@/components/match-highlights'
import { Trophy, Calendar } from 'lucide-react'
import { useTranslation } from '@/hooks/use-translation'

export default function ResultadosPage() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {t('nav.results')}
          </h1>
          <p className="text-muted-foreground">
            Resultados de los partidos del Mundial 2026
          </p>
        </div>

        <div className="space-y-6">
          <LiveResults />
          <MatchHighlights />
        </div>
      </main>
    </div>
  )
}
