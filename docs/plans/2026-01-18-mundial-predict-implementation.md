# Mundial Predict - Plan de Implementación

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implementar el backend funcional para el juego de predicciones del Mundial 2026, conectando el frontend existente (v0) con Supabase, Football-Data.org API, y servicios de notificaciones.

**Architecture:** Next.js App Router con API Routes para toda la lógica de backend. Supabase como base de datos PostgreSQL y autenticación custom. Vercel Cron para tareas automáticas. Resend para emails y Web Push API para notificaciones del navegador.

**Tech Stack:** Next.js 16, React 19, TypeScript, Supabase, Zod, React Hook Form, Resend, Football-Data.org API, Google Sheets API

---

## Prerequisitos

Antes de comenzar, el usuario debe:
1. Tener cuenta en Supabase (https://supabase.com)
2. Tener cuenta en Football-Data.org para API key (https://www.football-data.org)
3. Tener cuenta en Resend para emails (https://resend.com)
4. Tener cuenta en Google Cloud para Sheets API

---

## FASE 1: Configuración Base

### Task 1.1: Inicializar Git

**Files:**
- Create: `.gitignore`

**Step 1: Inicializar repositorio**

```bash
cd /mnt/c/Users/vasqu/OneDrive/Desktop/LandingPage
git init
```

**Step 2: Crear .gitignore**

```gitignore
# Dependencies
node_modules/
.pnpm-store/

# Next.js
.next/
out/

# Environment
.env
.env.local
.env.*.local

# Debug
npm-debug.log*

# Vercel
.vercel

# TypeScript
*.tsbuildinfo

# IDE
.idea/
.vscode/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db
```

**Step 3: Commit inicial**

```bash
git add .
git commit -m "chore: initial commit with v0 frontend"
```

---

### Task 1.2: Configurar Variables de Entorno

**Files:**
- Create: `.env.local`
- Create: `.env.example`

**Step 1: Crear archivo de ejemplo**

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Football Data API
FOOTBALL_DATA_API_KEY=your_api_key

# Resend (Email)
RESEND_API_KEY=your_resend_api_key

# Google Sheets
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account_email
GOOGLE_PRIVATE_KEY=your_private_key
GOOGLE_SHEET_ID=your_sheet_id

# Cron Secret
CRON_SECRET=generate_a_random_string_here

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Step 2: Crear .env.local con valores reales**

Copiar `.env.example` a `.env.local` y llenar con credenciales reales de Supabase.

**Step 3: Commit**

```bash
git add .env.example
git commit -m "chore: add environment variables template"
```

---

### Task 1.3: Crear Tipos Base de TypeScript

**Files:**
- Create: `lib/types/database.ts`

**Step 1: Crear directorio**

```bash
mkdir -p lib/types
```

**Step 2: Crear tipos de base de datos**

```typescript
// lib/types/database.ts

export interface User {
  id: string
  nombre_completo: string
  cedula: string
  email: string
  celular: string
  password_hash: string
  es_admin: boolean
  creado_en: string
}

export interface RegistrationLink {
  id: string
  token: string
  usado: boolean
  usado_por: string | null
  creado_en: string
  expira_en: string
}

export interface Team {
  id: string
  nombre: string
  codigo: string
  bandera_url: string
  grupo: string | null
}

export type MatchPhase = 'grupos' | 'octavos' | 'cuartos' | 'semifinal' | 'tercer_puesto' | 'final'
export type MatchStatus = 'proximo' | 'en_vivo' | 'finalizado'

export interface Match {
  id: string
  equipo_local_id: string
  equipo_visitante_id: string
  fase: MatchPhase
  fecha_hora: string
  estadio: string
  goles_local: number | null
  goles_visitante: number | null
  estado: MatchStatus
  predicciones_cerradas: boolean
  external_id: number | null
}

export interface MatchWithTeams extends Match {
  equipo_local: Team
  equipo_visitante: Team
}

export interface Prediction {
  id: string
  user_id: string
  match_id: string
  goles_local: number
  goles_visitante: number
  puntos_obtenidos: number
  es_exacto: boolean
  creado_en: string
  actualizado_en: string
}

export type ColombiaProgress = 'grupos' | 'octavos' | 'cuartos' | 'semifinal' | 'final' | 'campeon'

export interface SpecialPrediction {
  id: string
  user_id: string
  campeon_id: string | null
  subcampeon_id: string | null
  goleador: string | null
  colombia_hasta: ColombiaProgress | null
  bloqueado_principal: boolean
  bloqueado_colombia: boolean
  creado_en: string
}

export interface PrizePool {
  id: string
  total_usuarios: number
  pozo_total: number
  premio_primero: number
  premio_exactos: number
  premio_grupos: number
  actualizado_en: string
}

export interface LeaderboardEntry {
  user_id: string
  nombre_completo: string
  puntos_totales: number
  marcadores_exactos: number
  predicciones_correctas: number
  total_predicciones: number
  posicion: number
  posicion_anterior: number | null
}
```

**Step 3: Commit**

```bash
git add lib/types/database.ts
git commit -m "feat: add TypeScript types for database models"
```

---

### Task 1.4: Configurar Cliente Supabase

**Files:**
- Create: `lib/supabase/client.ts`
- Create: `lib/supabase/server.ts`
- Create: `lib/supabase/middleware.ts`

**Step 1: Cliente para el navegador**

```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**Step 2: Cliente para el servidor**

```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignore - called from Server Component
          }
        },
      },
    }
  )
}

