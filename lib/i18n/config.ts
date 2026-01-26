export type Locale = 'es' | 'en'

export const defaultLocale: Locale = 'es'
export const locales: Locale[] = ['es', 'en']

export const localeNames: Record<Locale, string> = {
  es: 'Español',
  en: 'English',
}
