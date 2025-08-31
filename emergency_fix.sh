#!/bin/bash

# Script de Emergencia para MecazaBack
# Ejecutar como: sudo bash emergency_fix.sh

echo "🚨 SCRIPT DE EMERGENCIA PARA MECAZA BACK"
echo "=========================================="

PROJECT_DIR="/var/www/MecazaBack"

# Verificar que el directorio existe
if [ ! -d "$PROJECT_DIR" ]; then
    echo "❌ Error: El directorio $PROJECT_DIR no existe"
    exit 1
fi

echo "📁 Directorio del proyecto: $PROJECT_DIR"

# 1. Verificar el estado actual
echo "🔍 Verificando estado actual..."
echo "Propietario actual:"
ls -la "$PROJECT_DIR" | head -5

# 2. Verificar si chown funciona
echo "🔧 Verificando comando chown..."
if command -v chown &> /dev/null; then
    echo "✅ Comando chown disponible"
    chown --version
else
    echo "❌ Comando chown no disponible"
    echo "Buscando en ubicaciones alternativas..."
    find /bin /usr/bin /sbin /usr/sbin -name "chown" 2>/dev/null
fi

# 3. Verificar si el usuario www-data existe
echo "👤 Verificando usuario www-data..."
if id "www-data" &>/dev/null; then
    echo "✅ Usuario www-data existe"
    id www-data
else
    echo "❌ Usuario www-data no existe"
    echo "Creando usuario www-data..."
    useradd -r -s /bin/false www-data 2>/dev/null || echo "⚠️ No se pudo crear usuario"
    groupadd www-data 2>/dev/null || echo "⚠️ No se pudo crear grupo"
fi

# 4. Intentar cambiar propietario con diferentes métodos
echo "🔄 Intentando cambiar propietario..."

# Método 1: chown normal
echo "Método 1: chown normal..."
chown -R www-data:www-data "$PROJECT_DIR" 2>&1
if [ $? -eq 0 ]; then
    echo "✅ chown normal funcionó"
else
    echo "❌ chown normal falló"
fi

# Método 2: chown con ruta completa
echo "Método 2: chown con ruta completa..."
/bin/chown -R www-data:www-data "$PROJECT_DIR" 2>&1
if [ $? -eq 0 ]; then
    echo "✅ chown con ruta completa funcionó"
else
    echo "❌ chown con ruta completa falló"
fi

# Método 3: chown con usuario actual
echo "Método 3: chown con usuario actual..."
CURRENT_USER=$(whoami)
chown -R $CURRENT_USER:www-data "$PROJECT_DIR" 2>&1
if [ $? -eq 0 ]; then
    echo "✅ chown con usuario actual funcionó"
else
    echo "❌ chown con usuario actual falló"
fi

# 5. Si todo falla, usar permisos permisivos
echo "🛡️ Configurando permisos permisivos como fallback..."

# Crear directorios necesarios
mkdir -p "$PROJECT_DIR/storage/framework/views"
mkdir -p "$PROJECT_DIR/storage/framework/cache"
mkdir -p "$PROJECT_DIR/storage/framework/sessions"
mkdir -p "$PROJECT_DIR/storage/logs"

# Dar permisos 777 a directorios críticos
chmod -R 777 "$PROJECT_DIR/storage/"
chmod -R 777 "$PROJECT_DIR/bootstrap/cache/"

# 6. Verificar permisos finales
echo "🔍 Verificando permisos finales..."
echo "Permisos de storage:"
ls -la "$PROJECT_DIR/storage/"

echo "Permisos de framework:"
ls -la "$PROJECT_DIR/storage/framework/"

# 7. Probar si se pueden crear archivos
echo "🧪 Probando creación de archivos..."
TEST_FILE="$PROJECT_DIR/storage/framework/views/test_emergency.tmp"
touch "$TEST_FILE" 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✅ Se pueden crear archivos correctamente"
    rm "$TEST_FILE"
else
    echo "❌ No se pueden crear archivos"
fi

# 8. Intentar limpiar cache de Laravel
echo "🧹 Intentando limpiar cache de Laravel..."
cd "$PROJECT_DIR"

# Intentar con diferentes métodos
php artisan cache:clear 2>&1 || echo "⚠️ Falló como usuario normal"
php artisan config:clear 2>&1 || echo "⚠️ Falló como usuario normal"
php artisan route:clear 2>&1 || echo "⚠️ Falló como usuario normal"
php artisan view:clear 2>&1 || echo "⚠️ Falló como usuario normal"

# 9. Resumen final
echo ""
echo "🎯 RESUMEN FINAL"
echo "================="
echo "Propietario actual:"
ls -la "$PROJECT_DIR" | head -3

echo "Permisos de storage:"
ls -la "$PROJECT_DIR/storage/" | head -3

echo "Permisos de framework:"
ls -la "$PROJECT_DIR/storage/framework/" | head -3

echo ""
echo "📝 PRÓXIMOS PASOS:"
echo "1. Si los permisos son 777, el problema está resuelto temporalmente"
echo "2. Reinicia tu servidor web: sudo systemctl restart apache2/nginx"
echo "3. Prueba acceder a tu aplicación Laravel"
echo "4. Si funciona, investiga por qué chown no funcionó"
echo "5. Considera usar herramientas como Laravel Forge para despliegues futuros"
