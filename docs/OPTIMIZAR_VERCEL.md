# Optimización de Configuración en Vercel

## Recomendaciones para Resolver Errores de Build

### 1. Habilitar Compilaciones Simultáneas

**Ubicación**: Configuración de implementación → Compilaciones simultáneas bajo demanda

**Por qué**: Si tienes múltiples deployments (producción, preview, desarrollo), esto evita que esperes en cola.

**Cómo habilitar**:
1. Ve a tu proyecto en Vercel Dashboard
2. Settings → Configuration
3. En "Simultaneous on-demand builds", cambia a "Enabled"

### 2. Usar Máquina de Compilación Más Grande

**Ubicación**: Configuración de implementación → Máquina de compilación

**Por qué**: Los builds grandes pueden quedarse sin memoria (como vimos con el error "JavaScript heap out of memory").

**Opciones**:
- **Standard** (actual): 4 vCPU, 8 GB RAM
- **High Performance** (recomendado): 8 vCPU, 16 GB RAM - hasta 40% más rápido

**Cómo cambiar**:
1. Ve a Settings → Configuration
2. En "Build machine", selecciona "High Performance"
3. Nota: Esto puede tener costo adicional en planes gratuitos

### 3. Aumentar Memoria de Build

Si no puedes cambiar la máquina, puedes aumentar la memoria en `package.json`:

```json
{
  "scripts": {
    "build": "NODE_OPTIONS='--max-old-space-size=4096' next build"
  }
}
```

### 4. Node.js Version

✅ Ya está configurado en **24.x** - correcto

### 5. Variables de Entorno

Asegúrate de que todas las variables estén configuradas:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET`
- `NEXT_PUBLIC_APP_URL`

### 6. Configuración de Build en `vercel.json`

Ya está configurado correctamente para cron jobs diarios.

## Soluciones para Errores Específicos

### Error: "JavaScript heap out of memory"

**Solución 1**: Aumentar memoria en package.json
```json
"build": "NODE_OPTIONS='--max-old-space-size=4096' next build"
```

**Solución 2**: Usar máquina de compilación más grande
- Cambiar a "High Performance" en Vercel

### Error: "TypeScript errors"

**Solución**: Ya implementamos tipos explícitos en:
- `app/api/admin/users/[id]/route.ts`
- Verificar que no haya otros archivos con errores

### Error: "Build timeout"

**Solución**: 
- Optimizar dependencias
- Usar máquina de compilación más grande
- Habilitar compilaciones simultáneas

## Configuración Recomendada

### Para Planes Gratuitos:
- ✅ Compilaciones simultáneas: **Deshabilitado** (para evitar límites)
- ✅ Máquina de compilación: **Standard** (incluido)
- ✅ Priorizar compilaciones de producción: **Habilitado** ✅

### Para Planes de Pago:
- ✅ Compilaciones simultáneas: **Habilitado** ✅
- ✅ Máquina de compilación: **High Performance** ✅
- ✅ Priorizar compilaciones de producción: **Habilitado** ✅

## Verificar Build

Después de hacer cambios:

1. Haz un nuevo deploy desde GitHub (git push)
2. Ve a Vercel Dashboard → Deployments
3. Revisa los logs del build
4. Verifica que el build complete exitosamente

## Si el Build Sigue Fallando

1. **Revisa los logs** específicos del error
2. **Verifica variables de entorno** - todas deben estar configuradas
3. **Verifica que TypeScript compile** localmente primero:
   ```bash
   npm run build
   ```
4. **Limpia caché** de Vercel si es necesario:
   - Settings → General → Clear Build Cache
