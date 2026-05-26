/**
 * Configuracion de react-i18next.
 *
 * Carga sincrona de los catalogos es/en para evitar parpadeo de las llaves
 * en el primer render (anti-Suspense). LanguageDetector lee localStorage
 * primero, luego navigator. Cuando el usuario logueado tiene preferencia,
 * AuthProvider (commit 18) sobreescribe el idioma al recibir /me.
 *
 * Uso en componentes:
 *
 *   import { useTranslation } from 'react-i18next';
 *
 *   function MyComponent() {
 *     const { t } = useTranslation();
 *     return <button>{t('common.save')}</button>;
 *   }
 */
import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import en from './en.json';
import es from './es.json';

export const SUPPORTED_LANGUAGES = ['es', 'en'] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      es: { translation: es },
      en: { translation: en },
    },
    fallbackLng: 'es',
    supportedLngs: SUPPORTED_LANGUAGES,
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'logiq-language',
    },
    interpolation: {
      escapeValue: false, // React ya escapa
    },
  });

export default i18n;
