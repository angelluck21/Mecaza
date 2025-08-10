# Información de Debugging para el Backend

## Problema Actual - SOLUCIONADO ✅
El problema era que el backend Laravel espera el campo `Rol` (con R mayúscula), pero el frontend estaba enviando `rol` (con r minúscula).

## Datos que se están enviando desde el Frontend (CORREGIDO)

```javascript
{
  Nombre: "Nombre del usuario",
  Correo: "correo@ejemplo.com", 
  Contrasena: "contraseña",
  Telefono: "123456789",
  Rol: "administrador",     // ← Campo principal con mayúscula
  rol: "administrador",     // ← Fallback con minúscula
  role: "administrador"     // ← Fallback en inglés
}
```

## Posibles Causas del Problema

### 1. Nombre del Campo Incorrecto - SOLUCIONADO ✅
El problema era que el backend espera `Rol` (con R mayúscula), no `rol` (con r minúscula).

**Backend Laravel espera:**
```php
"rol" => $request->Rol  // ← Con R mayúscula
```

**Frontend ahora envía:**
```javascript
Rol: "administrador"  // ← Con R mayúscula
```

### 2. Validación en el Backend
Verificar las reglas de validación en el controlador de registro:
```php
// En el controlador de registro
$request->validate([
    'rol' => 'required|string|in:usuario,conductor,administrador',
    // o
    'role' => 'required|string|in:usuario,conductor,administrador',
]);
```

### 3. Asignación en el Modelo
Verificar que el campo esté en el `$fillable` del modelo User:
```php
protected $fillable = [
    'name',
    'email', 
    'password',
    'rol', // Asegurar que este campo esté aquí
    // otros campos...
];
```

### 4. Migración de Base de Datos
Verificar que la columna `rol` exista en la tabla `users`:
```sql
DESCRIBE users;
```

## Pasos para Debugging

### 1. Verificar el Controlador
En el controlador de registro, agregar logs:
```php
public function registro(Request $request)
{
    \Log::info('Datos recibidos:', $request->all());
    
    // Verificar si el campo rol está presente
    \Log::info('Campo rol:', ['rol' => $request->input('rol')]);
    \Log::info('Campo role:', ['role' => $request->input('role')]);
    
    // Resto del código...
}
```

### 2. Verificar el Modelo
Asegurar que el campo esté en `$fillable`:
```php
protected $fillable = [
    'name',
    'email',
    'password', 
    'rol', // Asegurar que esté aquí
    'telefono',
    // otros campos...
];
```

### 3. Verificar la Migración
Ejecutar:
```bash
php artisan migrate:status
php artisan migrate
```

### 4. Verificar la Base de Datos
```sql
SHOW TABLES;
DESCRIBE users;
```

## Solución Temporal
Si el problema persiste, se puede intentar:

1. **Cambiar el nombre del campo** en el frontend para que coincida con lo que espera el backend
2. **Modificar el controlador** para manejar múltiples nombres de campo
3. **Actualizar la migración** si la columna no existe

## Logs del Frontend
El frontend ahora envía logs detallados que incluyen:
- El valor de `selectedRol`
- Todos los datos que se envían
- El token de autenticación
- La respuesta del servidor (si es exitosa)
- Detalles completos del error (si falla)
