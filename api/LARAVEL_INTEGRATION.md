# Integración con Controlador Laravel

## Controlador Destroy

El controlador `ReservarviajeController::class` con el método `Destroy` maneja la eliminación de reservas:

```php
public function Destroy(Reservarviaje $reservarviaje)
{
    $reservarviaje->delete();
    return response()->json([
        'message' => 'Reserva eliminada Exitosamente!',
        'status' => 200
    ]);
}
```

## Ruta Laravel

```php
Route::delete("/eliminarreserva/{reservarviaje}", [ReservarviajeController::class, "Destroy"]);
```

## Integración Frontend

### URL de la API
- **Endpoint**: `http://127.0.0.1:8000/api/eliminarreserva/{id}`
- **Método**: `DELETE`
- **Headers**: 
  - `Authorization: Bearer {token}`
  - `Content-Type: application/json`
  - `Accept: application/json`

### Manejo de Respuesta

#### Éxito (200)
```json
{
  "message": "Reserva eliminada Exitosamente!",
  "status": 200
}
```

#### Errores Posibles
- **404**: Reserva no encontrada
- **401**: No autorizado
- **403**: Sin permisos
- **500**: Error interno del servidor

### Código Frontend Actualizado

```javascript
const handleDeleteReservation = async (reservation) => {
  if (!window.confirm('¿Estás seguro de que quieres cancelar esta reserva?')) {
    return;
  }

  const reservationId = reservation.id || reservation.id_reservarviaje || reservation.ID;

  try {
    console.log('Eliminando reserva:', reservation);
    console.log('ID de reserva:', reservationId);
    
    const response = await axios.delete(`http://127.0.0.1:8000/api/eliminarreserva/${reservationId}`, {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    });
    
    console.log('Reserva eliminada:', response.data);
    
    // Mostrar mensaje del controlador Laravel
    if (response.data && response.data.message) {
      alert(response.data.message);
    } else {
      alert('Reserva eliminada exitosamente');
    }
    
    // Recargar lista
    await fetchUserReservations();
  } catch (error) {
    console.error('Error al eliminar reserva:', error);
    
    let errorMessage = 'Error al eliminar la reserva';
    
    if (error.response) {
      if (error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error.response.status === 404) {
        errorMessage = 'Reserva no encontrada';
      } else if (error.response.status === 401) {
        errorMessage = 'No autorizado para eliminar esta reserva';
      } else if (error.response.status === 403) {
        errorMessage = 'No tienes permisos para eliminar esta reserva';
      }
    } else if (error.request) {
      errorMessage = 'Error de conexión. Verifica que el servidor esté ejecutándose.';
    }
    
    alert(errorMessage);
  }
};
```

## Características del Controlador

### ✅ Validación Automática
- Laravel automáticamente busca la reserva por ID
- Si no existe, devuelve 404 automáticamente

### ✅ Respuesta JSON
- Devuelve mensaje de éxito en español
- Incluye código de estado HTTP

### ✅ Logs de Debugging
- El frontend muestra logs detallados
- Incluye ID de reserva y datos completos

### ✅ Manejo de Errores
- Diferentes mensajes según el tipo de error
- Validación de autorización
- Verificación de permisos

## Testing

### Probar con curl
```bash
curl -X DELETE http://127.0.0.1:8000/api/eliminarreserva/1 \
  -H "Authorization: Bearer {tu_token}" \
  -H "Content-Type: application/json"
```

### Respuesta esperada
```json
{
  "message": "Reserva eliminada Exitosamente!",
  "status": 200
}
```

## Notas Importantes

1. **Model Binding**: Laravel usa model binding automático con `Reservarviaje $reservarviaje`
2. **Soft Deletes**: Si el modelo usa soft deletes, considera usar `forceDelete()`
3. **Autorización**: Asegúrate de que el usuario tenga permisos para eliminar
4. **Logs**: El controlador puede agregar logs para auditoría
5. **Transacciones**: Considera usar transacciones para operaciones críticas 