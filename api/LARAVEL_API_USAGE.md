# API Laravel - Uso en Frontend

## 🚀 Configuración Actual

El frontend ahora está configurado para usar tu **API Laravel existente** en lugar del servidor Node.js.

## 📝 Endpoint de Actualización

### Ruta Laravel
```php
Route::put("/actualizarestadocarro/{carro}", [CarrosController::class,"UpdateEstado"]);
```

### Controlador Laravel
```php
public function updateestado(Request $request, Carros $carro){
    $carro->update([
        $carro->id_estados = $request->Estado,
        $carro->horasalida = $request->Horasalida,
        $carro->fecha = $request->Fecha
    ]);
    return response()->json([
        "message" => "Actualizado exitosamente"
    ],200);
}
```

## 🔧 Cambios Realizados en Frontend

### 1. Función `handleUpdateEstado`
- **Campo enviado**: `Estado` (en lugar de `Estadoid`)
- **URL**: `http://127.0.0.1:8000/api/actualizarestadocarro/{id}`
- **Método**: `PUT`

### 2. Función `handleAssignEstado`
- **Campo enviado**: `Estado` (en lugar de `Estadoid`)
- **Misma URL y método**

## 📊 Estructura de Datos Enviados

### Request Body
```json
{
  "Estado": 2,
  "Fecha": "2025-12-02",
  "Horasalida": "16:54"
}
```

### Campos:
- **`Estado`** (requerido): ID del nuevo estado del carro
- **`Fecha`** (opcional): Nueva fecha del viaje
- **`Horasalida`** (opcional): Nueva hora de salida

## ✅ Verificación

### 1. Asegúrate de que Laravel esté corriendo en puerto 8000
```bash
php artisan serve --port=8000
```

### 2. Verifica que la ruta esté registrada
```bash
php artisan route:list | grep actualizarestadocarro
```

### 3. Prueba el endpoint
```bash
curl -X PUT http://127.0.0.1:8000/api/actualizarestadocarro/1 \
  -H "Content-Type: application/json" \
  -d '{"Estado": 2, "Fecha": "2025-12-02", "Horasalida": "16:54"}'
```

## 🐛 Solución de Problemas

### Error 404 - Ruta no encontrada
- Verifica que la ruta esté registrada en `routes/api.php`
- Asegúrate de que Laravel esté corriendo

### Error 500 - Error interno
- Revisa los logs de Laravel (`storage/logs/laravel.log`)
- Verifica que el modelo `Carros` exista y tenga los campos correctos

### Error de validación
- Asegúrate de enviar el campo `Estado` (requerido)
- Verifica el formato de fecha (YYYY-MM-DD)
- Verifica el formato de hora (HH:MM)

## 🔄 Flujo de Actualización

### **Opción 1: Solo Cambiar Estado (Botón "Usar")**
1. **Usuario selecciona carro** → Se abre modal de actualización
2. **Usuario hace clic en "Usar"** → Se llama a `handleAssignEstado(estadoId)`
3. **Se envía solo el estado** → `PUT /api/actualizarestadocarro/{id}` con `{Estado: estadoId}`
4. **Laravel actualiza solo el estado** → Usa `$carro->update()`
5. **Se recibe respuesta** → Se muestra notificación de éxito
6. **Modal permanece abierto** → Permite modificar fecha/hora si se desea

### **Opción 2: Actualización Completa (Botón "Actualizar Carro")**
1. **Usuario modifica fecha/hora** → Se almacenan en `selectedCarro.nuevaFecha` y `selectedCarro.nuevaHora`
2. **Usuario hace clic en "Actualizar Carro"** → Se llama a `handleUpdateEstado()`
3. **Se envían todos los cambios** → `PUT /api/actualizarestadocarro/{id}` con estado, fecha y hora
4. **Laravel actualiza todo** → Usa `$carro->update()`
5. **Se recibe respuesta** → Se muestra notificación de éxito
6. **Modal se cierra** → Se actualiza la lista de carros

## 📱 Uso en el Frontend

### **Opción 1: Solo Cambiar Estado (Botón "Usar")**

```javascript
// Solo cambia el estado
const response = await axios.put(`http://127.0.0.1:8000/api/actualizarestadocarro/${carroId}`, {
  Estado: nuevoEstado
});

if (response.data.message) {
  console.log('Estado actualizado:', response.data.message);
}
```

### **Opción 2: Actualización Completa (Botón "Actualizar Carro")**

```javascript
// Actualiza estado, fecha y hora
const response = await axios.put(`http://127.0.0.1:8000/api/actualizarestadocarro/${carroId}`, {
  Estado: nuevoEstado,      // Opcional (si se seleccionó)
  Fecha: nuevaFecha,        // Opcional
  Horasalida: nuevaHora    // Opcional
});

if (response.data.message) {
  console.log('Carro actualizado:', response.data.message);
}
```

### Respuesta Esperada
```json
{
  "message": "Actualizado exitosamente"
}
```

## 🎯 Próximos Pasos

1. **Verifica que Laravel esté corriendo** en puerto 8000
2. **Prueba el endpoint** con Postman o curl
3. **Verifica los logs** si hay errores
4. **Testea desde el frontend** haciendo clic en "Usar" en cualquier estado

## 📋 Notas Importantes

- El frontend ahora usa **`Estado`** en lugar de **`Estadoid`**
- La URL sigue siendo la misma: `/api/actualizarestadocarro/{id}`
- Los campos `Fecha` y `Horasalida` son opcionales
- Solo se envían los campos que se han modificado
