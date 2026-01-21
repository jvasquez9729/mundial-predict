#!/bin/bash
# Script para reconstruir los archivos de administración de usuarios desde cero

echo "🔄 Reconstruyendo archivos de administración de usuarios..."

# Backup de archivos actuales
echo "📦 Creando backup..."
mkdir -p .backup/admin-users
cp -r app/api/admin/users .backup/admin-users/ 2>/dev/null || true
cp -r app/api/admin/reports .backup/admin-users/ 2>/dev/null || true

echo "✅ Backup creado en .backup/admin-users/"
echo ""
echo "Ahora puedes reconstruir los archivos desde cero."
echo "Los archivos originales están guardados en .backup/admin-users/"
