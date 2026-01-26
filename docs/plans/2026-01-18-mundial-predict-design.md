# Mundial Predict - Documento de Diseño

**Fecha:** 2026-01-18
**Estado:** Aprobado
**Versión:** 1.0

---

## 1. Resumen del Proyecto

Juego de predicciones para el Mundial de Fútbol 2026 donde los usuarios registrados predicen resultados de partidos y compiten por premios en efectivo.

### Características Principales
- Registro por invitación (links únicos post-pago)
- Predicciones de partidos con sistema de puntos
- Predicciones especiales (campeón, goleador, etc.)
- Ranking en tiempo real
- Premios dinámicos basados en participantes
- Panel de administración
- Exportación a Google Sheets

---

## 2. Arquitectura

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   FRONTEND   │     │   BACKEND    │     │   DATABASE   │
│   Next.js    │────▶│  API Routes  │────▶│   Supabase   │
│   (v0 UI)    │     │  /api/*      │     │  (PostgreSQL)│
└──────────────┘     └──────────────┘     └──────────────┘
                            │
         ┌──────────────────┼──────────────────┐
         ▼                  ▼                  ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│ Football API │   │   SCHEDULER  │   │ Google Sheets│
│  (partidos)  │   │    (Cron)    │   │  (reportes)  │
└──────────────┘   └──────────────┘   └──────────────┘
```

### Stack Tecnológico
- **Frontend:** Next.js 16 + React 19 + Tailwind CSS
- **Backend:** API Routes de Next.js
- **Base de datos:** Supabase (PostgreSQL)
- **APIs externas:** Football-Data.org (gratis) + Google Sheets API
- **Email:** Resend (gratis hasta 3,000/mes)
- **Hosting:** Vercel + dominio propio

---

## 3. Modelo de Datos

### Tabla: users
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | uuid | PK |
| nombre_completo | text | Nombre con apellidos |
| cedula | text | Único |
| email | text | Único |
| celular | text | Único |
| password_hash | text | Contraseña encriptada |
| es_admin | boolean | Default false |
| creado_en | timestamp | Auto |

### Tabla: registration_links
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | uuid | PK |
| token | text | Único, para URL |
| usado | boolean | Default false |
| usado_por | uuid | FK → users (nullable) |
| creado_en | timestamp | Auto |
| expira_en | timestamp | 48h después de creación |

### Tabla: teams
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | uuid | PK |
| nombre | text | Nombre del equipo |
| codigo | text | ARG, COL, BRA, etc. |
| bandera_url | text | URL de bandera |
| grupo | text | A, B, C... (fase grupos) |

### Tabla: matches
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | uuid | PK |
| equipo_local | uuid | FK → teams |
| equipo_visitante | uuid | FK → teams |
| fase | text | grupos, octavos, cuartos, semifinal, final |
| fecha_hora | timestamp | Fecha y hora del partido |
| estadio | text | Nombre del estadio |
| goles_local | int | Nullable hasta finalizar |
| goles_visitante | int | Nullable hasta finalizar |
| estado | text | proximo, en_vivo, finalizado |
| predicciones_cerradas | boolean | Default false |

### Tabla: predictions
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | uuid | PK |
| user_id | uuid | FK → users |
| match_id | uuid | FK → matches |
| goles_local | int | Predicción |
| goles_visitante | int | Predicción |
| puntos_obtenidos | int | 0, 1, o 3 |
| es_exacto | boolean | Marcador exacto |
| creado_en | timestamp | Auto |
| actualizado_en | timestamp | Auto |

### Tabla: special_predictions
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | uuid | PK |
| user_id | uuid | FK → users |
| campeon | uuid | FK → teams |
| subcampeon | uuid | FK → teams |
| goleador | text | Nombre del jugador |
| colombia_hasta | text | grupos, octavos, cuartos, semifinal, final, campeon |
| bloqueado | boolean | Default false |
| creado_en | timestamp | Auto |

### Tabla: prize_pool
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | uuid | PK |
| total_usuarios | int | Contador |
| pozo_total | int | total_usuarios × 100,000 |
| premio_primero | int | 55% del pozo |
| premio_exactos | int | 25% del pozo |
| premio_grupos | int | 10% del pozo |
| actualizado_en | timestamp | Auto |

---

## 4. Sistema de Autenticación

### Registro
- **Campos:** Nombre completo, cédula, email, celular, contraseña
- **Acceso:** Solo con link único generado por admin
- **Validación:** Cédula, email y celular deben ser únicos

### Login
Tres opciones de identificador + contraseña:
- Correo + contraseña
- Cédula + contraseña
- Celular + contraseña

### Flujo de Registro
1. Usuario paga (efectivo/transferencia)
2. Admin genera link desde panel
3. Admin envía link al usuario
4. Usuario completa registro
5. Link se marca como usado
6. Pozo se actualiza (+$100,000)

---

## 5. Sistema de Predicciones

### Predicciones por Partido
- **Fase de grupos:** Cierre 1 día antes del mundial
- **Octavos, cuartos, semifinal, final:** Cierre 8 horas antes de cada fase

### Predicciones Especiales
| Predicción | Puntos | Cierre |
|------------|--------|--------|
| Campeón del mundial | +10 pts | 1 día antes del mundial |
| Subcampeón | +5 pts | 1 día antes del mundial |
| Goleador | +8 pts | 1 día antes del mundial |
| ¿Hasta dónde llega Colombia? | +5 pts | 8h antes de cada fase (actualizable) |

---

## 6. Sistema de Puntuación

### Por Partido
| Resultado | Puntos |
|-----------|--------|
| Marcador exacto (2-1 = 2-1) | 3 pts |
| Solo ganador/empate correcto | 1 pt |
| No acierta nada | 0 pts |

**Nota:** Si acierta exacto, solo recibe 3 pts (no se suma el punto del ganador).

### Desempate
Si empatan en puntos: Gana quien tenga más marcadores exactos.

### Máximo Posible
- 104 partidos × 3 pts = 312 pts
- Especiales = 28 pts
- **Total máximo = 340 pts**

---

## 7. Sistema de Premios

### Distribución
| Premio | Porcentaje |
|--------|------------|
| Ganador total (más puntos) | 55% |
| Más marcadores exactos | 25% |
| Ganador fase de grupos | 10% |
| Organización | 10% |

### Ejemplo con 100 participantes
- Pozo total: $10,000,000 COP
- Ganador total: $5,500,000
- Más exactos: $2,500,000
- Fase grupos: $1,000,000
- Organización: $1,000,000

### Reglas
- Inscripción: $100,000 COP
- Pozo se actualiza en tiempo real con cada registro
- Si una persona gana dos premios, se lleva ambos (Opción A)
- Cada ganador puede elegir: dinero o camiseta Colombia 2026

---

## 8. Panel de Administración

### Funcionalidades
1. **Links:** Generar en lote, ver estado, copiar/descargar
2. **Usuarios:** Listar, buscar, ver estadísticas
3. **Partidos:** Sincronizar con API, editar resultados manual
4. **Reportes:** Exportar a Google Sheets (ranking, por usuario, por partido, completo)
5. **Configuración:** Porcentajes de premios, administradores, notificaciones

### Administradores
- 2 administradores con acceso total

---

## 9. Notificaciones

### Email (Resend)
- Bienvenida al registrarse
- Recordatorio de cierre de predicciones (24h, 8h, 2h)
- Resultados de partidos y puntos ganados
- Cambios en el ranking
- Nueva fase disponible

### Push (Navegador)
- Partido iniciando
- Goles en vivo
- Cierre próximo de predicciones
- Resultado final

---

## 10. Tareas Automáticas (Cron)

| Frecuencia | Tarea |
|------------|-------|
| Cada 5 min | Sincronizar marcadores (durante partidos) |
| Cada hora | Verificar cierres, enviar recordatorios |
| Post-partido | Calcular puntos, actualizar ranking |
| Nueva fase | Cargar partidos, abrir predicciones |
| Nuevo registro | Recalcular pozo de premios |

---

## 11. API Endpoints

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión
- `GET /api/auth/me` - Usuario actual

### Usuarios
- `GET /api/users` - Listar (admin)
- `GET /api/users/[id]` - Detalle
- `GET /api/users/[id]/predictions` - Predicciones
- `GET /api/users/[id]/stats` - Estadísticas

### Partidos
- `GET /api/matches` - Listar
- `GET /api/matches/[id]` - Detalle
- `POST /api/matches/sync` - Sincronizar (admin)
- `PATCH /api/matches/[id]/result` - Resultado manual (admin)

### Predicciones
- `GET /api/predictions` - Mis predicciones
- `POST /api/predictions` - Crear/actualizar
- `GET /api/predictions/match/[id]` - Por partido (admin)
- `GET /api/predictions/special` - Especiales
- `POST /api/predictions/special` - Guardar especiales

### Leaderboard
- `GET /api/leaderboard` - Ranking general
- `GET /api/leaderboard/groups` - Ranking grupos
- `GET /api/leaderboard/recalculate` - Recalcular (admin/cron)

### Premios
- `GET /api/prizes` - Pozo actual
- `GET /api/prizes/recalculate` - Recalcular

### Admin
- `GET /api/admin/links` - Listar links
- `POST /api/admin/links/generate` - Generar lote
- `GET /api/admin/reports/*` - Exportar reportes

### Notificaciones
- `POST /api/notifications/subscribe` - Suscribir push
- `POST /api/notifications/send` - Enviar (cron/admin)

### Cron
- `GET /api/cron/sync-matches` - Sincronizar
- `GET /api/cron/check-deadlines` - Verificar cierres
- `GET /api/cron/calculate-points` - Calcular puntos

---

## 12. Estructura de Páginas

### Públicas
- `/` - Landing page
- `/registro?t=[token]` - Formulario registro
- `/login` - Inicio de sesión
- `/reglas` - Reglas y premios

### Usuario
- `/dashboard` - Panel principal
- `/predicciones` - Hacer predicciones
- `/predicciones/especiales` - Predicciones especiales
- `/clasificacion` - Ranking en vivo
- `/resultados` - Resultados y puntos
- `/mi-perfil` - Estadísticas personales
- `/premios` - Pozo dinámico

### Admin
- `/admin` - Dashboard
- `/admin/links` - Generar links
- `/admin/usuarios` - Gestión usuarios
- `/admin/partidos` - Gestión partidos
- `/admin/reportes` - Exportar Google Sheets
- `/admin/config` - Configuración

---

## 13. Fases de Implementación

### Fase 1: Base
- Configurar Supabase
- API de autenticación
- Páginas: registro, login

### Fase 2: Core del Juego
- API de partidos
- Integración Football-Data.org
- API de predicciones
- Páginas: predicciones

### Fase 3: Ranking y Puntos
- API de leaderboard
- Cálculo de puntos
- API de premios
- Páginas: clasificación, resultados

### Fase 4: Administración
- API admin
- Links en lote
- Google Sheets
- Panel admin

### Fase 5: Automatización
- Vercel Cron
- Sincronización automática
- Cierre de predicciones
- Recálculo de ranking

### Fase 6: Notificaciones
- Resend (email)
- Push (navegador)
- Recordatorios

### Fase 7: Deploy
- Vercel
- Dominio propio
- Pruebas finales

---

## 14. Servicios Externos

| Servicio | Uso | Costo |
|----------|-----|-------|
| Supabase | Base de datos + Auth | Gratis (tier free) |
| Football-Data.org | Partidos y resultados | Gratis |
| Resend | Emails | Gratis (3,000/mes) |
| Google Sheets API | Reportes | Gratis |
| Vercel | Hosting + Cron | Gratis (tier hobby) |
| Dominio | URL personalizada | ~$12/año |

---

## 15. Consideraciones de Seguridad

- Contraseñas hasheadas con bcrypt
- Tokens de registro únicos y expirables
- Rutas protegidas por rol (usuario/admin)
- Cron jobs protegidos con CRON_SECRET
- Validación de datos en servidor
- Rate limiting en endpoints sensibles

---

**Documento aprobado y listo para implementación.**
