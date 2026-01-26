'use client'

import { Header } from "@/components/header";
import { EnhancedHeroBanner } from "@/components/enhanced-hero-banner";
import { EnhancedStatsOverview } from "@/components/enhanced-stats-overview";
import { FeaturedPlayers } from "@/components/featured-players";
import { Leaderboard } from "@/components/leaderboard";
import { PredictionForm } from "@/components/prediction-form";
import { LiveResults } from "@/components/live-results";
import { MatchHighlights } from "@/components/match-highlights";
import { CommunityBanner } from "@/components/community-banner";
import { MotivationWidget } from "@/components/motivation-widget";
import { PrizesRules } from "@/components/prizes-rules";
import { GlobalParticipation } from "@/components/global-participation";
import { ParticipantsAvatars } from "@/components/participants-avatars";
import { BlurFade } from "@/components/ui/blur-fade";
import Link from "next/link";
import { useTranslation } from "@/hooks/use-translation";

export default function HomePage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
        {/* Hero Section with World Cup Image */}
        <EnhancedHeroBanner />

        {/* Stats Overview */}
        <BlurFade delay={0.1} direction="up">
          <section className="mb-8" aria-label="Resumen de estadisticas">
            <EnhancedStatsOverview />
          </section>
        </BlurFade>

        {/* Global Participation & Participants Grid */}
        <div className="mb-8 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <GlobalParticipation />
          </div>
          <div>
            <ParticipantsAvatars />
          </div>
        </div>

        {/* Featured Players & Teams */}
        <BlurFade delay={0.2} direction="up">
          <FeaturedPlayers />
        </BlurFade>

        {/* Main Content Grid */}
        <div className="mb-8 grid gap-6 lg:grid-cols-3">
          {/* Left Column - Leaderboard + Motivation */}
          <section 
            id="clasificacion"
            className="lg:col-span-2 space-y-6" 
            aria-label="Tabla de clasificacion"
          >
            <BlurFade delay={0.3} direction="right">
              <Leaderboard />
            </BlurFade>
            <BlurFade delay={0.4} direction="right">
              <MotivationWidget />
            </BlurFade>
          </section>

          {/* Right Column - Predictions & Results */}
          <aside className="space-y-6">
            <BlurFade delay={0.3} direction="left">
              <section aria-label="Formulario de predicciones">
                <PredictionForm />
              </section>
            </BlurFade>
            <BlurFade delay={0.4} direction="left">
              <section aria-label="Resultados en vivo">
                <LiveResults />
              </section>
            </BlurFade>
          </aside>
        </div>

        {/* Prizes and Rules Section */}
        <BlurFade delay={0.5} direction="up">
          <section className="mb-8" aria-label="Premios y reglas">
            <PrizesRules />
          </section>
        </BlurFade>

        {/* Match Highlights Gallery */}
        <BlurFade delay={0.6} direction="up">
          <MatchHighlights />
        </BlurFade>

        {/* Community Banner */}
        <BlurFade delay={0.7} direction="up">
          <CommunityBanner />
        </BlurFade>

        {/* Footer */}
        <BlurFade delay={0.8} direction="up">
          <footer className="mt-12 border-t border-border pt-8 pb-8">
            <div className="flex flex-col gap-6">
              {/* Links de navegación */}
              <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                <p className="text-sm text-muted-foreground">Mundial Predict - Copa del Mundo 2026</p>
                <nav aria-label="Enlaces del footer">
                  <ul className="flex flex-wrap gap-6 justify-center">
                    <li>
                      <Link
                        href="/reglas"
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {t('nav.rules')}
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/reglas#premios"
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {t('nav.prizes')}
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/contacto"
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {t('nav.contact')}
                      </Link>
                    </li>
                  </ul>
                </nav>
              </div>
              
              {/* Información legal */}
              <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
                <p className="text-xs text-muted-foreground text-center sm:text-left">
                  © 2026 Mundial Predict. Todos los derechos reservados.
                </p>
                <nav aria-label="Enlaces legales" className="flex flex-wrap gap-4 justify-center text-xs">
                  <Link
                    href="/privacidad"
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Política de Privacidad
                  </Link>
                  <span className="text-muted-foreground">|</span>
                  <Link
                    href="/terminos"
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Términos y Condiciones
                  </Link>
                </nav>
              </div>
            </div>
          </footer>
        </BlurFade>
      </main>
    </div>
  );
}