export async function createServiceClient() {
  const { createClient } = await import('@supabase/supabase-js')
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
```

**Step 3: Middleware helper**

```typescript
// lib/supabase/middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return { supabaseResponse, user }
}
```

**Step 4: Commit**

```bash
git add lib/supabase/
git commit -m "feat: add Supabase client configuration"
```

---

### Task 1.5: Crear Tablas en Supabase

**Files:**
- Create: `supabase/migrations/001_initial_schema.sql`

**Step 1: Crear directorio de migraciones**

```bash
mkdir -p supabase/migrations
```

**Step 2: Crear script SQL de tablas**

```sql
-- supabase/migrations/001_initial_schema.sql

-- Habilitar extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de usuarios
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre_completo TEXT NOT NULL,
  cedula TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  celular TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  es_admin BOOLEAN DEFAULT FALSE,
  creado_en TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para login
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_cedula ON users(cedula);
CREATE INDEX idx_users_celular ON users(celular);

-- Tabla de links de registro
CREATE TABLE registration_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  token TEXT UNIQUE NOT NULL,
  usado BOOLEAN DEFAULT FALSE,
  usado_por UUID REFERENCES users(id),
  creado_en TIMESTAMPTZ DEFAULT NOW(),
  expira_en TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_registration_links_token ON registration_links(token);

-- Tabla de equipos
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  codigo TEXT UNIQUE NOT NULL,
  bandera_url TEXT,
  grupo TEXT
);

-- Tabla de partidos
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipo_local_id UUID REFERENCES teams(id) NOT NULL,
  equipo_visitante_id UUID REFERENCES teams(id) NOT NULL,
  fase TEXT NOT NULL CHECK (fase IN ('grupos', 'octavos', 'cuartos', 'semifinal', 'tercer_puesto', 'final')),
  fecha_hora TIMESTAMPTZ NOT NULL,
  estadio TEXT,
  goles_local INTEGER,
  goles_visitante INTEGER,
  estado TEXT DEFAULT 'proximo' CHECK (estado IN ('proximo', 'en_vivo', 'finalizado')),
  predicciones_cerradas BOOLEAN DEFAULT FALSE,
  external_id INTEGER
);

CREATE INDEX idx_matches_fecha ON matches(fecha_hora);
CREATE INDEX idx_matches_fase ON matches(fase);
CREATE INDEX idx_matches_estado ON matches(estado);

-- Tabla de predicciones
CREATE TABLE predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) NOT NULL,
  match_id UUID REFERENCES matches(id) NOT NULL,
  goles_local INTEGER NOT NULL CHECK (goles_local >= 0),
  goles_visitante INTEGER NOT NULL CHECK (goles_visitante >= 0),
  puntos_obtenidos INTEGER DEFAULT 0,
  es_exacto BOOLEAN DEFAULT FALSE,
  creado_en TIMESTAMPTZ DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, match_id)
);

