# Cron Jobs Alternativos para Plan Hobby

El plan Hobby de Vercel limita los cron jobs a **máximo 1 vez al día**. Para tener más frecuencia, puedes usar servicios externos gratuitos.

## Opción 1: Cron Job Diario en Vercel (Recomendado)

Ya está configurado un cron job diario que ejecuta todas las tareas:
- **Endpoint**: `/api/cron/daily`
- **Frecuencia**: Una vez al día a medianoche (00:00 UTC)
- **Tareas**: Sincroniza partidos, verifica deadlines, calcula puntos

### Configuración

El cron job ya está configurado en `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/daily",
      "schedule": "0 0 * * *"
    }
  ]
}
```

### Seguridad

Para proteger el endpoint, configura `CRON_SECRET` en las variables de entorno de Vercel:
```bash
CRON_SECRET=tu_secreto_muy_seguro
```

## Opción 2: Servicios Externos Gratuitos

Si necesitas más frecuencia, puedes usar estos servicios:

### cron-job.org (Gratis)

1. Ve a https://cron-job.org
2. Crea una cuenta gratuita
3. Crea un nuevo cron job con estas configuraciones:

#### Para sincronizar partidos (cada 15 minutos):
- **URL**: `https://tu-proyecto.vercel.app/api/cron/sync-matches`
- **Método**: GET
- **Headers**: `Authorization: Bearer tu_CRON_SECRET`
- **Schedule**: `*/15 * * * *`

#### Para verificar deadlines (cada 5 minutos):
- **URL**: `https://tu-proyecto.vercel.app/api/cron/check-deadlines`
- **Método**: GET
- **Headers**: `Authorization: Bearer tu_CRON_SECRET`
- **Schedule**: `*/5 * * * *`

#### Para calcular puntos (cada hora):
- **URL**: `https://tu-proyecto.vercel.app/api/cron/calculate-points`
- **Método**: GET
- **Headers**: `Authorization: Bearer tu_CRON_SECRET`
- **Schedule**: `0 * * * *`

### EasyCron (Gratis - 1 cron job)

1. Ve a https://www.easycron.com
2. Crea una cuenta gratuita
3. Configura un cron job para el endpoint diario:
- **URL**: `https://tu-proyecto.vercel.app/api/cron/daily`
- **Método**: GET
- **Headers**: `Authorization: Bearer tu_CRON_SECRET`
- **Schedule**: `0 0 * * *` (una vez al día)

## Opción 3: Ejecución Manual

También puedes ejecutar los cron jobs manualmente desde el admin panel o haciendo peticiones directas:

### Desde el navegador o Postman:

```bash
# Sincronizar partidos
GET https://tu-proyecto.vercel.app/api/cron/sync-matches
Headers: Authorization: Bearer tu_CRON_SECRET

# Verificar deadlines
GET https://tu-proyecto.vercel.app/api/cron/check-deadlines
Headers: Authorization: Bearer tu_CRON_SECRET

# Calcular puntos
GET https://tu-proyecto.vercel.app/api/cron/calculate-points
Headers: Authorization: Bearer tu_CRON_SECRET

# Ejecutar todas las tareas (cron diario)
GET https://tu-proyecto.vercel.app/api/cron/daily
Headers: Authorization: Bearer tu_CRON_SECRET
```

## Recomendación

Para el plan Hobby, recomiendo:

1. **Usar el cron diario de Vercel** para tareas no críticas
2. **Usar cron-job.org** para tareas que necesiten más frecuencia durante el Mundial
3. **Ejecutar manualmente** cuando sea necesario desde el admin panel

## Actualizar a Plan Pro

Si necesitas más frecuencia y funcionalidades avanzadas, puedes actualizar a Vercel Pro:
- **Precio**: $20/mes
- **Cron jobs**: Sin límites de frecuencia
- **Más funciones**: Analytics avanzado, más bandwidth, etc.

## Endpoints Disponibles

### `/api/cron/daily`
Ejecuta todas las tareas de mantenimiento una vez al día.

### `/api/cron/sync-matches`
Sincroniza partidos desde la API externa.

### `/api/cron/check-deadlines`
Verifica y cierra predicciones para partidos próximos.

### `/api/cron/calculate-points`
Calcula puntos para partidos finalizados.

Todos los endpoints requieren el header `Authorization: Bearer CRON_SECRET` si `CRON_SECRET` está configurado.
