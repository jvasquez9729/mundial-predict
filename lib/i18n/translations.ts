import type { Locale } from './config'

// Utility type para convertir literales a strings en estructuras anidadas
type DeepStringify<T> = T extends string
  ? string
  : T extends object
    ? { [K in keyof T]: DeepStringify<T[K]> }
    : T

export type Translations = DeepStringify<typeof translations.es>

export const translations = {
  es: {
    common: {
      loading: 'Cargando...',
      error: 'Error',
      success: 'Éxito',
      save: 'Guardar',
      cancel: 'Cancelar',
      delete: 'Eliminar',
      edit: 'Editar',
      back: 'Volver',
      next: 'Siguiente',
      previous: 'Anterior',
      search: 'Buscar',
      filter: 'Filtrar',
      close: 'Cerrar',
      open: 'Abrir',
      submit: 'Enviar',
      retry: 'Reintentar',
      markAllRead: 'Marcar todas como leídas',
    },
    nav: {
      home: 'Inicio',
      dashboard: 'Dashboard',
      predictions: 'Predicciones',
      leaderboard: 'Clasificación',
      results: 'Resultados',
      rules: 'Reglas',
      login: 'Iniciar Sesión',
      logout: 'Salir',
      register: 'Registrarse',
      profile: 'Perfil',
      user: 'Usuario',
      notifications: 'Notificaciones',
      noNotifications: 'No tienes notificaciones',
      viewAllNotifications: 'Ver todas',
      myPredictions: 'Mis Predicciones',
      settings: 'Configuración',
      prizes: 'Premios',
      contact: 'Contacto',
    },
    dashboard: {
      welcome: 'Hola, {name}',
      welcomeBack: 'Bienvenido a tu panel de predicciones',
      yourPosition: 'Tu Posición',
      points: 'Puntos',
      accumulated: 'acumulados',
      exact: 'Exactos',
      markers: 'marcadores',
      predictions: 'Predicciones',
      made: 'realizadas',
      upcomingMatches: 'Próximos Partidos',
      seeAll: 'Ver todos',
      noUpcomingMatches: 'No hay partidos próximos',
      quickActions: 'Acciones Rápidas',
      makePredictions: 'Hacer Predicciones',
      makePredictionsDesc: 'Predice los próximos partidos',
      viewLeaderboard: 'Ver Clasificación',
      viewLeaderboardDesc: 'Revisa el leaderboard',
      dailyTip: 'Consejo del día',
      dailyTipText: 'Recuerda que las predicciones cierran 1 hora antes de cada partido. ¡No te quedes sin participar!',
      of: 'de',
    },
    leaderboard: {
      title: 'Clasificación en Vivo',
      updated: 'Actualizado: {time}',
      position: 'Pos',
      player: 'Jugador',
      predictions: 'Pred',
      exact: 'Exactas',
      points: 'Puntos',
      accuracy: 'Precisión',
      hits: 'aciertos',
      noParticipants: 'No hay participantes aún',
      yourPosition: 'Tu Posición',
      topTen: 'Top 10',
      seeFullRanking: 'Ver Ranking Completo',
    },
    predictions: {
      title: 'Haz tu Predicción',
      availableMatches: '{count} partidos disponibles',
      noMatches: 'No hay partidos disponibles para predecir en este momento',
      sendPrediction: 'Enviar Predicción',
      predictionSent: 'Predicción Enviada',
      predictionsClosed: 'Predicciones Cerradas',
      sending: 'Enviando...',
      previousMatch: 'Partido anterior',
      nextMatch: 'Siguiente partido',
      goToMatch: 'Ir al partido {index}',
      closed: 'Predicciones cerradas para este partido',
      stadium: 'Estadio',
      date: 'Fecha',
      phase: 'Fase',
      sent: 'Enviadas',
      correct: 'Acertadas',
      accuracy: 'Precisión',
    },
    matches: {
      vs: 'vs',
      phase: 'Fase',
      stadium: 'Estadio',
      date: 'Fecha',
      time: 'Hora',
      closed: 'Cerrado',
      open: 'Abierto',
      noPrediction: 'Sin predicción',
      yourPrediction: 'Tu Predicción',
    },
  },
  en: {
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      search: 'Search',
      filter: 'Filter',
      close: 'Close',
      open: 'Open',
      submit: 'Submit',
      retry: 'Retry',
      markAllRead: 'Mark all as read',
    },
    nav: {
      home: 'Home',
      dashboard: 'Dashboard',
      predictions: 'Predictions',
      leaderboard: 'Leaderboard',
      results: 'Results',
      rules: 'Rules',
      login: 'Login',
      logout: 'Logout',
      register: 'Register',
      profile: 'Profile',
      user: 'User',
      notifications: 'Notifications',
      noNotifications: 'You have no notifications',
      viewAllNotifications: 'View all',
      myPredictions: 'My Predictions',
      settings: 'Settings',
      prizes: 'Prizes',
      contact: 'Contact',
    },
    dashboard: {
      welcome: 'Hello, {name}',
      welcomeBack: 'Welcome to your predictions panel',
      yourPosition: 'Your Position',
      points: 'Points',
      accumulated: 'accumulated',
      exact: 'Exact',
      markers: 'markers',
      predictions: 'Predictions',
      made: 'made',
      upcomingMatches: 'Upcoming Matches',
      seeAll: 'See all',
      noUpcomingMatches: 'No upcoming matches',
      quickActions: 'Quick Actions',
      makePredictions: 'Make Predictions',
      makePredictionsDesc: 'Predict the next matches',
      viewLeaderboard: 'View Leaderboard',
      viewLeaderboardDesc: 'Check the leaderboard',
      dailyTip: 'Daily Tip',
      dailyTipText: 'Remember that predictions close 1 hour before each match. Don\'t miss out!',
      of: 'of',
    },
    leaderboard: {
      title: 'Live Leaderboard',
      updated: 'Updated: {time}',
      position: 'Pos',
      player: 'Player',
      predictions: 'Pred',
      exact: 'Exact',
      points: 'Points',
      accuracy: 'Accuracy',
      hits: 'hits',
      noParticipants: 'No participants yet',
      yourPosition: 'Your Position',
      topTen: 'Top 10',
      seeFullRanking: 'See Full Ranking',
    },
    predictions: {
      title: 'Make Your Prediction',
      availableMatches: '{count} matches available',
      noMatches: 'No matches available to predict at this time',
      sendPrediction: 'Send Prediction',
      predictionSent: 'Prediction Sent',
      predictionsClosed: 'Predictions Closed',
      sending: 'Sending...',
      previousMatch: 'Previous match',
      nextMatch: 'Next match',
      goToMatch: 'Go to match {index}',
      closed: 'Predictions closed for this match',
      stadium: 'Stadium',
      date: 'Date',
      phase: 'Phase',
      sent: 'Sent',
      correct: 'Correct',
      accuracy: 'Accuracy',
    },
    matches: {
      vs: 'vs',
      phase: 'Phase',
      stadium: 'Stadium',
      date: 'Date',
      time: 'Time',
      closed: 'Closed',
      open: 'Open',
      noPrediction: 'No prediction',
      yourPrediction: 'Your Prediction',
    },
  },
} as const

export function getTranslations(locale: Locale): Translations {
  return translations[locale] || translations.es
}

export function t(key: string, locale: Locale = 'es', params?: Record<string, string | number>): string {
  const keys = key.split('.')
  let value: any = translations[locale] || translations.es

  for (const k of keys) {
    value = value?.[k]
    if (!value) {
      // Fallback to Spanish if key not found
      value = translations.es
      for (const k2 of keys) {
        value = value?.[k2]
      }
      break
    }
  }

  if (typeof value !== 'string') {
    return key
  }

  // Replace placeholders
  if (params) {
    return value.replace(/\{(\w+)\}/g, (_, paramKey) => {
      return String(params[paramKey] ?? `{${paramKey}}`)
    })
  }

  return value
}
