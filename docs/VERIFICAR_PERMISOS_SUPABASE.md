# Cómo Verificar y Configurar Permisos en Supabase

Este documento explica cómo revisar y configurar los permisos de Supabase para resolver el error "UPDATE requires a WHERE clause".

## 🔍 Paso 1: Acceder al Panel de Supabase

1. Ve a [https://supabase.com](https://supabase.com)
2. Inicia sesión en tu cuenta
3. Selecciona tu proyecto "Mundial Predict" (o el nombre de tu proyecto)

## 🔑 Paso 2: Verificar Service Role Key

El código usa `SUPABASE_SERVICE_ROLE_KEY` que debería tener permisos completos. Verifica que esté configurado:

### En tu proyecto:
1. Ve a **Settings** (Configuración) en el menú lateral
2. Haz clic en **API**
3. Busca la sección **Project API keys**
4. Verifica que tengas:
   - **anon** `public` key (usada en el cliente)
   - **service_role** `secret` key (usada en el servidor)

### En tu `.env.local`:
Asegúrate de que tienes:
```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key  # ⚠️ Esta es importante
```

## 📊 Paso 3: Verificar Tabla registration_links

1. En el panel de Supabase, ve a **Table Editor** (Editor de Tablas)
2. Busca la tabla `registration_links`
3. Verifica que tenga las siguientes columnas:
   - `id` (UUID, Primary Key)
   - `token` (TEXT, Unique)
   - `usado` (BOOLEAN)
   - `usado_por` (UUID, Foreign Key a users.id)
   - `creado_en` (TIMESTAMPTZ)
   - `expira_en` (TIMESTAMPTZ)

## 🔒 Paso 4: Verificar Políticas RLS (Row Level Security)

### Opción A: A través del SQL Editor

1. Ve a **SQL Editor** en el menú lateral
2. Ejecuta esta consulta para ver si RLS está habilitado:

```sql
-- Verificar si RLS está habilitado en registration_links
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'registration_links';
```

Si `rowsecurity` es `true`, RLS está habilitado y puede estar bloqueando las operaciones.

### Opción B: A través de Authentication > Policies

1. Ve a **Authentication** > **Policies** (o **Table Editor** > `registration_links` > **Policies**)
2. Busca políticas para `registration_links`
3. Si hay políticas restrictivas, pueden estar bloqueando el UPDATE

## ✅ Paso 5: Configurar Políticas Correctas

Ejecuta este SQL en el **SQL Editor** de Supabase para asegurar que las políticas estén correctas:

```sql
-- Deshabilitar RLS para registration_links (ya que usamos service_role)
-- O crear políticas que permitan todo al service_role
ALTER TABLE registration_links DISABLE ROW LEVEL SECURITY;

-- Si prefieres mantener RLS habilitado, crea políticas permisivas:
-- (Solo ejecuta una de las dos opciones arriba o abajo)

-- Opción alternativa: Crear políticas permisivas
-- Esto permite que el service_role haga cualquier operación
CREATE POLICY IF NOT EXISTS "Allow all for service role" 
ON registration_links
FOR ALL
USING (true)
WITH CHECK (true);
```

**Recomendación**: Como estás usando `SUPABASE_SERVICE_ROLE_KEY` en el servidor, **deshabilita RLS** para la tabla `registration_links`. El service_role tiene permisos completos de todos modos.

## 🔍 Paso 6: Verificar Logs de Supabase

Para ver exactamente qué error está ocurriendo:

1. Ve a **Logs** en el menú lateral
2. Selecciona **Postgres Logs** o **API Logs**
3. Busca errores recientes relacionados con `UPDATE` y `registration_links`
4. Esto te mostrará el error exacto y la consulta que está fallando

## 🛠️ Paso 7: Probar la Consulta Directamente

Ejecuta esta consulta en el **SQL Editor** para verificar que el UPDATE funciona:

```sql
-- Primero, obtén un ID de registration_links
SELECT id, token, usado, usado_por 
FROM registration_links 
LIMIT 1;

-- Luego, intenta actualizar (reemplaza 'aqui-el-id' con un ID real)
UPDATE registration_links 
SET usado = true, usado_por = NULL 
WHERE id = 'aqui-el-id';

-- Si esto funciona, el problema no es de permisos de base de datos
-- sino del código o del cliente de Supabase
```

## 📝 Paso 8: Verificar Variables de Entorno

Asegúrate de que en tu servidor (Vercel o donde esté desplegado) las variables de entorno estén configuradas:

### En Vercel:
1. Ve a tu proyecto en Vercel
2. Ve a **Settings** > **Environment Variables**
3. Verifica que tengas:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` ⚠️ **Esta es crítica**

## 🔧 Solución Rápida: SQL para Ejecutar

Ejecuta este SQL completo en el **SQL Editor** de Supabase:

```sql
-- Deshabilitar RLS para registration_links
ALTER TABLE registration_links DISABLE ROW LEVEL SECURITY;

-- Verificar que se deshabilitó
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'registration_links';
```

## 🚨 Si el Error Persiste

Si después de deshabilitar RLS el error continúa, el problema puede ser:

1. **Código**: El cliente de Supabase no está usando correctamente el service_role
2. **Variables de entorno**: El `SUPABASE_SERVICE_ROLE_KEY` no está configurado correctamente
3. **Conectividad**: Problemas de conexión con Supabase

### Verificar en el código:
El código en `app/api/auth/register/route.ts` usa:
```typescript
const supabase = createServiceClient()
```

Y `createServiceClient()` usa:
```typescript
process.env.SUPABASE_SERVICE_ROLE_KEY
```

Verifica que esta variable esté configurada correctamente.

## 📞 Soporte Adicional

Si el problema persiste después de seguir estos pasos:
1. Revisa los logs de Supabase para ver el error exacto
2. Verifica los logs de tu aplicación (Vercel, servidor, etc.)
3. Comparte el error exacto que aparece en los logs
