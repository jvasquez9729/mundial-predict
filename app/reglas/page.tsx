'use client'

import { Header } from '@/components/header'
import { PrizesRules } from '@/components/prizes-rules'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Trophy } from 'lucide-react'
import { useTranslation } from '@/hooks/use-translation'

export default function ReglasPage() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {t('nav.rules')}
              </h1>
              <p className="text-muted-foreground">
                Reglas y premios del juego de predicciones
              </p>
            </div>
          </div>
        </div>

        <PrizesRules />
      </main>
    </div>
  )
}
