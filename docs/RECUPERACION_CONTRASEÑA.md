# 🔐 Sistema de Recuperación de Contraseña

Guía para el sistema de recuperación de contraseña implementado en Mundial Predict.

## 📋 Características

### Para Usuarios:
- **Solicitar recuperación de contraseña** usando correo, cédula o celular
- **Recibir enlace de recuperación** por correo electrónico
- **Restablecer contraseña** con token seguro (válido por 1 hora)

### Para Administradores:
- **Editar usuarios**: Modificar nombre, email, cédula, celular, contraseña y rol
- **Eliminar usuarios**: Eliminar usuarios del sistema (excepto si es el único admin)
- **Búsqueda avanzada**: Buscar por nombre, email, cédula o celular

## 🗄️ Migración de Base de Datos

**IMPORTANTE:** Debes ejecutar esta migración SQL en Supabase antes de usar la recuperación de contraseña:

### Paso 1: Ejecutar migración SQL

Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard) → **SQL Editor** y ejecuta:

```sql
-- Mundial Predict - Tabla para tokens de recuperación de contraseña
-- Ejecutar en Supabase SQL Editor

-- ============================================
-- TABLA: password_reset_tokens
-- ============================================
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  usado BOOLEAN DEFAULT FALSE,
  creado_en TIMESTAMPTZ DEFAULT NOW(),
  expira_en TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expira_en ON password_reset_tokens(expira_en);

-- Limpiar tokens expirados automáticamente (opcional - puede ejecutarse manualmente o con cron)
CREATE OR REPLACE FUNCTION clean_expired_password_tokens()
RETURNS void AS $$
BEGIN
  DELETE FROM password_reset_tokens
  WHERE expira_en < NOW() OR usado = TRUE;
END;
$$ LANGUAGE plpgsql;
```

O ejecuta directamente el archivo:

```bash
# Ejecuta en Supabase SQL Editor
cat supabase/migrations/003_password_reset_tokens.sql
```

## 🔄 Flujo de Recuperación de Contraseña

### 1. Usuario solicita recuperación

1. Usuario va a `/login` y hace clic en "¿Olvidaste tu contraseña?"
2. O accede directamente a `/forgot-password`
3. Ingresa su correo, cédula o celular
4. Selecciona el tipo de identificador

### 2. Sistema genera token

1. El sistema busca el usuario en la base de datos
2. Genera un token único y seguro (válido por 1 hora)
3. Invalida tokens anteriores no usados del mismo usuario
4. Guarda el token en la tabla `password_reset_tokens`

### 3. Envío de email

1. El sistema envía un correo electrónico al usuario
2. El correo contiene un enlace: `/reset-password?t=TOKEN`
3. El usuario debe hacer clic en el enlace

### 4. Resetear contraseña

1. El usuario accede a `/reset-password?t=TOKEN`
2. El sistema valida el token:
   - Verifica que existe
   - Verifica que no ha sido usado
   - Verifica que no ha expirado
3. Si el token es válido, muestra formulario para nueva contraseña
4. El usuario ingresa y confirma la nueva contraseña
5. El sistema actualiza la contraseña y marca el token como usado
6. Redirige al login

## 👥 Administración de Usuarios

### Editar Usuario

1. Ve a `/admin/usuarios`
2. Busca el usuario que deseas editar
3. Haz clic en el ícono de editar (✏️)
4. Modifica los campos deseados:
   - Nombre completo
   - Correo electrónico
   - Cédula
   - Celular
   - Contraseña (opcional, deja vacío para no cambiar)
   - Rol de administrador (switch)
5. Haz clic en "Guardar"

**Notas:**
- Los campos vacíos no se actualizan
- Se valida que no haya duplicados (email, cédula, celular)
- No se puede quitar permisos de admin al único administrador

### Eliminar Usuario

1. Ve a `/admin/usuarios`
2. Busca el usuario que deseas eliminar
3. Haz clic en el ícono de eliminar (🗑️)
4. Confirma la eliminación

**Advertencias:**
- No se puede eliminar el único administrador
- Esta acción no se puede deshacer
- Se eliminarán también las predicciones asociadas (si hay foreign keys)

## 🔒 Seguridad

### Protecciones implementadas:

1. **Prevención de enumeración de usuarios**: 
   - Siempre devuelve éxito aunque el usuario no exista
   - Previene que atacantes descubran qué usuarios existen

2. **Tokens seguros**:
   - Generados con `randomBytes(32)` (256 bits)
   - Expiran en 1 hora
   - Se invalidan después de usar
   - Un usuario solo puede tener un token activo a la vez

3. **Validación de contraseñas**:
   - Mínimo 6 caracteres
   - Deben coincidir (confirmación)
   - Hasheadas con bcrypt (12 salt rounds)

4. **Rate limiting**:
   - Los endpoints de auth ya tienen rate limiting
   - Previene abuso y ataques de fuerza bruta

## 📧 Configuración de Email

### Variables de entorno requeridas:

```env
RESEND_API_KEY=tu_api_key_de_resend
NEXT_PUBLIC_APP_URL=http://localhost:3000  # O tu URL de producción
```

### Verificar configuración:

Puedes probar el envío de emails verificando que `RESEND_API_KEY` esté configurada. Si no está configurada, el sistema continuará funcionando pero no enviará emails (por seguridad, siempre devuelve éxito).

## 🧪 Pruebas

### Probar recuperación de contraseña:

1. Ve a `/forgot-password`
2. Ingresa un correo/cédula/celular de un usuario existente
3. Verifica que recibas el correo
4. Haz clic en el enlace del correo
5. Ingresa una nueva contraseña
6. Confirma y verifica que puedas iniciar sesión con la nueva contraseña

### Probar administración:

1. Inicia sesión como administrador
2. Ve a `/admin/usuarios`
3. Busca un usuario
4. Prueba editar sus datos
5. Prueba eliminar un usuario (cuidado: acción permanente)

## ❓ Solución de Problemas

### "No se envía el correo"
- Verifica que `RESEND_API_KEY` esté configurada en `.env.local`
- Verifica que el correo no esté en spam
- Revisa los logs del servidor para ver errores de email

### "Token inválido"
- Verifica que el link completo esté correcto
- Verifica que el token no haya expirado (1 hora)
- Verifica que el token no haya sido usado ya

### "No se puede eliminar el único administrador"
- Esto es por diseño de seguridad
- Crea otro administrador primero
- Luego puedes eliminar o cambiar el rol del primero

### "Error al actualizar usuario"
- Verifica que no haya duplicados (email, cédula, celular ya usados)
- Verifica que los datos sean válidos
- Revisa los logs para más detalles

---

## 📚 Recursos Adicionales

- [Documentación de Resend](https://resend.com/docs)
- [Guía de Administración](docs/CREAR_ADMIN.md)
- [Guía de Actualizar Contraseña](docs/ACTUALIZAR_CONTRASEÑA.md)
