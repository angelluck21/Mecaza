#!/bin/bash

# Script mejorado para solucionar permisos en Laravel
# Ejecutar como: sudo bash fix_permissions_improved.sh

echo "🔧 Configurando permisos para Laravel (Versión Mejorada)..."

# Definir el directorio del proyecto
PROJECT_DIR="/var/www/MecazaBack"

# Verificar que el directorio existe
if [ ! -d "$PROJECT_DIR" ]; then
    echo "❌ Error: El directorio $PROJECT_DIR no existe"
    exit 1
fi

echo "📁 Configurando permisos para: $PROJECT_DIR"

# Verificar usuario actual
CURRENT_USER=$(whoami)
echo "👤 Usuario actual: $CURRENT_USER"

# 1. Cambiar propietario con verbose para ver qué pasa
echo "👤 Cambiando propietario (con verbose)..."
chown -R www-data:www-data "$PROJECT_DIR" --verbose

# Si falla, intentar con el usuario actual
if [ $? -ne 0 ]; then
    echo "⚠️ Falló con www-data, intentando con usuario actual..."
    chown -R $CURRENT_USER:www-data "$PROJECT_DIR" --verbose
fi

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

# 6. Verificar permisos antes de limpiar cache
echo "🔍 Verificando permisos antes de limpiar cache..."
ls -la "$PROJECT_DIR/storage/framework/"

# 7. Limpiar cache de Laravel
echo "🧹 Limpiando cache de Laravel..."
cd "$PROJECT_DIR"

# Intentar con diferentes usuarios
echo "Intentando limpiar cache como usuario actual..."
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Si falla, intentar con sudo
if [ $? -ne 0 ]; then
    echo "⚠️ Falló como usuario normal, intentando con sudo..."
    sudo php artisan cache:clear
    sudo php artisan config:clear
    sudo php artisan route:clear
    sudo php artisan view:clear
fi

# 8. Regenerar cache
echo "🔄 Regenerando cache..."
php artisan config:cache
php artisan route:cache

# Si falla, intentar con sudo
if [ $? -ne 0 ]; then
    echo "⚠️ Falló como usuario normal, intentando con sudo..."
    sudo php artisan config:cache
    sudo php artisan route:cache
fi

# 9. Verificar permisos finales
echo "✅ Verificando permisos finales..."
ls -la "$PROJECT_DIR/storage/framework/"

# 10. Verificar que se pueden crear archivos
echo "🧪 Probando creación de archivos..."
touch "$PROJECT_DIR/storage/framework/views/test_file.tmp"
if [ $? -eq 0 ]; then
    echo "✅ Se pueden crear archivos correctamente"
    rm "$PROJECT_DIR/storage/framework/views/test_file.tmp"
else
    echo "❌ No se pueden crear archivos"
fi

echo "🎉 ¡Configuración completada!"
echo "📝 Recuerda reiniciar tu servidor web:"
echo "   Para Apache: sudo systemctl restart apache2"
echo "   Para Nginx: sudo systemctl restart nginx"
echo "   Para PHP-FPM: sudo systemctl restart php8.1-fpm"
