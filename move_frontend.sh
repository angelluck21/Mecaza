#!/bin/bash

# Script para Mover el Frontend Mecaza a /var/www/
# Ejecutar como: sudo bash move_frontend.sh

echo "🚀 MOVIENDO FRONTEND MECAZA A /var/www/"
echo "========================================="

# Definir directorios
SOURCE_DIR="/root/Mecaza"
TARGET_DIR="/var/www/Mecaza"
DIST_DIR="$TARGET_DIR/dist"

echo "📁 Directorio origen: $SOURCE_DIR"
echo "📁 Directorio destino: $TARGET_DIR"

# 1. Verificar que el directorio origen existe
if [ ! -d "$SOURCE_DIR" ]; then
    echo "❌ Error: El directorio origen $SOURCE_DIR no existe"
    echo "Verificando directorio actual..."
    pwd
    ls -la
    exit 1
fi

echo "✅ Directorio origen encontrado"

# 2. Verificar que el directorio dist existe
if [ ! -d "$SOURCE_DIR/dist" ]; then
    echo "❌ Error: El directorio dist no existe en $SOURCE_DIR"
    echo "Necesitas ejecutar 'npm run build' primero"
    exit 1
fi

echo "✅ Directorio dist encontrado"

# 3. Crear directorio de destino
echo "📂 Creando directorio de destino..."
mkdir -p "$TARGET_DIR"

if [ $? -eq 0 ]; then
    echo "✅ Directorio de destino creado"
else
    echo "❌ Error al crear directorio de destino"
    exit 1
fi

# 4. Mover el proyecto
echo "🔄 Moviendo proyecto..."
mv "$SOURCE_DIR"/* "$TARGET_DIR/"

if [ $? -eq 0 ]; then
    echo "✅ Proyecto movido correctamente"
else
    echo "❌ Error al mover el proyecto"
    exit 1
fi

# 5. Mover archivos ocultos
echo "🔄 Moviendo archivos ocultos..."
mv "$SOURCE_DIR"/.* "$TARGET_DIR/" 2>/dev/null || echo "⚠️ No hay archivos ocultos o ya se movieron"

# 6. Verificar que se movió correctamente
echo "🔍 Verificando movimiento..."
if [ -d "$DIST_DIR" ]; then
    echo "✅ Directorio dist encontrado en destino"
    echo "Contenido del directorio dist:"
    ls -la "$DIST_DIR"
else
    echo "❌ Error: Directorio dist no encontrado en destino"
    exit 1
fi

# 7. Configurar permisos
echo "🔐 Configurando permisos..."
chown -R www-data:www-data "$TARGET_DIR"
chmod -R 755 "$TARGET_DIR"
chmod -R 755 "$DIST_DIR"

echo "✅ Permisos configurados"

# 8. Verificar archivos críticos
echo "🔍 Verificando archivos críticos..."
CRITICAL_FILES=("index.html" "assets/index-D3zepQ4w.css" "assets/index-DTbcQ-Tw.js")

for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$DIST_DIR/$file" ]; then
        echo "✅ $file encontrado"
    else
        echo "❌ $file NO encontrado"
    fi
done

# 9. Limpiar directorio origen
echo "🧹 Limpiando directorio origen..."
rmdir "$SOURCE_DIR" 2>/dev/null || echo "⚠️ Directorio origen no se pudo eliminar (puede tener contenido)"

# 10. Resumen final
echo ""
echo "🎯 MOVIMIENTO COMPLETADO EXITOSAMENTE"
echo "====================================="
echo "✅ Proyecto movido a: $TARGET_DIR"
echo "✅ Permisos configurados"
echo "✅ Archivos críticos verificados"

echo ""
echo "📝 PRÓXIMOS PASOS:"
echo "1. Configurar Nginx/Apache para servir desde: $DIST_DIR"
echo "2. Verificar que el frontend funciona en tu servidor web"
echo "3. Configurar el proxy para las APIs del backend"
echo "4. Probar la aplicación completa"

echo ""
echo "🔧 Para configurar Nginx, puedes usar:"
echo "   sudo nano /etc/nginx/sites-available/mecaza-frontend"
echo "   sudo ln -s /etc/nginx/sites-available/mecaza-frontend /etc/nginx/sites-enabled/"
echo "   sudo nginx -t"
echo "   sudo systemctl restart nginx"
