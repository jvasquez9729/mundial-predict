# 🔐 Guía para Crear Usuario Administrador

Hay varias formas de crear tu primer usuario administrador. Elige la que prefieras:

## ✅ Método 1: Script Automático (Recomendado)

### Paso 1: Ejecutar el script

```bash
npm run create-admin
```

O directamente:

```bash
node scripts/create-admin.js
```

### Paso 2: Completar los datos

El script te pedirá:
- **Nombre completo**: Tu nombre completo
- **Cédula**: Tu número de cédula
- **Email**: Tu dirección de email
- **Celular**: Tu número de celular
- **Contraseña**: Tu contraseña (mínimo 6 caracteres)
- **Confirmar contraseña**: Repite tu contraseña

### Paso 3: Iniciar sesión

Una vez creado, podrás iniciar sesión en:
- URL: `http://localhost:3000/login`
- Usa tu **email**, **cédula** o **celular** como identificador
- Usa la **contraseña** que configuraste

---

## ✅ Método 2: Directamente en Supabase SQL Editor

### Paso 1: Abrir Supabase SQL Editor

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Ve a **SQL Editor**
3. Crea una nueva consulta

### Paso 2: Hashear tu contraseña

Primero necesitas obtener el hash bcrypt de tu contraseña. Ejecuta esto en Node.js:

```bash
node -e "const bcrypt=require('bcryptjs');bcrypt.hash('TU_CONTRASEÑA',12).then(h=>console.log(h))"
```

Reemplaza `TU_CONTRASEÑA` con tu contraseña real. Copia el hash que se genera.

### Paso 3: Ejecutar SQL

Ejecuta este SQL en Supabase, reemplazando los valores entre `<>`:

```sql
-- Reemplaza estos valores con tus datos
INSERT INTO users (
  nombre_completo,
  cedula,
  email,
  celular,
  password_hash,
  es_admin
) VALUES (
  'Tu Nombre Completo',           -- Reemplaza con tu nombre
  '1234567890',                   -- Reemplaza con tu cédula
  'admin@mundial.com',            -- Reemplaza con tu email
  '3001234567',                   -- Reemplaza con tu celular
  '$2a$12$TU_HASH_AQUI',          -- Reemplaza con el hash de tu contraseña
  TRUE
);

-- Crear registro de predicciones especiales para el admin
INSERT INTO special_predictions (user_id)
SELECT id FROM users WHERE email = 'admin@mundial.com' AND es_admin = TRUE;
```

**⚠️ Importante:**
- Reemplaza todos los valores entre comillas con tus datos reales
- El `password_hash` debe ser el hash bcrypt que generaste en el Paso 2
- Asegúrate de que el email no esté duplicado

### Paso 4: Verificar

Para verificar que se creó correctamente:

```sql
SELECT id, nombre_completo, email, es_admin, creado_en 
FROM users 
WHERE es_admin = TRUE;
```

---

## ✅ Método 3: Convertir un Usuario Existente en Admin

Si ya tienes un usuario registrado y quieres convertirlo en administrador:

### Paso 1: Abrir Supabase SQL Editor

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Ve a **SQL Editor**

### Paso 2: Ejecutar SQL

```sql
-- Reemplaza 'tu_email@ejemplo.com' con el email del usuario que quieres convertir en admin
UPDATE users
SET es_admin = TRUE
WHERE email = 'tu_email@ejemplo.com';
```

### Paso 3: Verificar

```sql
SELECT id, nombre_completo, email, es_admin 
FROM users 
WHERE email = 'tu_email@ejemplo.com';
```

---

## 🔑 Iniciar Sesión como Admin

Una vez que tengas tu usuario admin configurado:

1. **Ve a la página de login**: `http://localhost:3000/login`

2. **Inicia sesión con**:
   - Tu **email**, **cédula** o **celular**
   - Tu **contraseña**

3. **Redirección automática**:
   - Si eres admin → Te redirigirá a `/admin`
   - Si eres usuario normal → Te redirigirá a `/dashboard`

---

## 🛠️ Panel de Administración

Como administrador, tendrás acceso a:

- **Panel principal**: `/admin`
- **Generar links de registro**: `/admin/links`
- **Ver usuarios registrados**: `/admin/usuarios`
- **Generar reportes**: 
  - `/api/admin/reports/users` - Reporte de usuarios
  - `/api/admin/reports/predictions` - Reporte de predicciones

---

## ❓ Solución de Problemas

### Error: "Ya existe un usuario con ese email/cédula/celular"

- Verifica que no hayas creado el usuario anteriormente
- Si ya existe, puedes convertirlo en admin usando el Método 3
- O puedes eliminar el usuario existente y crearlo de nuevo

### Error: "Variables de entorno no configuradas"

- Verifica que tengas `.env.local` con las variables de Supabase
- Asegúrate de que `NEXT_PUBLIC_SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` estén configuradas

### Error: "Cannot find module 'dotenv'"

- Instala dotenv: `npm install dotenv`
- O ejecuta: `npm install`

### No puedo iniciar sesión

- Verifica que tu email, cédula o celular sean correctos
- Verifica que la contraseña sea la correcta
- Asegúrate de que `es_admin = TRUE` en la base de datos

---

## 🔒 Seguridad

**⚠️ Importante:**
- Nunca compartas tus credenciales de admin
- Usa contraseñas seguras (mínimo 8 caracteres, con mayúsculas, minúsculas, números y símbolos)
- No uses la misma contraseña que en otros servicios
- Considera cambiar tu contraseña periódicamente

---

## 📚 Recursos Adicionales

- [Documentación de Supabase](https://supabase.com/docs)
- [Documentación de Next.js](https://nextjs.org/docs)
- [Guía de Google Sheets Setup](docs/GOOGLE_SHEETS_SETUP.md)