CREATE INDEX idx_predictions_user ON predictions(user_id);
CREATE INDEX idx_predictions_match ON predictions(match_id);

-- Tabla de predicciones especiales
CREATE TABLE special_predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) UNIQUE NOT NULL,
  campeon_id UUID REFERENCES teams(id),
  subcampeon_id UUID REFERENCES teams(id),
  goleador TEXT,
  colombia_hasta TEXT CHECK (colombia_hasta IN ('grupos', 'octavos', 'cuartos', 'semifinal', 'final', 'campeon')),
  bloqueado_principal BOOLEAN DEFAULT FALSE,
  bloqueado_colombia BOOLEAN DEFAULT FALSE,
  creado_en TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de pozo de premios (singleton)
CREATE TABLE prize_pool (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  total_usuarios INTEGER DEFAULT 0,
  pozo_total INTEGER DEFAULT 0,
  premio_primero INTEGER DEFAULT 0,
  premio_exactos INTEGER DEFAULT 0,
  premio_grupos INTEGER DEFAULT 0,
  actualizado_en TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar registro inicial del pozo
INSERT INTO prize_pool (total_usuarios, pozo_total, premio_primero, premio_exactos, premio_grupos)
VALUES (0, 0, 0, 0, 0);

-- Tabla para tracking de posiciones (historial)
CREATE TABLE leaderboard_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) NOT NULL,
  posicion INTEGER NOT NULL,
  puntos_totales INTEGER NOT NULL,
  marcadores_exactos INTEGER NOT NULL,
  fecha TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_leaderboard_history_user ON leaderboard_history(user_id);
CREATE INDEX idx_leaderboard_history_fecha ON leaderboard_history(fecha);

-- Vista para el leaderboard
CREATE VIEW leaderboard AS
SELECT
  u.id as user_id,
  u.nombre_completo,
  COALESCE(SUM(p.puntos_obtenidos), 0) as puntos_totales,
  COALESCE(SUM(CASE WHEN p.es_exacto THEN 1 ELSE 0 END), 0) as marcadores_exactos,
  COALESCE(SUM(CASE WHEN p.puntos_obtenidos > 0 THEN 1 ELSE 0 END), 0) as predicciones_correctas,
  COUNT(p.id) as total_predicciones
FROM users u
LEFT JOIN predictions p ON u.id = p.user_id
WHERE u.es_admin = FALSE
GROUP BY u.id, u.nombre_completo
ORDER BY puntos_totales DESC, marcadores_exactos DESC;

-- Función para actualizar el pozo cuando se registra un usuario
CREATE OR REPLACE FUNCTION update_prize_pool()
RETURNS TRIGGER AS $$
DECLARE
  inscripcion INTEGER := 100000;
BEGIN
  UPDATE prize_pool SET
    total_usuarios = total_usuarios + 1,
    pozo_total = (total_usuarios + 1) * inscripcion,
    premio_primero = FLOOR(((total_usuarios + 1) * inscripcion) * 0.55),
    premio_exactos = FLOOR(((total_usuarios + 1) * inscripcion) * 0.25),
    premio_grupos = FLOOR(((total_usuarios + 1) * inscripcion) * 0.10),
    actualizado_en = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar pozo con cada registro
CREATE TRIGGER on_user_registered
AFTER INSERT ON users
FOR EACH ROW
WHEN (NEW.es_admin = FALSE)
EXECUTE FUNCTION update_prize_pool();

-- Función para calcular puntos de una predicción
CREATE OR REPLACE FUNCTION calculate_prediction_points(
  pred_local INTEGER,
  pred_visitante INTEGER,
  real_local INTEGER,
  real_visitante INTEGER
) RETURNS TABLE(puntos INTEGER, es_exacto BOOLEAN) AS $$
BEGIN
  -- Marcador exacto: 3 puntos
  IF pred_local = real_local AND pred_visitante = real_visitante THEN
    RETURN QUERY SELECT 3, TRUE;
  -- Acertó ganador o empate: 1 punto
  ELSIF (pred_local > pred_visitante AND real_local > real_visitante) OR
        (pred_local < pred_visitante AND real_local < real_visitante) OR
        (pred_local = pred_visitante AND real_local = real_visitante) THEN
    RETURN QUERY SELECT 1, FALSE;
  -- No acertó: 0 puntos
  ELSE
    RETURN QUERY SELECT 0, FALSE;
  END IF;
