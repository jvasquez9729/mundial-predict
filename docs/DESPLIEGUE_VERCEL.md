# Guía de Despliegue en Vercel

Esta guía te ayudará a desplegar tu aplicación Mundial Predict en Vercel.

## Prerrequisitos

1. ✅ Código subido a GitHub (ya completado)
2. ✅ Cuenta de Vercel (crear en https://vercel.com si no tienes)
3. ✅ Variables de entorno listas

## Pasos para Desplegar

### 1. Conectar Repositorio con Vercel

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Haz clic en **"Add New..."** → **"Project"**
3. Selecciona **"Import Git Repository"**
4. Conecta tu cuenta de GitHub si no lo has hecho
5. Busca y selecciona el repositorio: `jvasquez9729/mundial-predict`
6. Haz clic en **"Import"**

### 2. Configurar el Proyecto

1. **Framework Preset**: Vercel detectará automáticamente Next.js
2. **Root Directory**: Dejar en blanco (raíz del proyecto)
3. **Build Command**: `npm run build` (automático)
4. **Output Directory**: `.next` (automático)
5. **Install Command**: `npm install` (automático)

### 3. Configurar Variables de Entorno

En la sección **"Environment Variables"**, agrega todas las variables necesarias:

#### Variables Obligatorias

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_de_supabase
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_de_supabase

# JWT
JWT_SECRET=tu_jwt_secret_muy_seguro

# App URL (se actualizará automáticamente después del primer deploy)
NEXT_PUBLIC_APP_URL=https://tu-proyecto.vercel.app
```

#### Variables Opcionales

```bash
# Email (Resend)
RESEND_API_KEY=tu_resend_api_key

# Google Sheets
GOOGLE_SHEETS_CLIENT_EMAIL=tu_service_account_email
GOOGLE_SHEETS_PRIVATE_KEY=tu_private_key
GOOGLE_SHEETS_SPREADSHEET_ID=tu_spreadsheet_id

# The Odds API
THE_ODDS_API_KEY=tu_odds_api_key

# Node Environment
NODE_ENV=production
```

**Nota**: Para `NEXT_PUBLIC_APP_URL`, después del primer deploy, Vercel te dará una URL. Actualiza esta variable con la URL real de tu proyecto.

### 4. Desplegar

1. Haz clic en **"Deploy"**
2. Espera a que el build termine (puede tomar 2-5 minutos)
3. Una vez completado, verás la URL de tu aplicación: `https://tu-proyecto.vercel.app`

### 5. Actualizar Variables de Entorno Post-Deploy

Después del primer deploy exitoso:

1. Ve a **Settings** → **Environment Variables**
2. Actualiza `NEXT_PUBLIC_APP_URL` con la URL real de tu proyecto
3. Haz clic en **"Redeploy"** para aplicar los cambios

### 6. Configurar Dominio Personalizado (Opcional)

1. Ve a **Settings** → **Domains**
2. Agrega tu dominio personalizado
3. Sigue las instrucciones para configurar los DNS

## Verificar el Despliegue

### 1. Verificar que la aplicación carga
- Visita la URL de Vercel
- Deberías ver la página principal

### 2. Verificar funcionalidades
- ✅ Registro con link de admin
- ✅ Login
- ✅ Dashboard
- ✅ Predicciones
- ✅ Leaderboard

### 3. Verificar logs
- Ve a **Deployments** → Selecciona el deployment → **"View Function Logs"**
- Revisa si hay errores

## Solución de Problemas

### Error: "Environment variable not found"
- Verifica que todas las variables obligatorias estén configuradas
- Asegúrate de que los nombres sean exactos (case-sensitive)

### Error: "Build failed"
- Revisa los logs del build en Vercel
- Verifica que `package.json` tenga todos los scripts necesarios
- Asegúrate de que no haya errores de TypeScript

### Error: "Database connection failed"
- Verifica las credenciales de Supabase
- Asegúrate de que `SUPABASE_SERVICE_ROLE_KEY` esté configurado correctamente

### Error: "JWT secret not found"
- Verifica que `JWT_SECRET` esté configurado
- Debe ser una cadena larga y segura

## Actualizaciones Futuras

Cada vez que hagas `git push` a la rama `main`, Vercel desplegará automáticamente los cambios.

Para desplegar manualmente:
1. Ve a **Deployments**
2. Haz clic en **"Redeploy"** en el deployment que quieras

## Configuración de Producción

### Headers de Seguridad
Ya están configurados en `next.config.mjs`:
- HSTS
- CSP
- X-Frame-Options
- Y más...

### Analytics
Vercel Analytics ya está integrado en `app/layout.tsx`

## Migración de Base de Datos

**IMPORTANTE**: Antes de usar la aplicación en producción, ejecuta la migración SQL:

```sql
-- Ejecutar en Supabase SQL Editor
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_cedula_key;
ALTER TABLE users ALTER COLUMN cedula DROP NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_cedula_unique 
ON users(cedula) 
WHERE cedula IS NOT NULL;
DROP INDEX IF EXISTS idx_users_cedula;
CREATE INDEX IF NOT EXISTS idx_users_cedula ON users(cedula) WHERE cedula IS NOT NULL;
```

## Soporte

Si tienes problemas:
1. Revisa los logs en Vercel Dashboard
2. Verifica las variables de entorno
3. Revisa la documentación de Vercel: https://vercel.com/docs
