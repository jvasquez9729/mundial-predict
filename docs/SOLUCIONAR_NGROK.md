# 🔧 Solucionar Problemas con ngrok

## ❌ Error: Endpoint ya está online

**Error:**
```
ERROR: failed to start tunnel: The endpoint 'https://...' is already online.
ERR_NGROK_334
```

**Causa:** Ya hay un túnel ngrok activo corriendo.

**Solución 1: Detener el túnel existente (Recomendado)**

1. **Encuentra el proceso ngrok:**
   ```powershell
   Get-Process -Name ngrok
   ```

2. **Detén el proceso:**
   ```powershell
   Stop-Process -Name ngrok -Force
   ```

3. **O usa Task Manager:**
   - Presiona `Ctrl + Shift + Esc`
   - Busca "ngrok" en los procesos
   - Haz clic derecho → "Finalizar tarea"

4. **Luego inicia ngrok de nuevo:**
   ```powershell
   ngrok http 3000
   ```

**Solución 2: Usar el túnel existente**

Si el túnel existente ya funciona, puedes usarlo directamente:

1. **Busca la URL del túnel existente** (debería estar visible en la terminal donde lo iniciaste)
2. **Actualiza `.env.local`** con esa URL:
   ```env
   NEXT_PUBLIC_APP_URL=https://coriaceous-ryker-unprogressed.ngrok-free.dev
   ```
3. **Reinicia tu servidor Next.js**

**Solución 3: Usar múltiples túneles (Pooling)**

Si necesitas múltiples túneles activos:

```powershell
ngrok http 3000 --pooling-enabled
```

Pero normalmente **no necesitas esto**, solo un túnel es suficiente.

---

## 🔍 Verificar si ngrok está corriendo

**Windows PowerShell:**
```powershell
Get-Process -Name ngrok
```

**O ver todas las conexiones al puerto 3000:**
```powershell
netstat -ano | findstr :3000
```

---

## ✅ Flujo Recomendado

**1. Detener cualquier ngrok existente:**
```powershell
Stop-Process -Name ngrok -Force -ErrorAction SilentlyContinue
```

**2. Iniciar ngrok:**
```powershell
ngrok http 3000
```

**3. Copiar la URL que muestra ngrok** (ej: `https://abc123.ngrok-free.app`)

**4. Usar esa URL en tu aplicación**

---

## 💡 Usar el Script Automatizado

El script `npm run dev:tunnel` maneja esto automáticamente:

```bash
npm run dev:tunnel
```

Este script:
- ✅ Detiene ngrok existente si está corriendo
- ✅ Inicia un nuevo túnel
- ✅ Obtiene la URL automáticamente
- ✅ Actualiza `.env.local`
- ✅ Inicia el servidor Next.js

**Recomendado usar el script en lugar de ngrok manual** 👍
