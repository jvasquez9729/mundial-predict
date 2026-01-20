# 🔒 Configuración HTTPS/SSL/TLS

Guía completa para configurar y verificar HTTPS/SSL/TLS en Mundial Predict.

## 📋 Estado de HTTPS

### ✅ Headers de Seguridad Implementados

La aplicación incluye los siguientes headers de seguridad:

1. **HSTS (HTTP Strict Transport Security)**: Fuerza HTTPS durante 1 año
2. **X-Frame-Options**: Previene clickjacking
3. **X-Content-Type-Options**: Previene MIME type sniffing
4. **X-XSS-Protection**: Protección contra XSS
5. **Referrer-Policy**: Controla qué información de referrer se envía
6. **Permissions-Policy**: Controla qué características del navegador están disponibles
7. **Content-Security-Policy**: Política de seguridad de contenido
8. **Upgrade-Insecure-Requests**: Actualiza automáticamente HTTP a HTTPS

### ✅ Redirecciones HTTP → HTTPS

El middleware redirige automáticamente todas las solicitudes HTTP a HTTPS en producción.

## 🚀 Configuración por Plataforma

### Vercel (Recomendado)

**Vercel proporciona HTTPS automáticamente** para todos los dominios. No necesitas configuración adicional.

#### Pasos:

1. **Conecta tu dominio:**
   - Ve a tu proyecto en [Vercel Dashboard](https://vercel.com/dashboard)
   - Settings → Domains
   - Agrega tu dominio personalizado

2. **Verifica HTTPS:**
   - Vercel automáticamente:
     - Obtiene un certificado SSL de Let's Encrypt
     - Configura HTTPS
     - Redirige HTTP a HTTPS
     - Renueva certificados automáticamente

3. **DNS Configuration:**
   - Configura tus registros DNS según las instrucciones de Vercel
   - Espera la propagación DNS (puede tomar hasta 48 horas)
   - Verifica que el certificado SSL se haya emitido

#### Verificación:

```bash
# Verificar HTTPS
curl -I https://tu-dominio.com

# Verificar redirección HTTP → HTTPS
curl -I http://tu-dominio.com

# Debe responder con 301 o 302 redirect a HTTPS
```

### Otros Hostings (VPS, Servidor Dedicado, etc.)

Si no estás usando Vercel, necesitas configurar SSL manualmente.

#### Opción 1: Let's Encrypt con Certbot (Recomendado - Gratis)

**Requisitos:**
- Acceso SSH al servidor
- Dominio apuntando al servidor
- Servidor web (Nginx o Apache)

**Pasos con Nginx:**

1. **Instalar Certbot:**
   ```bash
   # Ubuntu/Debian
   sudo apt update
   sudo apt install certbot python3-certbot-nginx

   # CentOS/RHEL
   sudo yum install certbot python3-certbot-nginx
   ```

2. **Obtener certificado:**
   ```bash
   sudo certbot --nginx -d tu-dominio.com -d www.tu-dominio.com
   ```

3. **Configurar Nginx para HTTPS:**
   ```nginx
   server {
       listen 80;
       server_name tu-dominio.com www.tu-dominio.com;
       return 301 https://$server_name$request_uri;
   }

   server {
       listen 443 ssl http2;
       server_name tu-dominio.com www.tu-dominio.com;

       ssl_certificate /etc/letsencrypt/live/tu-dominio.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/tu-dominio.com/privkey.pem;
       
       # Seguridad SSL
       ssl_protocols TLSv1.2 TLSv1.3;
       ssl_ciphers HIGH:!aNULL:!MD5;
       ssl_prefer_server_ciphers on;
       
       # HSTS
       add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

4. **Renovación automática:**
   ```bash
   # Certbot configurará automáticamente la renovación
   # Verificar con:
   sudo certbot renew --dry-run
   ```

#### Opción 2: Cloudflare (Recomendado - CDN + SSL)

**Ventajas:**
- SSL gratuito automático
- CDN global
- Protección DDoS
- Analytics

**Pasos:**

1. **Crear cuenta en Cloudflare:**
   - Ve a [Cloudflare](https://cloudflare.com)
   - Crea una cuenta gratuita

2. **Agregar tu dominio:**
   - Agrega tu dominio a Cloudflare
   - Cambia tus nameservers según las instrucciones

3. **Configurar SSL:**
   - SSL/TLS → Overview
   - Modo: **Full (estricto)** o **Full**
   - Siempre usar HTTPS: **ON**

4. **Configurar DNS:**
   - DNS → Records
   - Agrega un registro A apuntando a tu servidor
   - Agrega un registro CNAME para www si es necesario

### Desarrollo Local

Para desarrollo local con HTTPS:

#### Opción 1: mkcert (Recomendado)

1. **Instalar mkcert:**
   ```bash
   # Windows (con Chocolatey)
   choco install mkcert

   # macOS
   brew install mkcert

   # Linux
   sudo apt install libnss3-tools
   wget https://github.com/FiloSottile/mkcert/releases/latest/download/mkcert-v1.4.4-linux-amd64
   chmod +x mkcert-v1.4.4-linux-amd64
   sudo mv mkcert-v1.4.4-linux-amd64 /usr/local/bin/mkcert
   ```

2. **Generar certificados locales:**
   ```bash
   mkcert -install
   mkcert localhost 127.0.0.1 ::1
   ```

3. **Configurar Next.js para HTTPS local:**
   
   Crea `server.js` en la raíz del proyecto:
   ```javascript
   const { createServer } = require('https')
   const { parse } = require('url')
   const next = require('next')
   const fs = require('fs')
   const path = require('path')

   const dev = process.env.NODE_ENV !== 'production'
   const hostname = 'localhost'
   const port = 3000

   const app = next({ dev, hostname, port })
   const handle = app.getRequestHandler()

   const httpsOptions = {
     key: fs.readFileSync(path.join(__dirname, 'localhost-key.pem')),
     cert: fs.readFileSync(path.join(__dirname, 'localhost.pem')),
   }

   app.prepare().then(() => {
     createServer(httpsOptions, async (req, res) => {
       try {
         const parsedUrl = parse(req.url, true)
         await handle(req, res, parsedUrl)
       } catch (err) {
         console.error('Error occurred handling', req.url, err)
         res.statusCode = 500
         res.end('internal server error')
       }
     }).listen(port, (err) => {
       if (err) throw err
       console.log(`> Ready on https://${hostname}:${port}`)
     })
   })
   ```

   Actualiza `package.json`:
   ```json
   {
     "scripts": {
       "dev:https": "node server.js"
     }
   }
   ```

   Ejecuta:
   ```bash
   npm run dev:https
   ```

#### Opción 2: Usar HTTP en desarrollo (Por defecto)

Para desarrollo local, HTTP es aceptable. Los headers de seguridad HTTPS solo se aplican en producción.

## 🔍 Verificación de HTTPS

### 1. Verificar Certificado SSL

**Navegador:**
- Abre tu sitio en el navegador
- Haz clic en el candado 🔒 en la barra de direcciones
- Verifica que el certificado sea válido
- Revisa los detalles del certificado

**Línea de comandos:**
```bash
# Verificar certificado
openssl s_client -connect tu-dominio.com:443 -servername tu-dominio.com

# Verificar con curl
curl -vI https://tu-dominio.com
```

### 2. Verificar Headers de Seguridad

**Herramientas online:**
- [SecurityHeaders.com](https://securityheaders.com/) - Escanea tus headers de seguridad
- [SSL Labs](https://www.ssllabs.com/ssltest/) - Prueba SSL/TLS
- [Mozilla Observatory](https://observatory.mozilla.org/) - Análisis de seguridad

**Línea de comandos:**
```bash
# Ver todos los headers
curl -I https://tu-dominio.com

# Verificar HSTS
curl -I https://tu-dominio.com | grep -i strict-transport

# Verificar CSP
curl -I https://tu-dominio.com | grep -i content-security-policy
```

### 3. Verificar Redirección HTTP → HTTPS

```bash
# Debe redirigir a HTTPS
curl -I http://tu-dominio.com

# Respuesta esperada:
# HTTP/1.1 301 Moved Permanently
# Location: https://tu-dominio.com/...
```

### 4. Verificar en Desarrollo

Si configuraste HTTPS local:
```bash
# Debe funcionar sin warnings
curl -kI https://localhost:3000
```

## 🛡️ Headers de Seguridad Explicados

### Strict-Transport-Security (HSTS)
```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```
- Fuerza el navegador a usar solo HTTPS
- Válido por 1 año (31536000 segundos)
- Aplica a todos los subdominios
- `preload` permite incluir en lista HSTS del navegador

### Content-Security-Policy (CSP)
Controla qué recursos puede cargar tu sitio:
- `default-src 'self'`: Solo recursos del mismo origen
- `script-src`: Orígenes permitidos para scripts
- `style-src`: Orígenes permitidos para estilos
- `img-src`: Orígenes permitidos para imágenes
- `connect-src`: Orígenes permitidos para conexiones (APIs)
- `upgrade-insecure-requests`: Actualiza HTTP a HTTPS

### X-Frame-Options
```
X-Frame-Options: DENY
```
- Previene que tu sitio sea embebido en iframes
- Protege contra clickjacking

### X-Content-Type-Options
```
X-Content-Type-Options: nosniff
```
- Previene que el navegador "adivine" el tipo MIME
- Fuerza respetar el Content-Type del servidor

### Referrer-Policy
```
Referrer-Policy: strict-origin-when-cross-origin
```
- Controla qué información de referrer se envía
- Balance entre privacidad y funcionalidad

## 🔧 Solución de Problemas

### "Sitio no seguro" en el navegador

**Causas posibles:**
1. Certificado inválido o expirado
2. Certificado no coincide con el dominio
3. Cadena de certificados incompleta

**Solución:**
- Verifica el certificado con `openssl s_client`
- Asegúrate de que el certificado incluya tu dominio
- Renueva el certificado si está expirado

### Error "NET::ERR_CERT_COMMON_NAME_INVALID"

**Causa:** El certificado no coincide con el dominio accedido.

**Solución:**
- Asegúrate de que el certificado incluya el dominio exacto
- Si usas www y no-www, incluye ambos en el certificado

### Headers no se aplican

**Causa:** Los headers solo se aplican en producción.

**Solución:**
- Verifica que `NODE_ENV=production`
- Revisa la configuración en `next.config.mjs`
- Verifica que el middleware esté funcionando

### Redirección infinita

**Causa:** Loop de redirección HTTP → HTTPS.

**Solución:**
- Verifica la configuración del proxy/balanceador
- Asegúrate de que el header `X-Forwarded-Proto` esté configurado correctamente
- Revisa la configuración de Nginx/Apache

## 📚 Recursos Adicionales

- [Mozilla SSL Configuration Generator](https://ssl-config.mozilla.org/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [OWASP Secure Headers Project](https://owasp.org/www-project-secure-headers/)
- [Vercel SSL Documentation](https://vercel.com/docs/security/encryption)
- [Next.js Security Headers](https://nextjs.org/docs/advanced-features/security-headers)

## ✅ Checklist de Verificación

- [ ] HTTPS habilitado en producción
- [ ] Certificado SSL válido y no expirado
- [ ] Redirección HTTP → HTTPS funcionando
- [ ] HSTS configurado y funcionando
- [ ] Todos los headers de seguridad aplicados
- [ ] Certificado incluye todos los subdominios necesarios
- [ ] Renovación automática configurada (Let's Encrypt)
- [ ] Sitio verificado en SSL Labs (calificación A o A+)
- [ ] Headers verificados en SecurityHeaders.com
- [ ] Sin warnings de seguridad en el navegador

---

**Nota:** Si estás usando Vercel, HTTPS está configurado automáticamente. Solo necesitas verificar que funcione correctamente siguiendo los pasos de verificación arriba.