END;
$$ LANGUAGE plpgsql;
```

**Step 3: Ejecutar en Supabase**

1. Ir a Supabase Dashboard → SQL Editor
2. Copiar y ejecutar el script completo

**Step 4: Commit**

```bash
git add supabase/
git commit -m "feat: add database schema and migrations"
```

---

## FASE 2: Autenticación

### Task 2.1: Crear Utilidades de Hash y Validación

**Files:**
- Create: `lib/auth/password.ts`
- Create: `lib/auth/validation.ts`

**Step 1: Instalar bcryptjs**

```bash
npm install bcryptjs
npm install -D @types/bcryptjs
```

**Step 2: Crear utilidad de contraseñas**

```typescript
// lib/auth/password.ts
import bcrypt from 'bcryptjs'

const SALT_ROUNDS = 12

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}
```

**Step 3: Crear schemas de validación con Zod**

```typescript
// lib/auth/validation.ts
import { z } from 'zod'

export const registerSchema = z.object({
  nombre_completo: z
    .string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre es muy largo'),
  cedula: z
    .string()
    .min(6, 'La cédula debe tener al menos 6 caracteres')
    .max(20, 'La cédula es muy larga')
    .regex(/^[0-9]+$/, 'La cédula solo debe contener números'),
  email: z
    .string()
    .email('El correo no es válido'),
  celular: z
    .string()
    .min(10, 'El celular debe tener al menos 10 dígitos')
    .max(15, 'El celular es muy largo')
    .regex(/^[0-9]+$/, 'El celular solo debe contener números'),
  password: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(100, 'La contraseña es muy larga'),
  confirm_password: z.string(),
  token: z.string().min(1, 'Token de registro requerido'),
}).refine((data) => data.password === data.confirm_password, {
  message: 'Las contraseñas no coinciden',
  path: ['confirm_password'],
})

export const loginSchema = z.object({
  identifier: z
    .string()
    .min(1, 'Ingrese su correo, cédula o celular'),
  password: z
    .string()
    .min(1, 'Ingrese su contraseña'),
  identifier_type: z.enum(['email', 'cedula', 'celular']),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
```

**Step 4: Commit**

```bash
git add lib/auth/
git commit -m "feat: add password hashing and validation schemas"
```

---

### Task 2.2: Crear API de Registro

**Files:**
- Create: `app/api/auth/register/route.ts`

**Step 1: Crear endpoint de registro**

```typescript
// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { hashPassword } from '@/lib/auth/password'
import { registerSchema } from '@/lib/auth/validation'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validar input
    const result = registerSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      )
    }

    const { nombre_completo, cedula, email, celular, password, token } = result.data

    const supabase = await createServiceClient()

    // Verificar token de registro
    const { data: linkData, error: linkError } = await supabase
      .from('registration_links')
      .select('*')
      .eq('token', token)
      .single()

    if (linkError || !linkData) {
      return NextResponse.json(
        { error: 'Link de registro inválido' },
        { status: 400 }
      )
    }

    if (linkData.usado) {
      return NextResponse.json(
        { error: 'Este link ya fue utilizado' },
        { status: 400 }
      )
    }

    if (new Date(linkData.expira_en) < new Date()) {
      return NextResponse.json(
        { error: 'Este link ha expirado' },
        { status: 400 }
      )
    }

    // Verificar duplicados
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .or(`cedula.eq.${cedula},email.eq.${email},celular.eq.${celular}`)
      .limit(1)

    if (existingUser && existingUser.length > 0) {
      return NextResponse.json(
        { error: 'Ya existe un usuario con esa cédula, correo o celular' },
        { status: 400 }
      )
    }

    // Crear usuario
    const password_hash = await hashPassword(password)

    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        nombre_completo,
        cedula,
        email,
        celular,
        password_hash,
        es_admin: false,
      })
      .select('id, nombre_completo, email')
      .single()

    if (userError) {
      console.error('Error creating user:', userError)
      return NextResponse.json(
        { error: 'Error al crear el usuario' },
        { status: 500 }
      )
    }

    // Marcar link como usado
    await supabase
      .from('registration_links')
      .update({ usado: true, usado_por: user.id })
      .eq('id', linkData.id)

    return NextResponse.json({
      success: true,
      message: 'Usuario registrado exitosamente',
      user: {
        id: user.id,
        nombre_completo: user.nombre_completo,
        email: user.email,
      },
    })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
