# 📚 MANUAL DE USUARIO - MECAZA

## 🚗 **Descripción General**
Mecaza es una plataforma web que conecta conductores verificados con pasajeros que buscan viajes seguros y cómodos. La aplicación permite a los usuarios buscar, reservar y gestionar viajes en tiempo real.

---

## 🏠 **PÁGINA PRINCIPAL (indexLogin)**

### **Características Principales**

#### 1. **Navegación Superior**
- **Logo Mecaza**: Icono de carro azul con el nombre de la empresa
- **Barra de búsqueda**: Busca carros por conductor, destino, placa, hora o fecha
- **Menú de usuario**: Acceso a perfil, ajustes y cerrar sesión

#### 2. **Carrusel de Presentación**
- **3 diapositivas automáticas** que rotan cada 5 segundos:
  - 🛡️ **Viajes Seguros y Confiables**: Conductores verificados
  - 🌍 **Destinos Increíbles**: Explora nuevos lugares
  - 💰 **Precios Justos**: Tarifas transparentes

#### 3. **Lista de Carros Disponibles**
Cada tarjeta de carro muestra:

**Información Visual:**
- Imagen del vehículo (con fallback si no hay imagen)
- Nombre del conductor
- Placa del vehículo

**Estado del Viaje:**
- 🚗 **Verde**: Esperando Pasajeros
- 🛣️ **Amarillo**: En Viaje
- 🔧 **Naranja**: En Mantenimiento
- ❌ **Rojo**: Fuera de Servicio

**Detalles del Viaje:**
- Destino
- Hora de salida
- Fecha de salida
- Asientos disponibles (con indicador de ocupación)
- Botón "Ver Detalles"

#### 4. **Funcionalidades de Búsqueda**
- **Búsqueda en tiempo real** por:
  - Nombre del conductor
  - Destino
  - Placa del vehículo
  - Hora de salida
  - Fecha de salida

#### 5. **Menú Móvil**
- **Acceso completo** en dispositivos móviles
- Búsqueda integrada
- Navegación rápida a ajustes
- Cerrar sesión

---

## 🔍 **PÁGINA DE DETALLES (VerDetalles)**

### **Secciones Principales**

#### 1. **Imagen del Vehículo**
- **Visualización completa** del carro
- **Fallback automático** si no hay imagen disponible
- **Responsive design** para diferentes tamaños de pantalla

#### 2. **Información del Conductor**
- **Nombre completo** del conductor
- **Placa del vehículo**
- **Número de teléfono** para contacto directo

#### 3. **Precios por Ruta**
- **Zaragoza → Medellín**: $70,000
- **Zaragoza → Caucasia**: $30,000
- **Caucasia → Medellín**: $90,000

#### 4. **Detalles del Viaje**
- **Destino** del viaje
- **Estado del carro** con indicador visual
- **Fecha de salida** formateada
- **Hora de salida**
- **Asientos disponibles** con contador de ocupación

#### 5. **Selección de Asiento**
- **Layout visual** del vehículo
- **Asientos del conductor** (no seleccionables)
- **Asientos traseros** numerados del 1 al 4
- **Indicadores visuales**:
  - 🔴 **Rojo**: Ocupado
  - 🔵 **Azul**: Seleccionado
  - ⚪ **Gris**: Disponible

#### 6. **Información del Pasajero**
- **Nombre**: Se toma automáticamente de la cuenta
- **Teléfono**: Ingreso manual obligatorio
- **Ubicación de recogida**: Dirección donde será recogido

#### 7. **Proceso de Reserva**
1. **Seleccionar asiento** disponible
2. **Completar información** personal
3. **Confirmar reserva**
4. **Revisar detalles** en modal
5. **Confirmar envío**

---

## 👤 **GESTIÓN DE CUENTA**

### **Acceso al Perfil**
- **Menú desplegable** en la esquina superior derecha
- **Acceso directo** desde menú móvil

### **Funciones Disponibles**
- **Ver perfil** personal
- **Editar información** de cuenta
- **Gestionar reservas** existentes
- **Cerrar sesión** de forma segura

---

## 📱 **RESPONSIVE DESIGN**

### **Dispositivos Soportados**
- **Desktop**: Pantallas grandes con navegación completa
- **Tablet**: Adaptación automática del layout
- **Móvil**: Menú hamburguesa y navegación optimizada

### **Características Móviles**
- **Menú deslizable** desde la izquierda
- **Búsqueda integrada** en menú móvil
- **Botones táctiles** optimizados
- **Scroll suave** y navegación intuitiva

---

## 🔐 **SEGURIDAD Y AUTENTICACIÓN**

### **Sistema de Login**
- **Autenticación requerida** para todas las funciones
- **Redirección automática** si no hay sesión activa
- **Almacenamiento seguro** de datos de usuario

### **Protección de Datos**
- **Validación de formularios** en tiempo real
- **Verificación de permisos** para cada acción
- **Logout automático** al cerrar sesión

---

## 🚨 **ESTADOS Y NOTIFICACIONES**

