import React from "react";
import { LockClosedIcon, EnvelopeIcon } from '@heroicons/react/24/solid';
import { FaCar } from 'react-icons/fa';
import axios from 'axios';



function Registrar() {
  const handleRegister = (e) => {
    e.preventDefault();
    axios.post('http://127.0.0.1:8000/api/Registro', {
      Nombre: e.target.Nombre.value,
      Correo: e.target.Correo.value,
      Contraseña: e.target.Contraseña.value,
    })  
    .then(response => {
        console.log(response.data);
    })
    
    
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-900 px-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-8">
        <div className="flex justify-center mb-5">
          <FaCar className="text-blue-900 text-7xl" />
        </div>

        <h1 className="text-2xl font-bold text-center text-blue-900 mb-6">Crear cuenta</h1>
        <h1 className="text-base font-medium text-center text-blue-900 mb-6">¡Empieza a viajar con Mecaza!</h1>

        <form onSubmit={handleRegister} className="space-y-5">
  <div>
    <label className="block text-sm font-medium text-blue-900 mb-1">Nombre completo</label>
    <input
      name="Nombre"
      type="text"
      placeholder="Tu nombre"
      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md text-blue-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
    />
  </div>

  <div>
    <label className="block text-sm font-medium text-blue-900 mb-1">Correo electrónico</label>
    <div className="relative">
      <span className="absolute left-3 top-2.5 text-blue-900">
        <EnvelopeIcon className="h-5 w-5" />
      </span>
      <input
        name="Correo"
        type="email"
        placeholder="correo electrónico"
        className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-md text-blue-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
    </div>
  </div>

  <div>
    <label className="block text-sm font-medium text-blue-900 mb-1">Contraseña</label>
    <div className="relative">
      <span className="absolute left-3 top-2.5 text-blue-900">
        <LockClosedIcon className="h-5 w-5" />
      </span>
      <input
        name="Contraseña"
        type="password"
        placeholder="••••••••"
        className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-md text-blue-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
    </div>
  </div>

  <button
    type="submit"
    className="w-full py-2 bg-teal-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors"
  >
    Registrarse
  </button>
</form>
      </div>
    </div>
  );
}



export default Registrar;