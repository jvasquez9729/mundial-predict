'use client'

import { useLocale } from '@/contexts/locale-context'
import { t as tFunction, type Translations } from '@/lib/i18n/translations'
import { getTranslations } from '@/lib/i18n/translations'

export function useTranslation() {
  const { locale } = useLocale()
  const translations = getTranslations(locale)

  const t = (key: string, params?: Record<string, string | number>): string => {
    return tFunction(key, locale, params)
  }

  return {
    t,
    locale,
    translations,
  }
}
