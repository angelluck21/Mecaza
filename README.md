# 🚗 MECAZA - Plataforma de Viajes Seguros

## 📋 **Descripción del Proyecto**

**Mecaza** es una plataforma web moderna y responsiva que conecta conductores verificados con pasajeros que buscan viajes seguros y cómodos. La aplicación permite a los usuarios buscar, reservar y gestionar viajes en tiempo real, con un sistema de estados que mantiene informados a todos los participantes sobre el progreso del viaje.

## ✨ **Características Principales**

### 🎯 **Funcionalidades del Usuario**
- **Búsqueda de Viajes**: Filtrado avanzado por conductor, destino, placa, hora o fecha
- **Sistema de Reservas**: Selección visual de asientos con confirmación en tiempo real
- **Gestión de Perfil**: Perfil de usuario personalizable con historial de viajes
- **Notificaciones**: Sistema de alertas para confirmaciones y cambios de estado

### 🚙 **Funcionalidades del Conductor**
- **Gestión de Vehículos**: Registro y administración de información del carro
- **Control de Estados**: Actualización del estado del viaje (Esperando, En Viaje, etc.)
- **Gestión de Reservas**: Visualización y administración de pasajeros confirmados

### 👨‍💼 **Panel Administrativo**
- **Estadísticas en Tiempo Real**: Total de vehículos, usuarios y reservas del día
- **Gestión de Estados**: Configuración de estados de viaje del sistema
- **Administración de Precios**: Configuración de tarifas por ruta
- **Monitoreo del Sistema**: Dashboard completo con métricas del negocio

## 🛠️ **Tecnologías Utilizadas**

### **Frontend**
- **React 18** - Biblioteca de interfaz de usuario
- **Vite** - Herramienta de construcción rápida
- **Tailwind CSS** - Framework de CSS utilitario
- **React Router** - Enrutamiento de la aplicación
- **Axios** - Cliente HTTP para API calls
- **React Icons** - Biblioteca de iconos
- **Heroicons** - Iconos SVG optimizados

### **Backend**
- **Laravel** - Framework PHP para API REST
- **MySQL** - Base de datos relacional
- **JWT** - Autenticación por tokens

### **Características Técnicas**
- **Responsive Design** - Optimizado para todos los dispositivos
- **PWA Ready** - Preparado para Progressive Web App
- **SEO Optimized** - Meta tags y estructura semántica
- **Performance** - Lazy loading y optimizaciones de rendimiento

## 🚀 **Instalación y Configuración**

### **Prerrequisitos**
- Node.js 16+ 
- npm o yarn
- Servidor backend Laravel ejecutándose en `http://127.0.0.1:8000`

### **Pasos de Instalación**

1. **Clonar el repositorio**
```bash
git clone [URL_DEL_REPOSITORIO]
cd Mecaza
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
# Crear archivo .env si no existe
cp .env.example .env
```

4. **Ejecutar en modo desarrollo**
```bash
npm run dev
```

5. **Construir para producción**
```bash
npm run build
npm run preview
```

## 📱 **Estructura de la Aplicación**

### **Páginas Principales**
```
src/
├── pages/
│   ├── index.jsx              # Página principal (usuarios no registrados)
│   ├── indexLogin.jsx         # Página principal (usuarios registrados)
│   ├── indexAdmin.jsx         # Panel administrativo
│   ├── VerDetalles.jsx        # Detalles del viaje y reserva
│   ├── ListaUsuarios.jsx      # Lista de usuarios del sistema
│   └── indexAdmin.jsx         # Panel de administración
├── Usuarios/
│   ├── login.jsx              # Página de inicio de sesión
│   ├── Registrar.jsx          # Registro de nuevos usuarios
│   ├── VerPerfil.jsx          # Visualización del perfil
│   ├── AjustesPerfil.jsx      # Edición del perfil
│   └── MisReservas.jsx        # Historial de reservas del usuario
├── conductor/
│   ├── Conductor.jsx          # Panel del conductor
│   ├── ConductorNotificaciones.jsx # Notificaciones del conductor
│   └── indexAdmin.jsx         # Panel administrativo del conductor
└── components/
    ├── CarImage.jsx           # Componente de imagen del carro
    ├── email.jsx              # Componente de email
    ├── ToastNotification.jsx  # Notificaciones toast
    └── UserMenu.jsx           # Menú de usuario
```

## 🔐 **Sistema de Autenticación**

### **Roles de Usuario**
- **Usuario Regular**: Acceso a búsqueda, reservas y perfil
- **Conductor**: Gestión de vehículos y viajes
- **Administrador**: Acceso completo al sistema

### **Flujo de Autenticación**
1. Registro con email y contraseña
2. Verificación de credenciales
3. Generación de JWT token
4. Almacenamiento en localStorage
5. Redirección según rol del usuario

## 🚗 **Sistema de Estados del Viaje**

### **Estados Disponibles**
- **🚗 Esperando Pasajeros** (ID: 1) - Verde
- **🛣️ En Viaje** (ID: 2) - Amarillo  
- **🔧 En Mantenimiento** (ID: 3) - Rojo
- **❌ Fuera de Servicio** (ID: 4) - Gris

