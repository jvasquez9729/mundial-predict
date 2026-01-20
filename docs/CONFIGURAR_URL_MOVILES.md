# 📱 Configurar URL para Dispositivos Móviles

Guía para configurar la aplicación para que funcione correctamente en dispositivos móviles (Android e iOS).

> **💡 Para acceso desde CUALQUIER RED (internet público):**
> Lee: [`CONFIGURAR_ACCESO_PUBLICO.md`](./CONFIGURAR_ACCESO_PUBLICO.md) ⭐

## ❌ Problema Común

Cuando generas links de registro, si usas `localhost:3000`, los links **NO funcionarán en dispositivos móviles** porque `localhost` en un móvil se refiere al propio dispositivo móvil, no a tu computadora.

**Error típico:**
```
ERR_CONNECTION_FAILED
No se puede acceder a localhost:3000
```

## ✅ Soluciones

> **💡 Si quieres que los links funcionen desde CUALQUIER RED (recomendado):**
> - Lee: [`CONFIGURAR_ACCESO_PUBLICO.md`](./CONFIGURAR_ACCESO_PUBLICO.md)
> - O usa: `npm run dev:tunnel` (configura ngrok automáticamente)

### Opción 1: Usar la IP Local de tu Computadora (Desarrollo)

**Paso 1: Encuentra tu IP local**

**Windows:**
```powershell
ipconfig
# Busca "Dirección IPv4" en la sección de tu adaptador WiFi/Ethernet
# Ejemplo: 192.168.1.100
```

**macOS/Linux:**
```bash
ifconfig | grep "inet "
# O más simple:
ip addr show
# Busca la IP que no sea 127.0.0.1
# Ejemplo: 192.168.1.100
```

**Paso 2: Configura `.env.local`**

```env
# En lugar de localhost, usa tu IP local
NEXT_PUBLIC_APP_URL=http://192.168.1.100:3000

# Reemplaza 192.168.1.100 con TU IP real
```

**Paso 3: Inicia el servidor con acceso desde la red**

**Windows (PowerShell):**
```powershell
# Por defecto Next.js ya permite conexiones desde la red
npm run dev
```

**macOS/Linux:**
```bash
# Next.js permite conexiones desde la red por defecto
npm run dev
```

Si no funciona, inicia con host 0.0.0.0:
```bash
npm run dev -- -H 0.0.0.0
```

O actualiza `package.json`:
```json
{
  "scripts": {
    "dev": "next dev -H 0.0.0.0"
  }
}
```

**Paso 4: Asegúrate que el móvil esté en la misma red WiFi**

- El dispositivo móvil debe estar conectado a la **misma red WiFi** que tu computadora
- Abre los links generados en el móvil usando: `http://192.168.1.100:3000/registro?t=TOKEN`

### Opción 2: Usar un Túnel (ngrok) - Recomendado para Pruebas

**Ventajas:**
- Funciona desde cualquier red (no necesitas estar en la misma WiFi)
- URL pública que funciona en cualquier dispositivo
- Perfecto para compartir con otros

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

**Paso 2: Registrarse en ngrok (gratis)**

