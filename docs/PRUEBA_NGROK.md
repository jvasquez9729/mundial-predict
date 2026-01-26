# ✅ Prueba Rápida de ngrok

## Paso 1: Verificar que ngrok está funcionando

Abre una terminal y ejecuta:

```powershell
ngrok http 3000
```

**Espera unos segundos** y deberías ver algo como:

```
Session Status                online
Account                       tu-email@example.com (Plan: Free)
Version                       3.24.0
Region                        United States (us)
Latency                       45ms
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123-def456.ngrok-free.app -> http://localhost:3000

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

**Copia la URL "Forwarding"** (ej: `https://abc123-def456.ngrok-free.app`)

## Paso 2: Probar el túnel

Mientras ngrok está corriendo (no lo cierres):

1. **Inicia tu servidor Next.js** en otra terminal:
   ```powershell
   npm run dev
   ```

2. **Abre la URL de ngrok** en tu navegador:
   ```
   https://abc123-def456.ngrok-free.app
   ```

3. **Deberías ver tu aplicación** funcionando normalmente

## Paso 3: Usar el script automatizado

Una vez que confirmaste que ngrok funciona, puedes usar el script automatizado:

```bash
npm run dev:tunnel
```

Este script:
- ✅ Inicia ngrok automáticamente
- ✅ Obtiene la URL pública
- ✅ Actualiza `.env.local` automáticamente
- ✅ Inicia el servidor Next.js
- ✅ Los links generados usarán la URL pública automáticamente

## ✅ ¡Listo!

Ahora los links de registro funcionarán desde **cualquier red** (internet público) 🎉
