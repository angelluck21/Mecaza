# API Mecaza - Gestión de Reservas

API REST para el sistema Mecaza que maneja las reservas de viajes.

## 🚀 Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Iniciar el servidor:
```bash
# Desarrollo (con nodemon)
npm run dev

# Producción
npm start
```

El servidor se ejecutará en `http://localhost:3001`

## 📋 Endpoints

### GET /api/test
Prueba la API
```bash
curl http://localhost:3001/api/test
```

### GET /api/listarreserva
Obtiene todas las reservas
```bash
curl http://localhost:3001/api/listarreserva
```

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "id_users": 101,
      "ubicacion": "https://maps.google.com/?q=Medellin",
      "asiento": "A1",
      "comentario": "Juan Pérez",
      "estado": "pendiente",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "message": "Reservas obtenidas exitosamente"
}
```

### GET /api/reserva/:id
Obtiene una reserva específica
```bash
curl http://localhost:3001/api/reserva/1
```

### POST /api/crearreserva
Crea una nueva reserva
```bash
curl -X POST http://localhost:3001/api/crearreserva \
  -H "Content-Type: application/json" \
  -d '{
    "id_users": 104,
    "ubicacion": "https://maps.google.com/?q=Zaragoza",
    "asiento": "D4",
    "comentario": "Ana Martínez"
  }'
```

### PUT /api/confirmarreserva/:id
Confirma o rechaza una reserva
```bash
# Confirmar reserva
curl -X PUT http://localhost:3001/api/confirmarreserva/1 \
  -H "Content-Type: application/json" \
  -d '{"estado": "confirmada"}'

# Rechazar reserva
curl -X PUT http://localhost:3001/api/confirmarreserva/1 \
  -H "Content-Type: application/json" \
  -d '{"estado": "rechazada"}'
```

### DELETE /api/eliminarreserva/:id
Elimina una reserva
```bash
curl -X DELETE http://localhost:3001/api/eliminarreserva/1
```

## 📊 Estructura de Datos

### Reserva
```json
{
  "id": 1,
  "id_users": 101,
  "ubicacion": "https://maps.google.com/?q=Medellin",
  "asiento": "A1",
  "comentario": "Juan Pérez",
  "estado": "pendiente",
  "created_at": "2024-01-15T10:30:00Z"
}
```

### Estados de Reserva
- `pendiente`: Reserva sin confirmar
- `confirmada`: Reserva confirmada por el conductor
- `rechazada`: Reserva rechazada por el conductor

## 🔧 Configuración

### Variables de Entorno
- `PORT`: Puerto del servidor (por defecto: 3001)

### CORS
La API está configurada para aceptar peticiones desde cualquier origen en desarrollo.

## 🐛 Solución de Problemas

### Error 404 - Reserva no encontrada
- Verificar que el ID de la reserva existe
- Revisar que el ID no sea `undefined`

### Error 400 - ID requerido
- Asegurar que se está enviando el ID en la URL
- Verificar que el ID no sea `undefined`

### Error de conexión
- Verificar que el servidor esté ejecutándose
- Comprobar que el puerto 3001 esté disponible

## 📝 Logs

El servidor muestra logs detallados de todas las operaciones:
- Peticiones recibidas
- IDs de reservas procesadas
- Estados actualizados
- Errores y excepciones

## 🔄 Integración con Frontend

La API está diseñada para trabajar con el frontend React de Mecaza. Los endpoints coinciden con las llamadas realizadas desde el componente `Conductor.jsx`. 