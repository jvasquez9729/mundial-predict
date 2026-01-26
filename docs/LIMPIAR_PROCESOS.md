# 🧹 Limpiar Procesos y Preparar Entorno

## ❌ Problema: Puerto 3000 en uso o lockfile bloqueando

**Error típico:**
```
⚠ Port 3000 is in use by process 18444
Unable to acquire lock at .next\dev\lock
```

## ✅ Solución Rápida

### Paso 1: Detener todos los procesos

**PowerShell:**
```powershell
# Detener procesos de Node.js y ngrok
Get-Process | Where-Object {$_.ProcessName -eq "node" -or $_.ProcessName -eq "ngrok"} | Stop-Process -Force
```

**O detener proceso específico por ID:**
```powershell
Stop-Process -Id 18444 -Force
```

### Paso 2: Eliminar lockfile

```powershell
Remove-Item ".next\dev\lock" -Force -ErrorAction SilentlyContinue
```

### Paso 3: Verificar puerto 3000

```powershell
netstat -ano | findstr :3000
```

Si muestra algún proceso, deténlo:
```powershell
# Reemplaza PID con el número del proceso
taskkill /F /PID PID
```

### Paso 4: Reiniciar servidor

Ahora puedes iniciar el servidor:

```powershell
npm run dev
```

O con túnel público:

```powershell
npm run dev:tunnel
```

## 🔄 Script Automatizado

También puedes usar el script de limpieza:

```powershell
node scripts/clean-start.js
```

Luego ejecuta:

```powershell
npm run dev
```

## ⚠️ Si el Problema Persiste

1. **Cierra todas las terminales** que tengan procesos corriendo
2. **Reinicia tu terminal** (PowerShell)
3. **Vuelve a intentar**

## 💡 Consejo

Antes de iniciar el servidor, siempre verifica:
```powershell
# Ver qué está usando el puerto 3000
netstat -ano | findstr :3000

# Si hay algo, deténlo antes de iniciar
```