1. Ve a [ngrok.com](https://ngrok.com)
2. Crea una cuenta gratuita
3. Obtén tu auth token de la dashboard

**Paso 3: Configurar ngrok**

```bash
# Configurar token (solo una vez)
ngrok config add-authtoken TU_AUTH_TOKEN
```

**Paso 4: Crear túnel**

```bash
# En una terminal separada, mientras el servidor Next.js está corriendo
ngrok http 3000
```

**Paso 5: Copiar la URL de ngrok**

Ngrok te mostrará algo como:
```
Forwarding  https://abc123.ngrok-free.app -> http://localhost:3000
```

**Paso 6: Configurar `.env.local`**

```env
# Usa la URL de ngrok (HTTPS recomendado)
NEXT_PUBLIC_APP_URL=https://abc123.ngrok-free.app
```

**Nota:** La URL de ngrok cambia cada vez que lo reinicias (en el plan gratuito). Para tener una URL fija, necesitas el plan pago o usar otra solución.

### Opción 3: Desplegar a Vercel/Netlify (Producción)

**Ventajas:**
- URL permanente (ej: `https://mundialpredict.vercel.app`)
- HTTPS automático
- Funciona desde cualquier lugar

**Paso 1: Desplegar a Vercel**

```bash
# Instalar Vercel CLI
npm i -g vercel

# Hacer login
vercel login

# Desplegar
vercel
```

**Paso 2: Configurar variables de entorno en Vercel**

1. Ve a tu proyecto en [vercel.com/dashboard](https://vercel.com/dashboard)
2. Settings → Environment Variables
3. Agrega todas las variables de `.env.local`

**Paso 3: Obtener URL de producción**

Vercel te dará una URL como: `https://mundial-predict.vercel.app`

**Paso 4: Configurar `.env.local` (para desarrollo local)**

```env
# URL de producción para los links
NEXT_PUBLIC_APP_URL=https://mundial-predict.vercel.app
```

O mejor aún, configúralo directamente en las variables de entorno de Vercel.

### Opción 4: Usar tu Dominio Personalizado

Si tienes un dominio (ej: `mundialpredict.com`):

**Paso 1: Configurar DNS**

Apunta tu dominio a Vercel o tu servidor según corresponda.

**Paso 2: Configurar `.env.local`**

```env
NEXT_PUBLIC_APP_URL=https://mundialpredict.com
```

## 🔧 Detección Automática Mejorada

El código ahora intenta detectar automáticamente la URL correcta:

1. **Si `NEXT_PUBLIC_APP_URL` está configurado**: Usa esa URL
2. **Si no está configurado**: Intenta usar el `host` del request HTTP
3. **Fallback**: Usa `localhost:3000`

Esto significa que si accedes desde tu móvil usando la IP local (ej: `http://192.168.1.100:3000/admin`), los links generados usarán esa misma IP automáticamente.

## 🧪 Probar los Links

**En tu computadora:**
```bash
# Inicia el servidor
npm run dev

# Verifica la IP local
ipconfig  # Windows
ifconfig  # macOS/Linux
```

**En tu móvil:**

1. **Opción A: IP local**
   - Asegúrate de estar en la misma WiFi
   - Abre: `http://TU_IP:3000/admin`
   - Genera links
   - Los links funcionarán con la IP correcta

2. **Opción B: ngrok**
   - Abre: `https://abc123.ngrok-free.app/admin`
   - Genera links
   - Los links funcionarán desde cualquier lugar

3. **Opción C: Producción**
   - Abre: `https://mundialpredict.com/admin`
   - Genera links
   - Los links funcionarán globalmente

## ⚠️ Problemas Comunes

### "ERR_CONNECTION_FAILED" en móvil

**Causa:** Usando `localhost` en lugar de IP o URL pública.

**Solución:**
- Usa tu IP local: `http://192.168.1.100:3000`
- O usa ngrok: `https://abc123.ngrok-free.app`
- O despliega a producción

### "ERR_NETWORK_CHANGED" o timeout

**Causa:** El móvil no está en la misma red WiFi.

**Solución:**
- Asegúrate que ambos dispositivos estén en la misma WiFi
- O usa ngrok para acceso público

### Firewall bloquea conexiones

**Windows:**
1. Abre "Windows Defender Firewall"
2. "Permitir una app o característica"
3. Busca Node.js y permite tráfico privado

**macOS:**
El firewall generalmente no bloquea conexiones entrantes para desarrollo.

**Linux:**
```bash
# Permitir puerto 3000
sudo ufw allow 3000
```

### Los links siguen usando localhost

**Causa:** La variable `NEXT_PUBLIC_APP_URL` no se está actualizando.

**Solución:**
1. Actualiza `.env.local` con la URL correcta
2. **Reinicia el servidor** (detén con Ctrl+C y vuelve a iniciar)
3. Las variables `NEXT_PUBLIC_*` solo se cargan al iniciar

### La URL cambia cada vez (ngrok free)

**Causa:** Plan gratuito de ngrok genera URLs temporales.

**Solución:**
- Usa el plan pago de ngrok para URL fija
- O despliega a Vercel (gratis) para URL permanente
- O configura la IP local como estática en tu router

## 📝 Resumen Rápido

**Para desarrollo rápido con móviles:**

```bash
# 1. Encuentra tu IP
ipconfig  # Windows
ifconfig  # macOS/Linux

# 2. Actualiza .env.local
echo "NEXT_PUBLIC_APP_URL=http://TU_IP:3000" >> .env.local

# 3. Reinicia el servidor
npm run dev

# 4. Accede desde móvil en la misma WiFi
# http://TU_IP:3000/admin
```

**Para producción:**

```env
NEXT_PUBLIC_APP_URL=https://mundialpredict.com
```

O configura directamente en las variables de entorno de tu plataforma de hosting (Vercel, Netlify, etc.).

---

**¿Todavía tienes problemas?** Verifica:
- ✅ `NEXT_PUBLIC_APP_URL` está configurada correctamente
- ✅ El servidor fue reiniciado después de cambiar `.env.local`
- ✅ El móvil puede acceder a la URL (prueba abriendo la URL directamente en el navegador del móvil)
- ✅ No hay firewall bloqueando el puerto 3000
- ✅ Ambos dispositivos están en la misma red WiFi (si usas IP local)
