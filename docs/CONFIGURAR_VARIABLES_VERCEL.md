# Cómo Configurar Variables de Entorno en Vercel

Esta guía te ayudará a configurar todas las variables de entorno necesarias en Vercel para que tu aplicación funcione correctamente.

## 🔍 Paso 1: Obtener las Claves de Supabase

### 1.1 Acceder a Supabase
1. Ve a [https://supabase.com](https://supabase.com)
2. Inicia sesión en tu cuenta
3. Selecciona tu proyecto "Mundial Predict" (o el nombre de tu proyecto)

### 1.2 Obtener las Claves
1. En el menú lateral, ve a **Settings** (Configuración)
2. Haz clic en **API**
3. En la sección **Project API keys**, encontrarás:

#### **NEXT_PUBLIC_SUPABASE_URL**
- Ubicación: **Project URL**
- Ejemplo: `https://xxxxxxxxxxxxx.supabase.co`
- **Copia esta URL completa**

#### **NEXT_PUBLIC_SUPABASE_ANON_KEY**
- Ubicación: **anon public** key
- Es una clave larga que empieza con `eyJhbG...`
- **Copia esta clave completa**

#### **SUPABASE_SERVICE_ROLE_KEY** ⚠️ **CRÍTICA**
- Ubicación: **service_role** key (en la sección "Project API keys")
- También es una clave larga que empieza con `eyJhbG...`
- ⚠️ **Esta es la clave más importante** y la que causa el error "UPDATE requires a WHERE clause"
- **Copia esta clave completa**
- 🔒 **Mantén esta clave segura** - nunca la compartas públicamente

---

## 🔐 Paso 2: Generar JWT_SECRET

El `JWT_SECRET` debe tener **mínimo 32 caracteres**. Puedes generarlo de varias formas:

### Opción A: Usar PowerShell (Windows)
```powershell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

### Opción B: Usar un generador online
Ve a [https://randomkeygen.com/](https://randomkeygen.com/) y genera una clave de 32+ caracteres

### Opción C: Usar cualquier string de 32+ caracteres
Ejemplo: `mundial-predict-2026-secret-key-super-seguro-123`

**Recomendación**: Usa una clave aleatoria fuerte de al menos 64 caracteres.

---

## 🚀 Paso 3: Configurar Variables en Vercel

### 3.1 Acceder a Vercel
1. Ve a [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Inicia sesión en tu cuenta
3. Selecciona tu proyecto "mundial-predict" (o el nombre que le hayas dado)

### 3.2 Ir a Environment Variables
1. Haz clic en **Settings** en la parte superior
2. En el menú lateral izquierdo, haz clic en **Environment Variables**
3. Verás un botón **"Add Environment Variable"** en la parte superior derecha

### 3.3 Agregar Variables Requeridas

Haz clic en **"Add Environment Variable"** y agrega cada una de estas variables:

#### Variable 1: NEXT_PUBLIC_SUPABASE_URL
- **Key**: `NEXT_PUBLIC_SUPABASE_URL`
- **Value**: La URL de tu proyecto Supabase (obtenida en el Paso 1.2)
- **Environments**: ✅ Production, ✅ Preview, ✅ Development
- Haz clic en **"Save"**

#### Variable 2: NEXT_PUBLIC_SUPABASE_ANON_KEY
- **Key**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value**: La clave anon de Supabase (obtenida en el Paso 1.2)
- **Environments**: ✅ Production, ✅ Preview, ✅ Development
- Haz clic en **"Save"**

#### Variable 3: SUPABASE_SERVICE_ROLE_KEY ⚠️ **MUY IMPORTANTE**
- **Key**: `SUPABASE_SERVICE_ROLE_KEY`
- **Value**: La clave service_role de Supabase (obtenida en el Paso 1.2)
- **Environments**: ✅ Production, ✅ Preview, ✅ Development
- ⚠️ **Esta es la clave que resuelve el error "UPDATE requires a WHERE clause"**
- Haz clic en **"Save"**

#### Variable 4: JWT_SECRET
- **Key**: `JWT_SECRET`
- **Value**: La clave JWT que generaste en el Paso 2 (mínimo 32 caracteres)
- **Environments**: ✅ Production, ✅ Preview, ✅ Development
- Haz clic en **"Save"**

#### Variable 5: NEXT_PUBLIC_APP_URL
- **Key**: `NEXT_PUBLIC_APP_URL`
- **Value**: La URL de tu proyecto en Vercel (ej: `https://mundial-predict.vercel.app`)
- **Nota**: Si aún no has desplegado, usa una URL temporal. Después del primer deploy, actualízala con la URL real que Vercel te dé.
- **Environments**: ✅ Production, ✅ Preview, ✅ Development
- Haz clic en **"Save"**

---

## ✅ Paso 4: Verificar Variables Configuradas

Después de agregar todas las variables, deberías ver una lista similar a esta:

```
NEXT_PUBLIC_SUPABASE_URL          ✅ Production, Preview, Development
NEXT_PUBLIC_SUPABASE_ANON_KEY     ✅ Production, Preview, Development
SUPABASE_SERVICE_ROLE_KEY         ✅ Production, Preview, Development
JWT_SECRET                        ✅ Production, Preview, Development
NEXT_PUBLIC_APP_URL               ✅ Production, Preview, Development
```

---

## 🔄 Paso 5: Redesplegar la Aplicación

Después de agregar las variables de entorno:

1. En Vercel, ve a la pestaña **Deployments**
2. Encuentra el deployment más reciente
3. Haz clic en el menú de tres puntos (⋯)
4. Selecciona **"Redeploy"**
5. Confirma el redespliegue

**O simplemente**:
- Haz un nuevo commit y push a GitHub
- Vercel automáticamente detectará el cambio y desplegará con las nuevas variables

---

## 🧪 Paso 6: Probar que Funciona

Después del redespliegue:

1. Ve a la URL de tu aplicación en Vercel
2. Intenta crear un usuario usando un link de registro
3. El error "UPDATE requires a WHERE clause" debería estar resuelto

---

## 🔍 Variables Opcionales

Si usas estas funciones, también puedes agregarlas:

### Email (Resend)
- **Key**: `RESEND_API_KEY`
- **Value**: Tu API key de Resend

### Google Sheets
- **Key**: `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- **Value**: Email de tu cuenta de servicio de Google

- **Key**: `GOOGLE_PRIVATE_KEY`
- **Value**: Tu clave privada de Google (completa, incluyendo `\n`)

- **Key**: `GOOGLE_SHEET_ID`
- **Value**: ID de tu hoja de Google Sheets

### The Odds API
- **Key**: `THE_ODDS_API_KEY`
- **Value**: Tu API key de The Odds API

---

## ❗ Problemas Comunes

### Error: "UPDATE requires a WHERE clause"
**Causa**: Falta `SUPABASE_SERVICE_ROLE_KEY` o está mal configurada
**Solución**: Verifica que la variable esté correctamente configurada en Vercel y que uses el valor correcto

### Error: "Variables de entorno inválidas"
**Causa**: Falta alguna variable requerida o tiene un formato incorrecto
**Solución**: Verifica que todas las variables requeridas estén configuradas

### Error: "JWT_SECRET debe tener al menos 32 caracteres"
**Causa**: El JWT_SECRET es muy corto
**Solución**: Genera un nuevo JWT_SECRET de al menos 32 caracteres

---

## 📝 Checklist Final

Antes de considerar que todo está configurado:

- [ ] ✅ Obtuviste `NEXT_PUBLIC_SUPABASE_URL` de Supabase
- [ ] ✅ Obtuviste `NEXT_PUBLIC_SUPABASE_ANON_KEY` de Supabase
- [ ] ✅ Obtuviste `SUPABASE_SERVICE_ROLE_KEY` de Supabase (⚠️ la más importante)
- [ ] ✅ Generaste un `JWT_SECRET` de al menos 32 caracteres
- [ ] ✅ Agregaste todas las variables en Vercel
- [ ] ✅ Configuraste las variables para Production, Preview y Development
- [ ] ✅ Redesplegaste la aplicación
- [ ] ✅ Probaste crear un usuario y funciona sin errores

---

## 🆘 ¿Necesitas Ayuda?

Si después de seguir estos pasos el error persiste:

1. Verifica los logs de Vercel (Deployments → Selecciona el deployment → Logs)
2. Verifica los logs de Supabase (Logs → Postgres Logs)
3. Asegúrate de que ejecutaste el SQL para deshabilitar RLS en `registration_links`:
   ```sql
   ALTER TABLE registration_links DISABLE ROW LEVEL SECURITY;
   ```
