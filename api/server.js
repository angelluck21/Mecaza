const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 8000;

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

// Base de datos simulada para carros
let carros = [
  {
    id: 1,
    id_carros: 1,
    Conductor: "Juan Pérez",
    Telefono: "+57 300 123 4567",
    Placa: "ABC123",
    Asientos: 4,
    Destino: "Medellín",
    Horasalida: "08:00",
    Fecha: "2024-01-20",
    Estado: 1,
    Userid: 1,
    Imagencarro: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=300&fit=crop",
    created_at: "2024-01-15T10:30:00Z"
  },
  {
    id: 2,
    id_carros: 2,
    Conductor: "María García",
    Telefono: "+57 310 987 6543",
    Placa: "XYZ789",
    Asientos: 6,
    Destino: "Caucasia",
    Horasalida: "14:30",
    Fecha: "2024-01-21",
    Estado: 1,
    Userid: 2,
    Imagencarro: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=300&fit=crop",
    created_at: "2024-01-15T11:15:00Z"
  },
  {
    id: 3,
    id_carros: 3,
    Conductor: "Carlos López",
    Telefono: "+57 315 456 7890",
    Placa: "DEF456",
    Asientos: 4,
    Destino: "Zaragoza",
    Horasalida: "16:00",
    Fecha: "2024-01-22",
    Estado: 1,
    Userid: 3,
    Imagencarro: "https://images.unsplash.com/photo-1563720223185-11003d516935?w=400&h=300&fit=crop",
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

// POST - Agregar carro
app.post('/api/agregarcarros', (req, res) => {
  try {
    const { Conductor, Telefono, Placa, Asientos, Destino, Horasalida, Fecha, Estado, Userid } = req.body;
    
    console.log('POST /api/agregarcarros - Agregando nuevo carro');
    console.log('Datos recibidos:', req.body);
    
    // Validación de campos requeridos
    if (!Conductor || !Telefono || !Placa || !Asientos || !Destino || !Horasalida || !Fecha) {
      return res.status(422).json({
        success: false,
        message: 'Error de validación',
        errors: {
          Conductor: !Conductor ? 'El campo Conductor es requerido' : null,
          Telefono: !Telefono ? 'El campo Telefono es requerido' : null,
          Placa: !Placa ? 'El campo Placa es requerido' : null,
          Asientos: !Asientos ? 'El campo Asientos es requerido' : null,
          Destino: !Destino ? 'El campo Destino es requerido' : null,
          Horasalida: !Horasalida ? 'El campo Horasalida es requerido' : null,
          Fecha: !Fecha ? 'El campo Fecha es requerido' : null
        }
      });
    }
    
    // Validación de formato de fecha
    const fechaObj = new Date(Fecha);
    if (isNaN(fechaObj.getTime())) {
      return res.status(422).json({
        success: false,
        message: 'Error de validación',
        errors: {
          Fecha: 'El formato de fecha no es válido'
        }
      });
    }
    
    const nuevoCarro = {
      id: carros.length + 1,
      Conductor: Conductor.trim(),
      Telefono: Telefono.trim(),
      Placa: Placa.trim(),
      Asientos: parseInt(Asientos) || 0,
      Destino: Destino.trim(),
      Horasalida: Horasalida.trim(),
      Fecha: Fcha.trim(),
      Estado: Estado || 1,
      Userid: Userid || 0,
      created_at: new Date().toISOString()
    };
    
    carros.push(nuevoCarro);
    
    console.log(`Nuevo carro agregado con ID: ${nuevoCarro.id}`);
    
    res.status(201).json({
      success: true,
      data: nuevoCarro,
      message: 'Carro agregado exitosamente'
    });
    
  } catch (error) {
    console.error('Error al agregar carro:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// GET - Listar todos los carros
app.get('/api/carros', (req, res) => {
  try {
    console.log('GET /api/carros - Obteniendo todos los carros');
    res.json({
      success: true,
      data: carros,
      message: 'Carros obtenidos exitosamente'
    });
  } catch (error) {
    console.error('Error al obtener carros:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// GET - Listar todos los carros (ruta alternativa)
app.get('/api/listarcarro', (req, res) => {
  try {
    console.log('GET /api/listarcarro - Obteniendo todos los carros');
    res.json({
      success: true,
      data: carros,
      message: 'Carros obtenidos exitosamente'
    });
  } catch (error) {
    console.error('Error al obtener carros:', error);
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
  console.log(`   GET  /api/carros - Listar todos los carros`);
  console.log(`   GET  /api/listarcarro - Listar todos los carros (ruta alternativa)`);
  console.log(`   POST /api/agregarcarros - Agregar nuevo carro`);
});

module.exports = app; 