### **Estados del Viaje**
- **Pendiente**: Reserva creada, esperando confirmación
- **Confirmado**: Conductor ha confirmado el viaje
- **En curso**: Viaje en progreso
- **Completado**: Viaje finalizado exitosamente
- **Cancelado**: Reserva cancelada por el usuario o conductor

### **Sistema de Notificaciones**
- **Confirmaciones** de acciones exitosas
- **Alertas** para campos requeridos
- **Mensajes de error** descriptivos
- **Indicadores visuales** de estado

---

## 🎨 **INTERFAZ Y USABILIDAD**

### **Diseño Visual**
- **Paleta de colores** azul y blanco
- **Iconos intuitivos** para cada función
- **Tipografía clara** y legible
- **Espaciado consistente** entre elementos

### **Experiencia de Usuario**
- **Navegación intuitiva** con breadcrumbs
- **Feedback visual** inmediato para acciones
- **Carga progresiva** de contenido
- **Estados de carga** claramente indicados

---

## 🛠️ **FUNCIONALIDADES TÉCNICAS**

### **Rendimiento**
- **Carga optimizada** de imágenes
- **Búsqueda en tiempo real** sin recargar página
- **Validación instantánea** de formularios
- **Caché inteligente** de datos

### **Compatibilidad**
- **Navegadores modernos** (Chrome, Firefox, Safari, Edge)
- **Dispositivos iOS y Android**
- **Resoluciones** desde 320px hasta 4K

---

## 📞 **SOPORTE Y CONTACTO**

### **Información de Contacto**
- **Teléfono**: 324 311 4965
- **Email**: Angelluiswar456@gmail.com
- **Ubicación**: Bogotá, localidad de Kennedy

### **Redes Sociales**
- **Facebook**: Mecaza Oficial
- **Twitter**: @MecazaApp
- **Instagram**: @mecaza_viajes

---

## 🔧 **SOLUCIÓN DE PROBLEMAS**

### **Problemas Comunes**

#### **No se pueden ver los carros**
- Verificar conexión a internet
- Recargar la página
- Limpiar caché del navegador

#### **Error al hacer reserva**
- Completar todos los campos obligatorios
- Verificar que el asiento esté disponible
- Asegurar que el teléfono sea válido

#### **Problemas de visualización**
- Usar navegador actualizado
- Verificar resolución de pantalla
- Limpiar cookies del sitio

### **Contacto Técnico**
- **Reportar bugs** a través del email de contacto
- **Incluir capturas de pantalla** del problema
- **Describir pasos** para reproducir el error

---

## 📋 **GLOSARIO DE TÉRMINOS**

- **Carro**: Vehículo disponible para viajes
- **Conductor**: Persona que maneja el vehículo
- **Pasajero**: Usuario que reserva un asiento
- **Reserva**: Confirmación de un asiento en un viaje
- **Asiento**: Lugar específico en el vehículo
- **Estado**: Condición actual del carro o reserva
- **Destino**: Lugar de llegada del viaje
- **Ubicación de recogida**: Punto donde se recoge al pasajero

---

## 📱 **VERSIÓN MÓVIL**

### **Características Especiales**
- **Menú hamburguesa** para navegación
- **Búsqueda integrada** en menú móvil
- **Botones táctiles** optimizados
- **Scroll suave** y navegación intuitiva

### **Optimizaciones Móviles**
- **Imágenes responsivas** que se adaptan a la pantalla
- **Formularios optimizados** para entrada táctil
- **Navegación por gestos** donde sea posible
- **Carga rápida** en conexiones móviles

---

## 🎯 **CONSEJOS DE USO**

### **Para Pasajeros**
1. **Completar perfil** con información actualizada
2. **Verificar disponibilidad** antes de reservar
3. **Llegar 10 minutos antes** de la hora de salida
4. **Mantener comunicación** con el conductor

### **Para Conductores**
1. **Actualizar estado** del vehículo regularmente
2. **Confirmar reservas** de manera oportuna
3. **Mantener información** del vehículo actualizada
4. **Responder consultas** de pasajeros

---

## 🔄 **ACTUALIZACIONES Y MEJORAS**

### **Nuevas Funcionalidades**
- **Sistema de calificaciones** para conductores y pasajeros
- **Chat integrado** entre usuarios
- **Notificaciones push** para actualizaciones
- **Historial completo** de viajes

### **Mejoras de Rendimiento**
- **Carga más rápida** de páginas
- **Búsqueda mejorada** con filtros avanzados
- **Interfaz más intuitiva** y moderna
- **Soporte para más idiomas**

---

## 📞 **CONTACTO DE EMERGENCIA**

### **Situaciones Urgentes**
- **Problemas de seguridad**: Contactar autoridades locales
- **Accidentes de tránsito**: Llamar al 123 (Defensa Civil)
- **Emergencias médicas**: Llamar al 125 (Cruz Roja)
- **Problemas técnicos críticos**: Email de soporte técnico

---

*Este manual se actualiza regularmente. Última actualización: Diciembre 2024*

**Mecaza - Tu plataforma confiable para viajes seguros y cómodos** 🚗✨
