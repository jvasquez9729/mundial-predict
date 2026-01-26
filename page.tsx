import { Header } from "@/components/header";
import { HeroBanner } from "@/components/hero-banner";
import { StatsOverview } from "@/components/stats-overview";
import { FeaturedPlayers } from "@/components/featured-players";
import { Leaderboard } from "@/components/leaderboard";
import { PredictionForm } from "@/components/prediction-form";
import { LiveResults } from "@/components/live-results";
import { MatchHighlights } from "@/components/match-highlights";
import { CommunityBanner } from "@/components/community-banner";
import { MotivationWidget } from "@/components/motivation-widget";
import { PrizesRules } from "@/components/prizes-rules";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
        {/* Hero Section with World Cup Image */}
        <HeroBanner />

        {/* Stats Overview */}
        <section className="mb-8" aria-label="Resumen de estadisticas">
          <StatsOverview />
        </section>

        {/* Featured Players & Teams */}
        <FeaturedPlayers />

        {/* Main Content Grid */}
        <div className="mb-8 grid gap-6 lg:grid-cols-3">
          {/* Left Column - Leaderboard + Motivation */}
          <section className="lg:col-span-2 space-y-6" aria-label="Tabla de clasificacion">
            <Leaderboard />
            <MotivationWidget />
          </section>

          {/* Right Column - Predictions & Results */}
          <aside className="space-y-6">
            <section aria-label="Formulario de predicciones">
              <PredictionForm />
            </section>
            <section aria-label="Resultados en vivo">
              <LiveResults />
            </section>
          </aside>
        </div>

        {/* Prizes and Rules Section */}
        <section className="mb-8" aria-label="Premios y reglas">
          <PrizesRules />
        </section>

        {/* Match Highlights Gallery */}
        <MatchHighlights />

        {/* Community Banner */}
        <CommunityBanner />

        {/* Footer */}
        <footer className="mt-12 border-t border-border pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-muted-foreground">Mundial Predict - Copa del Mundo 2026</p>
            <nav aria-label="Enlaces del footer">
              <ul className="flex gap-6">
                <li>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Reglas
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Premios
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Contacto
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </footer>
      </main>
    </div>
  );
}
