'use client'

import { Header } from '@/components/header'
import { Leaderboard } from '@/components/leaderboard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy } from 'lucide-react'
import { useTranslation } from '@/hooks/use-translation'

export default function ClasificacionPage() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {t('nav.leaderboard')}
          </h1>
          <p className="text-muted-foreground">
            Clasificación en tiempo real de todos los participantes
          </p>
        </div>

        <Leaderboard />
      </main>
    </div>
  )
}
