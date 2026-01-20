# 🌐 Configurar Acceso Público desde Cualquier Red

Guía para configurar la aplicación para que los links de registro funcionen desde **cualquier red** (internet público), permitiendo que usuarios accedan desde cualquier lugar del mundo.

## 🎯 Objetivo

Permitir que los links de registro funcionen desde **cualquier dispositivo y cualquier red**, no solo desde la misma WiFi.

## ✅ Solución Recomendada: ngrok (Túnel Público)

### Ventajas de ngrok:
- ✅ **Funciona desde cualquier red** (internet público)
- ✅ **URL pública HTTPS** (más seguro)
- ✅ **Fácil de configurar** (gratis para desarrollo)
- ✅ **Compatible con móviles** (Android, iOS, tablets)
- ✅ **No requiere firewall** ni configuración de red

### Opción 1: Script Automatizado (Más Fácil) ⭐

**Paso 1: Instalar ngrok**

**Windows (con Chocolatey):**
```powershell
choco install ngrok
```

**macOS:**
```bash
brew install ngrok
```

**O descarga desde:**
https://ngrok.com/download

**Paso 2: Configurar token de ngrok (solo una vez)**

1. Crea una cuenta gratis en [ngrok.com](https://ngrok.com)
2. Obtén tu auth token de: https://dashboard.ngrok.com/get-started/your-authtoken
3. Configura el token:
```bash
ngrok config add-authtoken TU_AUTH_TOKEN
```

**Paso 3: Iniciar servidor con túnel automático**

```bash
npm run dev:tunnel
```

Este script:
- ✅ Inicia ngrok automáticamente
- ✅ Obtiene la URL pública
- ✅ Actualiza `.env.local` automáticamente
- ✅ Inicia el servidor Next.js
- ✅ Los links generados usarán la URL pública automáticamente

**¡Listo!** Los links generados funcionarán desde cualquier red.

---

### Opción 2: Manual (Más Control)

**Paso 1: Instalar ngrok** (igual que arriba)

**Paso 2: Configurar token** (igual que arriba)

**Paso 3: Iniciar ngrok en una terminal**

```bash
ngrok http 3000
```

Verás algo como:
```
Forwarding  https://abc123-def456.ngrok-free.app -> http://localhost:3000
```

**Paso 4: Copiar la URL de ngrok**

Copia la URL HTTPS que muestra ngrok (ej: `https://abc123-def456.ngrok-free.app`)

**Paso 5: Configurar `.env.local`**

```env
NEXT_PUBLIC_APP_URL=https://abc123-def456.ngrok-free.app
```

**Paso 6: Reiniciar el servidor Next.js**

```bash
# Detén el servidor actual (Ctrl+C)
# Luego reinicia:
npm run dev
```

**¡Listo!** Los links generados usarán la URL pública.

---

## 🔄 Actualización Automática de URL

El código detecta automáticamente la mejor URL a usar:

1. **Si `NEXT_PUBLIC_APP_URL` está configurada**: Usa esa URL (preferida)
2. **Si accedes desde URL pública**: Detecta la URL del request
3. **Fallback**: Usa localhost (solo para desarrollo local)

Esto significa que:
- Si accedes desde `https://abc123.ngrok-free.app/admin`, los links usarán esa URL
- Si accedes desde `http://192.168.1.100:3000/admin`, los links usarán esa IP
- Si no hay nada configurado, usará localhost

---

## 📝 Ejemplo de Uso

**1. Iniciar servidor con túnel:**
```bash
npm run dev:tunnel
```

**2. Acceder al panel admin:**
```
Abre: https://abc123-def456.ngrok-free.app/admin
```

**3. Generar links:**
- Ve a "Links de Registro"
- Genera los links que necesites
- Los links tendrán el formato: `https://abc123-def456.ngrok-free.app/registro?t=TOKEN`

**4. Compartir links:**
- Los links funcionarán desde **cualquier dispositivo**
- Desde **cualquier red** (WiFi, datos móviles, etc.)
- En **cualquier parte del mundo**

---

## ⚠️ Notas Importantes

### URL Temporal (Plan Gratuito de ngrok)
- ❌ La URL cambia cada vez que reinicias ngrok
- ✅ **Solución**: Usa el script `npm run dev:tunnel` que actualiza automáticamente
- ✅ **Alternativa**: Plan pago de ngrok para URL fija (ej: `https://mundialpredict.ngrok.io`)

### Límites del Plan Gratuito
- ✅ Suficiente para desarrollo y pruebas
- ✅ Funciona perfectamente para compartir links temporalmente
- ⚠️ URL cambia al reiniciar (solucionado con el script)

### Para Producción
Si necesitas URLs permanentes, considera:
- **Vercel** (gratis): `https://mundialpredict.vercel.app`
- **Netlify** (gratis): `https://mundialpredict.netlify.app`
- **Dominio personalizado**: Configurar DNS

---

## 🆚 Comparación de Opciones

| Opción | Acceso | Configuración | Recomendado Para |
|--------|--------|---------------|------------------|
| **IP Local** | Misma WiFi | Fácil | Desarrollo rápido |
| **ngrok** | Cualquier red | Fácil | Pruebas y compartir |
| **Vercel/Netlify** | Cualquier red | Media | Producción |
| **Dominio propio** | Cualquier red | Avanzada | Producción profesional |

---

## 🔧 Solución de Problemas

### "ngrok: command not found"

**Solución:**
1. Asegúrate de haber instalado ngrok
2. Verifica que esté en tu PATH
3. En Windows, reinicia PowerShell después de instalar

### "ERR_NGROK_3200" o "authtoken required"

**Solución:**
```bash
ngrok config add-authtoken TU_AUTH_TOKEN
```
Obtén tu token en: https://dashboard.ngrok.com/get-started/your-authtoken

### La URL sigue cambiando

**Solución:**
- Usa `npm run dev:tunnel` que actualiza automáticamente
- O considera el plan pago de ngrok para URL fija

### Los links no funcionan desde otro dispositivo

**Verifica:**
1. ✅ El servidor Next.js está corriendo
2. ✅ ngrok está activo y muestra la URL
3. ✅ `.env.local` tiene `NEXT_PUBLIC_APP_URL` configurada con la URL de ngrok
4. ✅ El servidor fue reiniciado después de cambiar `.env.local`

---

## 🚀 Próximos Pasos

Una vez configurado ngrok:
1. ✅ Los links funcionarán desde cualquier red
2. ✅ Puedes compartirlos con usuarios en cualquier lugar
3. ✅ Funciona en móviles sin necesidad de estar en la misma WiFi
4. ✅ HTTPS automático (más seguro)

**Para producción permanente**, considera desplegar a:
- **Vercel** (recomendado para Next.js): https://vercel.com
- **Netlify**: https://netlify.com

---

**¿Necesitas ayuda?** Revisa la documentación de ngrok: https://ngrok.com/docs
