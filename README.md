# Mundial Predict - Copa del Mundo 2026

Aplicación web para predecir los resultados de la Copa del Mundo 2026. Los usuarios pueden hacer predicciones de partidos, competir en un leaderboard y ganar puntos.

## 🚀 Características

- ✅ Autenticación con sesiones JWT
- ✅ Sistema de predicciones de partidos
- ✅ Leaderboard en tiempo real
- ✅ Predicciones especiales (campeón, goleador, etc.)
- ✅ Panel de administración
- ✅ Notificaciones push
- ✅ Emails de recordatorio y resultados

## 📋 Requisitos Previos

- Node.js 18+ 
- npm o yarn
- Cuenta de Supabase
- (Opcional) Resend API key para emails
- (Opcional) Football Data API key para sincronización

## 🛠️ Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repo-url>
   cd LandingPage
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**

   Copia `.env.example` a `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

   Edita `.env.local` con tus credenciales:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   JWT_SECRET=your_jwt_secret_minimum_32_characters_long
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Configurar base de datos**

   - Ejecuta las migraciones desde `supabase/migrations/` (Supabase Dashboard → SQL Editor, o CLI).
   - **Seed de partidos Mundial 2026:** equipos y 72 partidos de fase de grupos. Ejecuta **una vez** por proyecto Supabase:
     ```bash
     npm run seed-wc2026-groups
     ```
     Requiere `NEXT_PUBLIC_SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` en `.env.local`.  
     Alternativa: pegar y ejecutar `scripts/seed-world-cup-2026-groups.sql` en el SQL Editor de Supabase.

5. **Ejecutar en desarrollo**
   ```bash
   npm run dev
   ```

   La aplicación estará disponible en `http://localhost:3000`

## 📁 Estructura del Proyecto

```
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── admin/             # Panel de administración
│   ├── auth/              # Páginas de autenticación
│   └── dashboard/         # Dashboard del usuario
├── components/            # Componentes React
│   └── ui/               # Componentes UI base
├── lib/                   # Utilidades y configuraciones
│   ├── auth/             # Lógica de autenticación
│   ├── config/           # Configuración (env, etc.)
│   ├── supabase/         # Clientes Supabase
│   ├── types/            # Tipos TypeScript
│   └── utils/            # Utilidades (logger, rate-limit, etc.)
├── public/               # Archivos estáticos
├── scripts/              # Scripts SQL de inicialización
└── supabase/             # Migraciones de Supabase
```

## 🔐 Variables de Entorno

Ver `.env.example` para la lista completa de variables requeridas y opcionales.

### Variables Requeridas

- `NEXT_PUBLIC_SUPABASE_URL`: URL de tu proyecto Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Clave anónima de Supabase
- `SUPABASE_SERVICE_ROLE_KEY`: Clave de servicio de Supabase
- `JWT_SECRET`: Secret para JWT (mínimo 32 caracteres)
- `NEXT_PUBLIC_APP_URL`: URL de la aplicación

### Variables Opcionales

- `FOOTBALL_DATA_API_KEY`: Para sincronización de partidos
- `RESEND_API_KEY`: Para envío de emails
- `CRON_SECRET`: Para proteger cron jobs

## 🧪 Testing

```bash
npm run test
```

## 🏗️ Build para Producción

```bash
npm run build
npm start
```

## 🔧 Scripts Disponibles

- `npm run dev`: Desarrollo
- `npm run build`: Build de producción
- `npm run start`: Iniciar servidor de producción
- `npm run lint`: Linter
- `npm run seed-wc2026-groups`: Seed equipos + partidos fase de grupos Mundial 2026 (ejecutar una vez por Supabase)
- `npm run create-admin`: Crear usuario administrador

## 📝 API Routes

### Autenticación
- `POST /api/auth/register` - Registro con token
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Usuario actual

### Partidos
- `GET /api/matches` - Listar partidos
- `GET /api/matches/[id]` - Detalle de partido
- `POST /api/matches` - Crear partido (admin)

### Predicciones
- `GET /api/predictions` - Predicciones del usuario
- `POST /api/predictions` - Crear/actualizar predicción
- `GET /api/predictions/special` - Predicciones especiales
- `POST /api/predictions/special` - Actualizar predicciones especiales

### Leaderboard
- `GET /api/leaderboard` - Tabla de clasificación

### Admin
- `GET /api/admin/links` - Listar links de registro
- `POST /api/admin/links/generate` - Generar links

## 🛡️ Seguridad

- ✅ Validación de variables de entorno al inicio
- ✅ Rate limiting en rutas críticas (login, etc.)
- ✅ Manejo centralizado de errores
- ✅ Logging estructurado
- ✅ Sesiones JWT seguras
- ✅ Validación de entrada con Zod

## 📚 Tecnologías

- **Framework**: Next.js 16
- **Base de datos**: Supabase (PostgreSQL)
- **Autenticación**: JWT con jose
- **Validación**: Zod
- **UI**: Tailwind CSS + Radix UI
- **Tipado**: TypeScript

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📄 Licencia

[Tu licencia aquí]

## 🗄️ Base de datos, GitHub y despliegue

- **Datos en Supabase:** equipos, partidos, usuarios, etc. viven en tu proyecto Supabase. No se suben a GitHub.
- **Al hacer push a GitHub** solo subes código (app, scripts, migraciones). Supabase no se sincroniza con el repo.
- **Mismo Supabase en local y Vercel:** si usas las mismas env (`NEXT_PUBLIC_SUPABASE_URL`, etc.) en Vercel, la app en producción ya lee los mismos datos. No hace falta volver a ejecutar el seed.
- **Supabase nuevo** (otro proyecto, staging, otro dev): ejecuta migraciones y luego `npm run seed-wc2026-groups` (o el SQL del seed) contra ese proyecto. El seed es idempotente (puedes repetirlo sin duplicar).

## 🆘 Soporte

Para problemas o preguntas, abre un issue en GitHub.
