# 🔧 Instrucciones para Configurar Variables de Entorno

## ❌ Error Actual

Te falta la variable: `SUPABASE_SERVICE_ROLE_KEY`

## ✅ Solución

1. **Abre el archivo `.env.local`** en la raíz del proyecto

2. **Asegúrate de tener estas variables REQUERIDAS:**

```env
# Supabase (REQUERIDAS)
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anon_aqui
SUPABASE_SERVICE_ROLE_KEY=tu_clave_service_role_aqui

# JWT Secret (REQUERIDO - mínimo 32 caracteres)
JWT_SECRET=tu_secret_jwt_minimo_32_caracteres_largo

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. **Variables OPCIONALES** (puedes dejarlas vacías si no las usas):

```env
# Football Data API (Opcional)
FOOTBALL_DATA_API_KEY=

# Resend (Opcional)
RESEND_API_KEY=

# Google Sheets (Opcional)
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_PRIVATE_KEY=
GOOGLE_SHEET_ID=

# Cron Secret (Opcional)
CRON_SECRET=

# Node Environment
NODE_ENV=development
```

## 🔑 Dónde conseguir las variables de Supabase

1. Ve a tu proyecto en [supabase.com](https://supabase.com)
2. Ve a **Settings** → **API**
3. Copia:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ Esta es la que falta

## 🔐 Generar JWT_SECRET

Si no tienes un JWT_SECRET, puedes generar uno con:

```bash
# En PowerShell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})

# O simplemente usa cualquier string de al menos 32 caracteres
```

## ✅ Después de configurar

1. **Guarda el archivo `.env.local`**
2. **Reinicia el servidor** (detén con Ctrl+C y vuelve a ejecutar `npm run dev`)
3. El error debería desaparecer

## ⚠️ Importante

- **NUNCA** compartas tu `.env.local` o hagas commit de él
- El archivo `.env.local` está en `.gitignore` por seguridad
- La clave `service_role` es muy sensible, mantenla segura