```

**Step 2: Commit**

```bash
git add app/api/auth/register/
git commit -m "feat: add registration API endpoint"
```

---

### Task 2.3: Crear API de Login

**Files:**
- Create: `app/api/auth/login/route.ts`
- Create: `lib/auth/session.ts`

**Step 1: Crear utilidad de sesión**

```typescript
// lib/auth/session.ts
import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/server'
import { SignJWT, jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-min-32-characters!'
)

interface SessionPayload {
  userId: string
  email: string
  esAdmin: boolean
}

export async function createSession(payload: SessionPayload): Promise<string> {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .setIssuedAt()
    .sign(JWT_SECRET)

  const cookieStore = await cookies()
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })

  return token
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value

  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as unknown as SessionPayload
  } catch {
    return null
  }
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete('session')
}

export async function getCurrentUser() {
  const session = await getSession()
  if (!session) return null

  const supabase = await createServiceClient()
  const { data: user } = await supabase
    .from('users')
    .select('id, nombre_completo, email, cedula, celular, es_admin')
    .eq('id', session.userId)
    .single()

  return user
}
```

**Step 2: Instalar jose**

```bash
npm install jose
```

**Step 3: Crear endpoint de login**

```typescript
// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { verifyPassword } from '@/lib/auth/password'
import { loginSchema } from '@/lib/auth/validation'
import { createSession } from '@/lib/auth/session'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validar input
    const result = loginSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      )
    }

    const { identifier, password, identifier_type } = result.data
    const supabase = await createServiceClient()

    // Buscar usuario por el identificador
    let query = supabase.from('users').select('*')

    switch (identifier_type) {
      case 'email':
        query = query.eq('email', identifier)
        break
      case 'cedula':
        query = query.eq('cedula', identifier)
        break
      case 'celular':
        query = query.eq('celular', identifier)
        break
    }

    const { data: user, error } = await query.single()

    if (error || !user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 401 }
      )
    }

    // Verificar contraseña
    const isValid = await verifyPassword(password, user.password_hash)
    if (!isValid) {
      return NextResponse.json(
        { error: 'Contraseña incorrecta' },
        { status: 401 }
      )
    }

    // Crear sesión
    await createSession({
      userId: user.id,
      email: user.email,
      esAdmin: user.es_admin,
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        nombre_completo: user.nombre_completo,
        email: user.email,
        es_admin: user.es_admin,
      },
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
```

**Step 4: Commit**

```bash
git add app/api/auth/login/ lib/auth/session.ts
git commit -m "feat: add login API endpoint with JWT session"
```

---

### Task 2.4: Crear API de Logout y Me

**Files:**
- Create: `app/api/auth/logout/route.ts`
- Create: `app/api/auth/me/route.ts`

**Step 1: Endpoint de logout**

```typescript
// app/api/auth/logout/route.ts
import { NextResponse } from 'next/server'
import { deleteSession } from '@/lib/auth/session'

export async function POST() {
  await deleteSession()
  return NextResponse.json({ success: true })
}
```

**Step 2: Endpoint de usuario actual**

```typescript
// app/api/auth/me/route.ts
import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/session'

export async function GET() {
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json(
      { error: 'No autenticado' },
      { status: 401 }
    )
  }

  return NextResponse.json({ user })
}
```

**Step 3: Commit**

```bash
git add app/api/auth/logout/ app/api/auth/me/
git commit -m "feat: add logout and me API endpoints"
```

---

### Task 2.5: Crear Middleware de Autenticación

**Files:**
- Create: `middleware.ts`

**Step 1: Crear middleware**

```typescript
// middleware.ts
import { NextResponse, type NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-min-32-characters!'
)

