#!/bin/bash

# Script para solucionar permisos en Laravel
# Ejecutar como: sudo bash fix_permissions.sh

echo "🔧 Configurando permisos para Laravel..."

# Definir el directorio del proyecto
PROJECT_DIR="/var/www/MecazaBack"

# Verificar que el directorio existe
if [ ! -d "$PROJECT_DIR" ]; then
    echo "❌ Error: El directorio $PROJECT_DIR no existe"
    exit 1
fi

echo "📁 Configurando permisos para: $PROJECT_DIR"

# 1. Cambiar propietario
echo "👤 Cambiando propietario..."
chown -R www-data:www-data "$PROJECT_DIR"

# 2. Configurar permisos base
echo "🔐 Configurando permisos base..."
chmod -R 755 "$PROJECT_DIR"

# 3. Configurar permisos específicos para storage
echo "📦 Configurando permisos de storage..."
chmod -R 775 "$PROJECT_DIR/storage/"
chmod -R 775 "$PROJECT_DIR/bootstrap/cache/"

# 4. Crear directorios necesarios si no existen
echo "📂 Creando directorios necesarios..."
mkdir -p "$PROJECT_DIR/storage/framework/views"
mkdir -p "$PROJECT_DIR/storage/framework/cache"
mkdir -p "$PROJECT_DIR/storage/framework/sessions"
mkdir -p "$PROJECT_DIR/storage/logs"

# 5. Dar permisos de escritura completos a directorios críticos
echo "✍️ Configurando permisos de escritura..."
chmod -R 777 "$PROJECT_DIR/storage/framework/"
chmod -R 777 "$PROJECT_DIR/storage/logs/"
chmod -R 777 "$PROJECT_DIR/storage/app/"

# 6. Limpiar cache de Laravel
echo "🧹 Limpiando cache de Laravel..."
cd "$PROJECT_DIR"
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# 7. Regenerar cache
echo "🔄 Regenerando cache..."
php artisan config:cache
php artisan route:cache

# 8. Verificar permisos finales
echo "✅ Verificando permisos finales..."
ls -la "$PROJECT_DIR/storage/framework/"

echo "🎉 ¡Configuración completada!"
echo "📝 Recuerda reiniciar tu servidor web:"
echo "   Para Apache: sudo systemctl restart apache2"
echo "   Para Nginx: sudo systemctl restart nginx"
