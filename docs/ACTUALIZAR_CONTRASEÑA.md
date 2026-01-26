# 🔐 Actualizar Contraseña de Usuario

Guía para actualizar la contraseña de un usuario existente desde la terminal.

## ✅ Método 1: Script Automático (Recomendado)

### Ejecutar el script

```bash
npm run update-password
```

O directamente:

```bash
node scripts/update-password.js
```

### Proceso interactivo

El script te pedirá:

1. **Identificador del usuario**:
   - Elige entre: Email (1), Cédula (2) o Celular (3)

2. **Valor del identificador**:
   - Ingresa el email, cédula o celular del usuario

3. **Confirmación**:
   - Verifica que sea el usuario correcto (mostrará los datos)

4. **Nueva contraseña**:
   - Ingresa la nueva contraseña (mínimo 6 caracteres)
   - Confirma la contraseña

### Ejemplo de uso

```bash
$ npm run update-password

🔐 Actualizar Contraseña de Usuario
====================================

¿Cómo quieres identificar al usuario?
1. Email
2. Cédula
3. Celular

Opción (1-3): 1
Email del usuario: admin@mundial.com

⏳ Buscando usuario...

✅ Usuario encontrado:
   Nombre: Admin Mundial
   Email: admin@mundial.com
   Cédula: 1234567890
   Celular: 3001234567
   Es Admin: Sí

¿Es el usuario correcto? (s/n): s

🔒 Nueva Contraseña
==================
Nueva contraseña (mínimo 6 caracteres): ******
Confirmar nueva contraseña: ******

⏳ Actualizando contraseña...

✅ Contraseña actualizada exitosamente!
====================================
Usuario: Admin Mundial
Email: admin@mundial.com

📝 El usuario ahora puede iniciar sesión con:
   Email/Cédula/Celular: admin@mundial.com
   Nueva contraseña: [la que acabas de configurar]

🔗 URL de login: http://localhost:3000/login
```

---

## ✅ Método 2: Desde Supabase SQL Editor

Si prefieres hacerlo directamente en Supabase:

### Paso 1: Generar hash de la nueva contraseña

Ejecuta esto en Node.js:

```bash
node -e "const bcrypt=require('bcryptjs');bcrypt.hash('TU_NUEVA_CONTRASEÑA',12).then(h=>console.log(h))"
```

Reemplaza `TU_NUEVA_CONTRASEÑA` con tu nueva contraseña. Copia el hash que se genera.

### Paso 2: Ejecutar SQL en Supabase

Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard) → **SQL Editor** y ejecuta:

```sql
-- Actualizar contraseña por email
UPDATE users
SET password_hash = '$2a$12$TU_HASH_AQUI'
WHERE email = 'tu_email@ejemplo.com';

-- O actualizar por cédula
UPDATE users
SET password_hash = '$2a$12$TU_HASH_AQUI'
WHERE cedula = '1234567890';

-- O actualizar por celular
UPDATE users
SET password_hash = '$2a$12$TU_HASH_AQUI'
WHERE celular = '3001234567';
```

**⚠️ Importante:**
- Reemplaza `$2a$12$TU_HASH_AQUI` con el hash bcrypt que generaste en el Paso 1
- Reemplaza el identificador (email, cédula o celular) con el del usuario correcto

### Paso 3: Verificar

```sql
SELECT id, nombre_completo, email, es_admin 
FROM users 
WHERE email = 'tu_email@ejemplo.com';
```

---

## 🔒 Seguridad

**⚠️ Recomendaciones:**
- Usa contraseñas seguras (mínimo 8 caracteres)
- Incluye mayúsculas, minúsculas, números y símbolos
- No compartas las contraseñas
- Considera cambiar las contraseñas periódicamente
- Para usuarios admin, usa contraseñas especialmente seguras

---

## ❓ Solución de Problemas

### Error: "Usuario no encontrado"
- Verifica que el email, cédula o celular sean correctos
- Asegúrate de que el usuario exista en la base de datos
- Verifica que no haya espacios extras en el identificador

### Error: "Variables de entorno no configuradas"
- Verifica que tengas `.env.local` con las variables de Supabase
- Asegúrate de que `NEXT_PUBLIC_SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` estén configuradas

### Error: "Cannot find module"
- Instala las dependencias: `npm install`
- Asegúrate de tener `bcryptjs` y `dotenv` instalados

### La contraseña no funciona después de actualizar
- Verifica que hayas usado el hash correcto
- Asegúrate de que el hash bcrypt tenga 12 salt rounds
- Verifica que no haya espacios extras en el hash

---

## 📚 Recursos Adicionales

- [Documentación de Supabase](https://supabase.com/docs)
- [Guía de Crear Admin](docs/CREAR_ADMIN.md)
- [bcryptjs Documentation](https://www.npmjs.com/package/bcryptjs)