### **Transiciones de Estado**
- Los conductores pueden actualizar el estado en tiempo real
- Los pasajeros reciben notificaciones de cambios
- El sistema mantiene historial de cambios

## 💰 **Sistema de Precios**

### **Rutas Configurables**
- **Caucasia - Medellín** (cauca-mede)
- **Zaragoza - Medellín** (zara-mede)
- **Zaragoza - Caucasia** (zara-cauca)

### **Gestión de Tarifas**
- Configuración desde el panel administrativo
- Precios por ruta específica
- Historial de cambios de precios

## 📊 **API Endpoints**

### **Vehículos**
- `GET /api/listarcarro` - Listar todos los carros
- `POST /api/agregarcarro` - Agregar nuevo carro
- `PUT /api/actualizarcarro/{id}` - Actualizar carro existente

### **Reservas**
- `GET /api/listarreserva` - Listar reservas
- `POST /api/agregarreserva` - Crear nueva reserva
- `PUT /api/actualizarreserva/{id}` - Actualizar reserva

### **Estados**
- `POST /api/agregarestados` - Agregar nuevo estado
- `GET /api/listarestados` - Listar estados disponibles

### **Precios**
- `POST /api/agregarprecio` - Configurar precios por ruta
- `GET /api/listarprecios` - Obtener precios actuales

## 🎨 **Características de UI/UX**

### **Diseño Responsivo**
- **Mobile First** - Optimizado para dispositivos móviles
- **Breakpoints** - Adaptable a tablets y desktop
- **Touch Friendly** - Interacciones optimizadas para touch

### **Componentes Reutilizables**
- **Cards** - Tarjetas de información consistentes
- **Modals** - Ventanas emergentes para acciones
- **Forms** - Formularios con validación
- **Buttons** - Botones con estados y animaciones

### **Animaciones y Transiciones**
- **Hover Effects** - Efectos al pasar el mouse
- **Loading States** - Indicadores de carga
- **Smooth Transitions** - Transiciones suaves entre estados

## 🔧 **Configuración del Entorno**

### **Variables de Entorno**
```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
VITE_APP_NAME=Mecaza
VITE_APP_VERSION=1.0.0
```

### **Configuración de Vite**
```javascript
// vite.config.js
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://127.0.0.1:8000'
    }
  }
})
```

## 📈 **Métricas y Rendimiento**

### **Indicadores de Rendimiento**
- **First Contentful Paint** < 1.5s
- **Largest Contentful Paint** < 2.5s
- **Cumulative Layout Shift** < 0.1
- **First Input Delay** < 100ms

### **Optimizaciones Implementadas**
- **Code Splitting** - Carga lazy de componentes
- **Image Optimization** - Compresión y formatos modernos
- **Bundle Analysis** - Monitoreo del tamaño del bundle
- **Caching Strategy** - Estrategia de caché optimizada

## 🧪 **Testing**

### **Tipos de Pruebas**
- **Unit Tests** - Pruebas de componentes individuales
- **Integration Tests** - Pruebas de flujos completos
- **E2E Tests** - Pruebas de usuario real

### **Herramientas de Testing**
- **Jest** - Framework de testing
- **React Testing Library** - Testing de componentes
- **Cypress** - Testing end-to-end

## 🚀 **Despliegue**

### **Plataformas Soportadas**
- **Vercel** - Despliegue automático desde Git
- **Netlify** - Hosting estático con funciones serverless
- **AWS S3 + CloudFront** - Hosting en la nube de Amazon
- **GitHub Pages** - Hosting gratuito para proyectos open source

### **Variables de Entorno de Producción**
```env
VITE_API_BASE_URL=https://api.mecaza.com
NODE_ENV=production
```

## 🤝 **Contribución**

### **Cómo Contribuir**
1. Fork del repositorio
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit de cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

### **Estándares de Código**
- **ESLint** - Linting de JavaScript/JSX
- **Prettier** - Formateo de código
- **Conventional Commits** - Estándar de mensajes de commit
- **Code Review** - Revisión obligatoria de código

## 📄 **Licencia**

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👥 **Equipo de Desarrollo**

- **Desarrollador Frontend** - [Tu Nombre]
- **Desarrollador Backend** - [Nombre del Backend]
- **Diseñador UI/UX** - [Nombre del Diseñador]
- **Product Manager** - [Nombre del PM]

## 📞 **Contacto y Soporte**

- **Email**: soporte@mecaza.com
- **Website**: https://mecaza.com
- **Documentación**: https://docs.mecaza.com
- **Issues**: https://github.com/tu-usuario/mecaza/issues

## 🔄 **Changelog**

### **v1.0.0** (2024-01-XX)
- ✨ Lanzamiento inicial de la plataforma
- 🚗 Sistema completo de reservas de viajes
- 👨‍💼 Panel administrativo funcional
- 📱 Diseño responsive completo
- 🔐 Sistema de autenticación JWT
- 📊 Estadísticas en tiempo real

---

**Mecaza** - Conectando personas, un viaje a la vez 🚗✨
