# Flujo de Redirección después del Registro y Login

## Proceso Actual

### 1. Registro Exitoso
Cuando un usuario se registra exitosamente:

1. **Se muestra notificación de éxito** con mensaje específico según el rol
2. **Se guardan los datos en localStorage** incluyendo el rol
3. **Se resetea el formulario**
4. **Se espera 2 segundos** (para que el usuario vea la notificación)
5. **Se redirige según el rol**

### 2. Login Exitoso
Cuando un usuario inicia sesión exitosamente:

1. **Se muestra notificación de éxito**
2. **Se guardan los datos en localStorage** incluyendo el rol y token
3. **Se espera 1.5 segundos** (para que el usuario vea la notificación)
4. **Se redirige según el rol**

### 3. Rutas de Redirección

```javascript
// Para Registro
const redirectPaths = {
  'usuario': '/login',           // Usuarios van al login
  'conductor': '/conductor',     // Conductores van al panel de conductor
  'administrador': '/indexAdmin' // Administradores van al panel de admin
};

// Para Login
const redirectPaths = {
  'usuario': '/indexLogin',      // Usuarios van al panel principal
  'conductor': '/conductor',     // Conductores van al panel de conductor
  'administrador': '/indexAdmin', // Administradores van al panel de admin
  'admin': '/indexAdmin'         // Fallback para 'admin'
};
```

### 4. Logs de Debugging

El sistema ahora incluye logs detallados para ambos flujos:

**Registro:**
```javascript
console.log('Rol seleccionado:', selectedRol);
console.log('Ruta de redirección:', targetPath);
console.log('Datos guardados en localStorage:', userData);
console.log('Iniciando redirección...');
```

**Login:**
```javascript
console.log('Rol del usuario:', userRol);
console.log('Ruta de redirección:', targetPath);
console.log('Datos guardados en localStorage:', userData);
console.log('Iniciando redirección...');
```

## Posibles Problemas y Soluciones

### Problema 1: No redirige
**Causas posibles:**
- El rol no se está guardando correctamente
- La ruta no existe en el router
- Error en la navegación

**Solución:**
- Verificar logs en la consola del navegador
- Confirmar que el rol está en localStorage
- Verificar que la ruta existe en App.jsx

### Problema 2: Redirige a la página incorrecta
**Causas posibles:**
- El rol no coincide con las rutas definidas
- Error en el mapeo de rutas

**Solución:**
- Verificar que el rol sea exactamente: 'usuario', 'conductor', o 'administrador'
- Confirmar que las rutas estén correctamente mapeadas

### Problema 3: Redirección muy rápida
**Causa:**
- El setTimeout puede ser muy corto

**Solución:**
- Aumentar el tiempo del setTimeout si es necesario

## Verificación

Para verificar que todo funciona:

### Registro:
1. **Abrir la consola del navegador** (F12)
2. **Registrar un administrador**
3. **Verificar los logs:**
   - "Rol seleccionado: administrador"
   - "Ruta de redirección: /indexAdmin"
   - "Iniciando redirección..."
4. **Confirmar que se redirige a /indexAdmin**

### Login:
1. **Abrir la consola del navegador** (F12)
2. **Iniciar sesión con un administrador**
3. **Verificar los logs:**
   - "Rol del usuario: administrador"
   - "Ruta de redirección: /indexAdmin"
   - "Iniciando redirección..."
4. **Confirmar que se redirige a /indexAdmin**

## Rutas Disponibles

Según App.jsx, las rutas disponibles son:
- `/indexAdmin` - Panel de administrador
- `/conductor` - Panel de conductor  
- `/login` - Página de login
- `/indexLogin` - Página principal después del login

## Diferencias entre Registro y Login

| Aspecto | Registro | Login |
|---------|----------|-------|
| Tiempo de espera | 2 segundos | 1.5 segundos |
| Usuarios van a | `/login` | `/indexLogin` |
| Conductores van a | `/conductor` | `/conductor` |
| Administradores van a | `/indexAdmin` | `/indexAdmin` |
