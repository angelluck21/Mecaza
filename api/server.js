const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Base de datos simulada para reservas
let reservas = [
  {
    id: 1,
    id_users: 101,
    ubicacion: "https://maps.google.com/?q=Medellin",
    asiento: "A1",
    comentario: "Juan Pérez",
    estado: "pendiente",
    created_at: "2024-01-15T10:30:00Z"
  },
  {
    id: 2,
    id_users: 102,
    ubicacion: "Calle 45 #23-12, Medellín",
    asiento: "B3",
    comentario: "María García",
    estado: "pendiente",
    created_at: "2024-01-15T11:15:00Z"
  },
  {
    id: 3,
    id_users: 103,
    ubicacion: "https://maps.google.com/?q=Caucasia",
    asiento: "C2",
    comentario: "Carlos López",
    estado: "confirmada",
    created_at: "2024-01-15T09:45:00Z"
  }
];

// GET - Listar todas las reservas
app.get('/api/listarreserva', (req, res) => {
  try {
    console.log('GET /api/listarreserva - Obteniendo todas las reservas');
    res.json({
      success: true,
      data: reservas,
      message: 'Reservas obtenidas exitosamente'
    });
  } catch (error) {
    console.error('Error al obtener reservas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// PUT - Confirmar/Rechazar reserva
app.put('/api/confirmarreserva/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    
    console.log(`PUT /api/confirmarreserva/${id} - Estado: ${estado}`);
    
    if (!id || id === 'undefined') {
      return res.status(400).json({
        success: false,
        message: 'ID de reserva requerido'
      });
    }
    
    const reservaIndex = reservas.findIndex(r => r.id == id);
    
    if (reservaIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Reserva no encontrada'
      });
    }
    
    // Actualizar el estado de la reserva
    reservas[reservaIndex].estado = estado;
    
    console.log(`Reserva ${id} actualizada a estado: ${estado}`);
    
    res.json({
      success: true,
      data: reservas[reservaIndex],
      message: `Reserva ${estado === 'confirmada' ? 'confirmada' : 'rechazada'} exitosamente`
    });
    
  } catch (error) {
    console.error('Error al actualizar reserva:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// POST - Crear nueva reserva
app.post('/api/crearreserva', (req, res) => {
  try {
    const { id_users, ubicacion, asiento, comentario } = req.body;
    
    console.log('POST /api/crearreserva - Creando nueva reserva');
    
    if (!id_users || !ubicacion || !asiento || !comentario) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos son requeridos'
      });
    }
    
    const nuevaReserva = {
      id: reservas.length + 1,
      id_users,
      ubicacion,
      asiento,
      comentario,
      estado: 'pendiente',
      created_at: new Date().toISOString()
    };
    
    reservas.push(nuevaReserva);
    
    console.log(`Nueva reserva creada con ID: ${nuevaReserva.id}`);
    
    res.status(201).json({
      success: true,
      data: nuevaReserva,
      message: 'Reserva creada exitosamente'
    });
    
  } catch (error) {
    console.error('Error al crear reserva:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// DELETE - Eliminar reserva
app.delete('/api/eliminarreserva/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`DELETE /api/eliminarreserva/${id}`);
    
    if (!id || id === 'undefined') {
      return res.status(400).json({
        success: false,
        message: 'ID de reserva requerido'
      });
    }
    
    const reservaIndex = reservas.findIndex(r => r.id == id);
    
    if (reservaIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Reserva no encontrada'
      });
    }
    
    const reservaEliminada = reservas.splice(reservaIndex, 1)[0];
    
    console.log(`Reserva ${id} eliminada`);
    
    res.json({
      success: true,
      data: reservaEliminada,
      message: 'Reserva eliminada exitosamente'
    });
    
  } catch (error) {
    console.error('Error al eliminar reserva:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// GET - Obtener reserva por ID
app.get('/api/reserva/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`GET /api/reserva/${id}`);
    
    if (!id || id === 'undefined') {
      return res.status(400).json({
        success: false,
        message: 'ID de reserva requerido'
      });
    }
    
    const reserva = reservas.find(r => r.id == id);
    
    if (!reserva) {
      return res.status(404).json({
        success: false,
        message: 'Reserva no encontrada'
      });
    }
    
    res.json({
      success: true,
      data: reserva,
      message: 'Reserva obtenida exitosamente'
    });
    
  } catch (error) {
    console.error('Error al obtener reserva:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Ruta de prueba
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor API corriendo en http://localhost:${PORT}`);
  console.log(`📋 Endpoints disponibles:`);
  console.log(`   GET  /api/test - Probar API`);
  console.log(`   GET  /api/listarreserva - Listar todas las reservas`);
  console.log(`   GET  /api/reserva/:id - Obtener reserva específica`);
  console.log(`   POST /api/crearreserva - Crear nueva reserva`);
  console.log(`   PUT  /api/confirmarreserva/:id - Confirmar/Rechazar reserva`);
  console.log(`   DELETE /api/eliminarreserva/:id - Eliminar reserva`);
});

module.exports = app; 