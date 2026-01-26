# 📊 Configuración de Google Sheets para Reportes

Esta guía te ayudará a configurar la integración con Google Sheets para exportar reportes de usuarios y predicciones.

## 🔧 Requisitos Previos

1. Una cuenta de Google
2. Un proyecto en [Google Cloud Console](https://console.cloud.google.com/)
3. Un Google Spreadsheet creado

## 📝 Pasos de Configuración

### 1. Crear un Proyecto en Google Cloud

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la **Google Sheets API**:
   - Ve a "APIs & Services" → "Library"
   - Busca "Google Sheets API"
   - Haz clic en "Enable"

### 2. Crear una Cuenta de Servicio

1. Ve a "APIs & Services" → "Credentials"
2. Haz clic en "Create Credentials" → "Service Account"
3. Completa los datos:
   - **Name**: `mundial-predict-sheets`
   - **Description**: `Service account for exporting reports to Google Sheets`
4. Haz clic en "Create and Continue"
5. En "Grant this service account access to project":
   - **Role**: `Editor` (o `Owner` si prefieres)
6. Haz clic en "Done"

### 3. Crear y Descargar la Clave JSON

1. Haz clic en la cuenta de servicio que acabas de crear
2. Ve a la pestaña "Keys"
3. Haz clic en "Add Key" → "Create new key"
4. Selecciona "JSON"
5. Haz clic en "Create"
6. Se descargará un archivo JSON - **guárdalo de forma segura**

### 4. Compartir el Google Spreadsheet

1. Abre o crea un Google Spreadsheet en [Google Sheets](https://sheets.google.com)
2. Haz clic en "Share" (Compartir)
3. En "Add people and groups", ingresa el **email de la cuenta de servicio**:
   - Puedes encontrarlo en el archivo JSON que descargaste, en el campo `client_email`
   - O en Google Cloud Console → Service Accounts → tu cuenta → "Details"
4. Asigna el rol **"Editor"**
5. Haz clic en "Send" (No es necesario enviar notificación)

### 5. Obtener el ID del Spreadsheet

El ID del spreadsheet está en la URL:

```
https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
```

Ejemplo:
- URL: `https://docs.google.com/spreadsheets/d/1ABC123xyz789/edit`
- ID: `1ABC123xyz789`

### 6. Configurar Variables de Entorno

Abre el archivo JSON descargado y copia los siguientes valores:

```json
{
  "type": "service_account",
  "project_id": "...",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "mundial-predict-sheets@tu-proyecto.iam.gserviceaccount.com",
  ...
}
```

Agrega estas variables a tu `.env.local`:

```env
# Google Sheets
GOOGLE_SERVICE_ACCOUNT_EMAIL=mundial-predict-sheets@tu-proyecto.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=1ABC123xyz789
```

**⚠️ Importante:**
- El `GOOGLE_PRIVATE_KEY` debe incluir los `\n` (saltos de línea) exactamente como aparece en el JSON
- En algunos sistemas, puede que necesites escapar las comillas o los saltos de línea
- Si tienes problemas, prueba poner el valor entre comillas dobles en el `.env.local`

### 7. Reiniciar el Servidor

```bash
npm run dev
```

## 📊 Uso de los Reportes

### Reporte de Usuarios Registrados

**Endpoint:** `GET /api/admin/reports/users`

**Uso:**
- Solo accesible para administradores
- Exporta todos los usuarios registrados a una nueva hoja en Google Sheets
- El nombre de la hoja incluye la fecha: `Usuarios Registrados - DD/MM/YYYY`

**Ejemplo:**

```bash
curl -X GET http://localhost:3000/api/admin/reports/users \
  -H "Cookie: mp_session=tu_token_de_sesion"
```

### Reporte de Predicciones por Fase

**Endpoint:** `GET /api/admin/reports/predictions?fase=grupos`

**Parámetros:**
- `fase` (opcional): Fase del mundial (ej: `grupos`, `octavos`, `cuartos`, `semifinal`, `final`)
  - Si no se especifica, exporta todas las fases en hojas separadas

**Uso:**
- Solo accesible para administradores
- Exporta todas las predicciones de la fase especificada
- Si no se especifica fase, crea una hoja por cada fase

**Ejemplo:**

```bash
# Exportar todas las fases
curl -X GET http://localhost:3000/api/admin/reports/predictions \
  -H "Cookie: mp_session=tu_token_de_sesion"

# Exportar solo fase de grupos
curl -X GET "http://localhost:3000/api/admin/reports/predictions?fase=grupos" \
  -H "Cookie: mp_session=tu_token_de_sesion"
```

## 🔗 Generación de Links Únicos

### Generar Links de Registro

**Endpoint:** `POST /api/admin/links/generate`

**Body:**
```json
{
  "cantidad": 10
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "10 links generados exitosamente",
  "links": [
    {
      "id": "...",
      "token": "abc123...",
      "url": "http://localhost:3000/registro?t=abc123...",
      "creado_en": "2026-01-20T10:00:00Z",
      "expira_en": "2026-01-22T10:00:00Z"
    }
  ]
}
```

**Características:**
- Los links expiran en 48 horas por defecto
- Cada link es único y solo puede ser usado una vez
- Los links generados están listos para ser enviados a los usuarios después del pago

## 🐛 Solución de Problemas

### Error: "Google Sheets no está configurado"

- Verifica que todas las variables de entorno estén configuradas
- Asegúrate de haber reiniciado el servidor después de agregar las variables

### Error: "Permission denied"

- Verifica que hayas compartido el spreadsheet con el email de la cuenta de servicio
- Asegúrate de que el rol sea "Editor" o "Owner"

### Error: "Invalid credentials"

- Verifica que el `GOOGLE_PRIVATE_KEY` esté correctamente copiado
- Asegúrate de que los `\n` (saltos de línea) estén presentes en el private key

### Los datos no aparecen en Google Sheets

- Verifica que el `GOOGLE_SHEET_ID` sea correcto
- Revisa los logs del servidor para ver errores específicos
- Asegúrate de que la API de Google Sheets esté habilitada

## 📚 Referencias

- [Google Sheets API Documentation](https://developers.google.com/sheets/api)
- [Service Account Authentication](https://cloud.google.com/iam/docs/service-accounts)
- [Node.js Google APIs Client](https://github.com/googleapis/google-api-nodejs-client)
