# Script para reconstruir los archivos de administración de usuarios desde cero

Write-Host "🔄 Reconstruyendo archivos de administración de usuarios..." -ForegroundColor Cyan

# Backup de archivos actuales
Write-Host "📦 Creando backup..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path ".backup/admin-users" | Out-Null
Copy-Item -Path "app/api/admin/users" -Destination ".backup/admin-users/" -Recurse -Force -ErrorAction SilentlyContinue
Copy-Item -Path "app/api/admin/reports" -Destination ".backup/admin-users/" -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "✅ Backup creado en .backup/admin-users/" -ForegroundColor Green
Write-Host ""
Write-Host "Ahora puedes reconstruir los archivos desde cero." -ForegroundColor Yellow
Write-Host "Los archivos originales están guardados en .backup/admin-users/" -ForegroundColor Gray
