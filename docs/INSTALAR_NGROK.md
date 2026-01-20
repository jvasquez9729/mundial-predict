# 📥 Instalar ngrok en Windows

Guía rápida para instalar ngrok en Windows.

## ✅ Opción 1: Descarga Manual (Recomendado - Más Fácil)

**Paso 1: Descargar ngrok**

1. Ve a: https://ngrok.com/download
2. Descarga la versión para **Windows**
3. O descarga directamente: https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-windows-amd64.zip

**Paso 2: Extraer ngrok**

1. Extrae el archivo ZIP descargado
2. Mueve `ngrok.exe` a una ubicación fácil de acceder, por ejemplo:
   - `C:\ngrok\ngrok.exe` (crea la carpeta si no existe)

**Paso 3: Agregar al PATH (Opcional pero Recomendado)**

Para usar `ngrok` desde cualquier terminal:

1. **Busca "Variables de entorno"** en el menú Inicio
2. **Haz clic en "Editar las variables de entorno del sistema"**
3. **Haz clic en "Variables de entorno"**
4. **En "Variables del sistema"**, selecciona "Path" y haz clic en "Editar"
5. **Haz clic en "Nuevo"** y agrega la carpeta donde está `ngrok.exe` (ej: `C:\ngrok`)
6. **Haz clic en "Aceptar"** en todas las ventanas
7. **Cierra y reabre tu terminal** para que los cambios surtan efecto

**Paso 4: Verificar instalación**

Abre una nueva terminal y ejecuta:
```powershell
ngrok version
```

Si ves la versión, ¡está instalado correctamente!

**Paso 5: Configurar token**

1. Crea una cuenta gratis en: https://ngrok.com
2. Obtén tu token de: https://dashboard.ngrok.com/get-started/your-authtoken
3. Ejecuta:
```powershell
ngrok config add-authtoken TU_AUTH_TOKEN
```

**¡Listo!** Ahora puedes usar `npm run dev:tunnel`

---

## ✅ Opción 2: Chocolatey (Requiere Administrador)

**Paso 1: Abrir PowerShell como Administrador**

1. **Busca "PowerShell"** en el menú Inicio
2. **Haz clic derecho** en "Windows PowerShell"
3. **Selecciona "Ejecutar como administrador"**
4. **Confirma** cuando Windows te pregunte

**Paso 2: Instalar ngrok**

```powershell
choco install ngrok
```

Presiona **Y** cuando pregunte.

**Paso 3: Verificar instalación**

```powershell
ngrok version
```

**Paso 4: Configurar token**

1. Crea una cuenta gratis en: https://ngrok.com
2. Obtén tu token de: https://dashboard.ngrok.com/get-started/your-authtoken
3. Ejecuta:
```powershell
ngrok config add-authtoken TU_AUTH_TOKEN
```

**¡Listo!** Ahora puedes usar `npm run dev:tunnel`

---

## ⚠️ Problema: Lock File de Chocolatey

Si obtuviste un error de "lock file", intenta esto:

**Solución 1: Eliminar lock file (Como Administrador)**

1. Abre PowerShell como **Administrador**
2. Ejecuta:
```powershell
Remove-Item "C:\ProgramData\chocolatey\lib\7c5f7c1edfcf8ad5be4acd019eb3f5546bb0b69d" -Force -ErrorAction SilentlyContinue
```
3. Intenta instalar de nuevo:
```powershell
choco install ngrok
```

**Solución 2: Usar descarga manual (Más fácil)**

Si el problema persiste, usa la **Opción 1** (descarga manual) que no requiere administrador.

---

## 🚀 Usar ngrok

Una vez instalado, puedes:

**Opción A: Usar el script automatizado**
```bash
npm run dev:tunnel
```

**Opción B: Usar ngrok manualmente**
```powershell
# En una terminal, mientras el servidor está corriendo
ngrok http 3000
```

---

## ✅ Verificar que Funciona

Después de configurar el token, prueba:

```powershell
ngrok http 3000
```

Deberías ver algo como:
```
Forwarding  https://abc123-def456.ngrok-free.app -> http://localhost:3000
```

Si ves esto, ¡está funcionando correctamente!

---

## 💡 Consejos

- **Para desarrollo**: Usa la descarga manual (más simple)
- **Para uso frecuente**: Agrega ngrok al PATH
- **Token**: Solo necesitas configurarlo una vez
- **Script**: Usa `npm run dev:tunnel` para todo automático

---

**¿Necesitas ayuda?** Revisa: https://ngrok.com/docs/getting-started
