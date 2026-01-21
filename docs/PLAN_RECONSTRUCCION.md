# Plan de Reconstrucción - Administración de Usuarios

## ¿Qué eliminar?

Opciones:

### Opción 1: Solo archivos problemáticos (RECOMENDADO)
- `app/api/admin/users/[id]/route.ts` - Archivo con errores de TypeScript
- `app/api/admin/reports/users/route.ts` - Archivo con errores de TypeScript

### Opción 2: Toda la funcionalidad de admin
- `app/api/admin/users/` - Toda la carpeta
- `app/api/admin/reports/users/` - Solo el reporte de usuarios
- `app/admin/usuarios/` - La página de administración (opcional)

### Opción 3: Todo desde cero
- Eliminar todo y empezar con estructura limpia

## Pasos para reconstruir

1. **Backup**: Los archivos se guardarán en `.backup/admin-users/`
2. **Eliminación**: Se eliminarán los archivos problemáticos
3. **Reconstrucción**: Se crearán archivos nuevos desde cero con:
   - Tipos TypeScript correctos
   - Validación Zod correcta
   - Queries de Supabase correctas
   - Manejo de errores adecuado

## ¿Qué conservar?

- Configuración de base de datos (migraciones)
- Autenticación y sesiones
- Componentes de UI
- Otros endpoints de API
- Funcionalidades de predicciones

## Decisiones

¿Quieres eliminar solo los archivos problemáticos o toda la funcionalidad de admin?
