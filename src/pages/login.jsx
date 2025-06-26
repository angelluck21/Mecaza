import React from "react";


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-yellow-300 to-green-400">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm">
        <h2 className="text-2xl font-semibold text-center text-blue-700 mb-6">Iniciar Sesión</h2>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Correo electrónico</label>
            <input
              type="email"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              placeholder="tucorreo@ejemplo.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Contraseña</label>
            <input
              type="password"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Entrar
          </button>
          <p className="mt-4 text-sm text-center text-yellow-600">
          ¿No tienes una cuenta? <link onClick={ ()=> 'Registrar'} className="underline hover:text-yellow-700">Regístrate</link>
        </p>
        </form>
        
      </div>
    </div>
  );


export default login; 