const publicRoutes = ['/', '/login', '/registro', '/reglas']
const adminRoutes = ['/admin']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Permitir rutas de API de auth
  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next()
  }

  // Verificar rutas públicas
  const isPublicRoute = publicRoutes.some(route =>
    pathname === route || pathname.startsWith('/registro')
  )

  const token = request.cookies.get('session')?.value
  let session = null

  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET)
      session = payload
    } catch {
      // Token inválido
    }
  }

  // Redirigir a login si no hay sesión en ruta protegida
  if (!session && !isPublicRoute && !pathname.startsWith('/api')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Verificar acceso a rutas admin
  if (pathname.startsWith('/admin')) {
    if (!session || !session.esAdmin) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  // Redirigir a dashboard si ya está logueado e intenta ir a login
  if (session && (pathname === '/login' || pathname.startsWith('/registro'))) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

**Step 2: Commit**

```bash
git add middleware.ts
git commit -m "feat: add authentication middleware"
```

---

## FASE 3: Partidos y Predicciones (Resumen de Tasks)

### Task 3.1: API de Equipos
- Create: `app/api/teams/route.ts`
- Endpoint GET para listar equipos

### Task 3.2: API de Partidos
- Create: `app/api/matches/route.ts`
- Create: `app/api/matches/[id]/route.ts`
- Create: `app/api/matches/sync/route.ts`
- Integración con Football-Data.org

### Task 3.3: API de Predicciones
- Create: `app/api/predictions/route.ts`
- Create: `app/api/predictions/special/route.ts`
- Validación de fechas límite

### Task 3.4: API de Leaderboard
- Create: `app/api/leaderboard/route.ts`
- Create: `app/api/leaderboard/recalculate/route.ts`

---

## FASE 4: Administración (Resumen de Tasks)

### Task 4.1: API de Links de Registro
- Create: `app/api/admin/links/route.ts`
- Create: `app/api/admin/links/generate/route.ts`

### Task 4.2: API de Reportes
- Create: `app/api/admin/reports/route.ts`
- Integración con Google Sheets API

### Task 4.3: Páginas de Admin
- Create: `app/admin/page.tsx`
- Create: `app/admin/links/page.tsx`
- Create: `app/admin/usuarios/page.tsx`

---

## FASE 5: Automatización (Resumen de Tasks)

### Task 5.1: Cron Jobs
- Create: `app/api/cron/sync-matches/route.ts`
- Create: `app/api/cron/check-deadlines/route.ts`
- Create: `app/api/cron/calculate-points/route.ts`
- Create: `vercel.json` con configuración de cron

---

## FASE 6: Notificaciones (Resumen de Tasks)

### Task 6.1: Email con Resend
- Create: `lib/email/resend.ts`
- Create: `lib/email/templates/welcome.tsx`

### Task 6.2: Push Notifications
- Create: `lib/notifications/push.ts`
- Create: `public/sw.js` (Service Worker)

---

## FASE 7: Frontend Updates (Resumen de Tasks)

### Task 7.1: Actualizar páginas de auth
- Modify: `app/auth/login/page.tsx`
- Modify: `app/auth/registro/page.tsx`

### Task 7.2: Crear dashboard de usuario
- Create: `app/dashboard/page.tsx`
- Update: componentes existentes para usar datos reales

### Task 7.3: Conectar componentes
- Modify: `components/leaderboard.tsx` → API real
- Modify: `components/prediction-form.tsx` → API real
- Modify: `components/live-results.tsx` → API real

---

## Notas de Implementación

1. **Orden de ejecución:** Seguir las fases en orden (1→7)
2. **Testing:** Probar cada endpoint con curl o Postman antes de continuar
3. **Variables de entorno:** Asegurar que `.env.local` tenga todos los valores
4. **Supabase:** Ejecutar migraciones SQL antes de probar APIs
5. **Commits frecuentes:** Un commit por cada task completada

---

**Plan completo. Total estimado: 35-40 tasks individuales.**
