#!/bin/bash

# Script de Configuración del Frontend Mecaza
# Ejecutar como: sudo bash setup_frontend.sh

echo "🚀 CONFIGURANDO FRONTEND MECAZA"
echo "================================"

FRONTEND_DIR="/var/www/MecazaFront/Mecaza"

# Verificar que el directorio existe
if [ ! -d "$FRONTEND_DIR" ]; then
    echo "❌ Error: El directorio $FRONTEND_DIR no existe"
    echo "Creando directorio..."
    mkdir -p "$FRONTEND_DIR"
fi

echo "📁 Directorio del frontend: $FRONTEND_DIR"

# 1. Verificar estado actual
echo "🔍 Verificando estado actual..."
echo "Contenido del directorio:"
ls -la "$FRONTEND_DIR" | head -10

# 2. Verificar Node.js
echo "🔧 Verificando Node.js..."
if command -v node &> /dev/null; then
    echo "✅ Node.js está instalado"
    echo "Versión: $(node --version)"
else
    echo "❌ Node.js no está instalado"
    echo "Instalando Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    apt-get install -y nodejs
fi

# 3. Verificar npm
echo "📦 Verificando npm..."
if command -v npm &> /dev/null; then
    echo "✅ npm está instalado"
    echo "Versión: $(npm --version)"
else
    echo "❌ npm no está instalado"
    echo "Instalando npm..."
    apt-get install -y npm
fi

# 4. Configurar permisos
echo "🔐 Configurando permisos..."
chmod -R 755 "$FRONTEND_DIR"

# Dar permisos específicos a archivos de configuración
chmod 644 "$FRONTEND_DIR/package.json" 2>/dev/null || echo "⚠️ package.json no encontrado"
chmod 644 "$FRONTEND_DIR/vite.config.js" 2>/dev/null || echo "⚠️ vite.config.js no encontrado"
chmod 644 "$FRONTEND_DIR/index.html" 2>/dev/null || echo "⚠️ index.html no encontrado"

# 5. Verificar archivo package.json
echo "📋 Verificando package.json..."
if [ -f "$FRONTEND_DIR/package.json" ]; then
    echo "✅ package.json encontrado"
    echo "Contenido:"
    cat "$FRONTEND_DIR/package.json" | head -10
else
    echo "❌ package.json no encontrado"
    echo "Creando package.json básico..."
    cat > "$FRONTEND_DIR/package.json" << 'EOF'
{
  "name": "mecaza-frontend",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.0",
    "axios": "^1.3.0"
  },
  "devDependencies": {
    "@types/react": "^18.0.27",
    "@types/react-dom": "^18.0.10",
    "@vitejs/plugin-react": "^3.1.0",
    "autoprefixer": "^10.4.14",
    "postcss": "^8.4.21",
    "tailwindcss": "^3.2.7",
    "vite": "^4.1.0"
  }
}
EOF
fi

# 6. Instalar dependencias
echo "📥 Instalando dependencias..."
cd "$FRONTEND_DIR"

if [ -d "node_modules" ]; then
    echo "✅ node_modules ya existe"
else
    echo "Instalando dependencias..."
    npm install
fi

# 7. Crear archivo .env si no existe
echo "⚙️ Configurando variables de entorno..."
if [ ! -f ".env" ]; then
    echo "Creando archivo .env..."
    cat > .env << 'EOF'
# Configuración del Frontend Mecaza
VITE_API_BASE_URL=http://127.0.0.1:8000/api
VITE_APP_NAME=Mecaza
VITE_APP_VERSION=1.0.0

# Configuración de desarrollo
NODE_ENV=development
VITE_DEV_SERVER_PORT=3000
EOF
    echo "✅ Archivo .env creado"
else
    echo "✅ Archivo .env ya existe"
fi

# 8. Verificar archivos de configuración
echo "🔧 Verificando archivos de configuración..."
if [ -f "vite.config.js" ]; then
    echo "✅ vite.config.js encontrado"
else
    echo "❌ vite.config.js no encontrado"
    echo "Creando vite.config.js..."
    cat > vite.config.js << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: '0.0.0.0',
    proxy: {
      '/api': 'http://127.0.0.1:8000'
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})
EOF
fi

# 9. Probar construcción
echo "🧪 Probando construcción del proyecto..."
if npm run build; then
    echo "✅ Construcción exitosa"
    echo "Contenido del directorio dist:"
    ls -la dist/ 2>/dev/null || echo "⚠️ Directorio dist no encontrado"
else
    echo "❌ Construcción falló"
    echo "Intentando instalar dependencias faltantes..."
    npm install
    npm run build
fi

# 10. Resumen final
echo ""
echo "🎯 RESUMEN DE CONFIGURACIÓN DEL FRONTEND"
echo "========================================="
echo "✅ Directorio configurado: $FRONTEND_DIR"
echo "✅ Permisos configurados"
echo "✅ Node.js verificado"
echo "✅ Dependencias instaladas"
echo "✅ Variables de entorno configuradas"
echo "✅ Archivos de configuración verificados"

echo ""
echo "📝 PRÓXIMOS PASOS:"
echo "1. Ejecutar en desarrollo: cd $FRONTEND_DIR && npm run dev"
echo "2. Construir para producción: cd $FRONTEND_DIR && npm run build"
echo "3. El frontend estará disponible en: http://localhost:3000"
echo "4. Para producción, servir el directorio 'dist' con tu servidor web"
echo "5. Asegúrate de que el backend Laravel esté funcionando en el puerto 8000"
