# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

## [Unreleased] - 2026-01-18

### 🔒 Seguridad HTTPS/SSL/TLS

- ✅ **Headers de seguridad HTTPS implementados**
  - HSTS (HTTP Strict Transport Security) con 1 año de validez
  - X-Frame-Options para prevenir clickjacking
  - X-Content-Type-Options para prevenir MIME sniffing
  - X-XSS-Protection para protección contra XSS
  - Referrer-Policy para controlar información de referrer
  - Permissions-Policy para controlar características del navegador
  - Content-Security-Policy (CSP) con configuración segura
  - Upgrade-Insecure-Requests para forzar HTTPS

- ✅ **Redirección automática HTTP → HTTPS**
  - Middleware actualizado para redirigir HTTP a HTTPS en producción
  - Integrado con el middleware de autenticación existente
  - Verifica header `x-forwarded-proto` para detectar HTTP

- ✅ **Documentación completa de HTTPS**
  - Guía para configuración en Vercel (automático)
  - Guía para configuración en otros hostings (Let's Encrypt)
  - Guía para desarrollo local con HTTPS (mkcert)
  - Instrucciones de verificación y solución de problemas

## [Unreleased] - 2026-01-18 (Anterior)

### 🔴 Crítico - Corregido

- ✅ **Removido `ignoreBuildErrors: true`** del `next.config.mjs`
  - Ahora los errores de TypeScript se detectarán en build
  - Mejora la calidad y seguridad del código

- ✅ **Validación de variables de entorno**
  - Creado `lib/config/env.ts` con validación con Zod
  - La aplicación fallará al iniciar si faltan variables críticas
  - Mejora la experiencia de desarrollo y despliegue

- ✅ **Eliminado secret hardcodeado**
  - Removido fallback inseguro de `JWT_SECRET` en `proxy.ts` y `session.ts`
  - Ahora usa `getJwtSecret()` que valida que el secret esté configurado
  - Mejora significativa de seguridad

### 🟡 Importante - Mejorado

- ✅ **Sistema de logging estructurado**
  - Creado `lib/utils/logger.ts` con logging estructurado
  - Reemplaza `console.log/error` en rutas API críticas
  - Formato JSON en producción, legible en desarrollo
  - Preparado para integración con servicios de logging (Sentry, etc.)

- ✅ **Manejo centralizado de errores**
  - Creado `lib/utils/api-error.ts` con `handleApiError()`
  - Manejo consistente de errores en todas las API routes
  - Soporte para errores de autenticación, validación Zod, y errores personalizados

- ✅ **Rate limiting**
  - Creado `lib/utils/rate-limit.ts`
  - Implementado rate limiting en `/api/auth/login` (5 intentos/15min)
  - Protección contra fuerza bruta

- ✅ **Configuración CORS**
  - Agregado headers CORS en `next.config.mjs`
  - Configuración explícita para APIs

### 🟢 Mejoras

- ✅ **Cambiado `lang="en"` a `lang="es"`** en `app/layout.tsx`
  - Mejora accesibilidad y SEO para contenido en español

- ✅ **Schemas de validación centralizados**
  - `predictionSchema` ahora se importa desde `lib/auth/validation.ts`
  - Evita duplicación de código en `app/api/predictions/route.ts`

- ✅ **Paginación mejorada**
  - Agregado soporte para `limit` en `/api/matches`
  - Preparado para expansión futura

- ✅ **Caché HTTP**
  - Agregado headers de caché en `/api/teams` (datos estáticos)
  - `Cache-Control: public, s-maxage=3600, stale-while-revalidate=86400`

- ✅ **Documentación**
  - Creado `README.md` completo con instrucciones de instalación
  - Creado `.env.example` con todas las variables documentadas

### 📝 Archivos Creados

- `lib/config/env.ts` - Validación de variables de entorno
- `lib/utils/logger.ts` - Sistema de logging estructurado
- `lib/utils/api-error.ts` - Manejo centralizado de errores
- `lib/utils/rate-limit.ts` - Rate limiting
- `.env.example` - Template de variables de entorno
- `README.md` - Documentación del proyecto
- `CHANGELOG.md` - Este archivo

### 🔄 Archivos Modificados

- `next.config.mjs` - Removido ignoreBuildErrors, agregado CORS
- `app/layout.tsx` - Cambiado lang a "es"
- `lib/supabase/proxy.ts` - Usa `getJwtSecret()` en lugar de fallback
- `lib/auth/session.ts` - Usa `getJwtSecret()` en lugar de fallback
- `app/api/auth/login/route.ts` - Rate limiting y nuevo error handling
- `app/api/predictions/route.ts` - Logger, error handling, schema centralizado
- `app/api/matches/route.ts` - Logger, error handling, paginación
- `app/api/teams/route.ts` - Logger, error handling, caché HTTP
- `app/api/leaderboard/route.ts` - Logger, error handling
- `app/dashboard/page.tsx` - Logger condicional

### 🚀 Próximos Pasos Recomendados

- [ ] Agregar tests unitarios e integración
- [ ] Implementar logging externo (Sentry/Datadog)
- [ ] Agregar rate limiting en más rutas críticas
- [ ] Implementar Redis para rate limiting en producción
- [ ] Agregar monitoreo y alertas
- [ ] Implementar CI/CD pipeline
- [ ] Agregar más documentación de API (OpenAPI/Swagger)
