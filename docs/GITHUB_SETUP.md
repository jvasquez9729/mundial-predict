# Guía para Subir el Código a GitHub

## Paso 1: Configurar Git (Si aún no lo has hecho)

```bash
git config --global user.name "Tu Nombre"
git config --global user.email "tu-email@ejemplo.com"
```

## Paso 2: Crear Repositorio en GitHub

1. Ve a [GitHub.com](https://github.com) e inicia sesión
2. Haz clic en el botón **"+"** (arriba a la derecha) → **"New repository"**
3. Configura el repositorio:
   - **Repository name**: `mundial-predict` (o el nombre que prefieras)
   - **Description**: "Mundial Predict - Sistema de predicciones para la Copa del Mundo 2026"
   - **Visibilidad**: 
     - ✅ **Private** (recomendado si contiene información sensible)
     - ⬜ Public (público para todos)
   - **NO marques** "Initialize this repository with a README" (ya tenemos archivos)
4. Haz clic en **"Create repository"**

## Paso 3: Conectar y Subir el Código

Después de crear el repositorio, GitHub te mostrará comandos. Ejecuta estos en tu terminal:

```bash
# Si ya hiciste el commit, solo ejecuta estos:
git remote add origin https://github.com/TU_USUARIO/mundial-predict.git
git branch -M main
git push -u origin main
```

**Nota**: Reemplaza `TU_USUARIO` con tu nombre de usuario de GitHub y `mundial-predict` con el nombre que le diste al repositorio.

## Paso 4: Verificar

1. Ve a tu repositorio en GitHub
2. Deberías ver todos tus archivos subidos
3. El `.env.local` y otros archivos sensibles NO se subirán (están en `.gitignore`)

## ⚠️ IMPORTANTE: Variables de Entorno

**NUNCA** subas tus archivos `.env.local` o credenciales a GitHub. Estos están protegidos por `.gitignore`, pero verifica que no aparezcan en el repositorio.

## Próximos Pasos

Una vez que el código esté en GitHub, puedes:
- Conectarlo con Vercel para desplegarlo automáticamente
- Colaborar con otros desarrolladores
- Tener un respaldo de tu código
