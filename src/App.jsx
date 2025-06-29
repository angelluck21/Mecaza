import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import Index from './pages/index'; 
import { useState } from 'react';
import { LockClosedIcon, EnvelopeIcon } from '@heroicons/react/24/solid';
import { FaCar } from 'react-icons/fa';
import React from 'react';
import Registrar from './pages/Registrar';

function Login() {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/index'); // Esto redirige al usuario
  };

  return (
 <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-blue-700 px-4">
  <div className="w-full max-w-md bg-white shadow-[0_20px_50px_rgba(0,0,0,0.4)] rounded-xl p-10 transform transition-transform duration-300 hover:scale-[1.01] hover:shadow-[0_30px_60px_rgba(0,0,0,0.6)]">
    <div className="flex justify-center mb-6">
      <FaCar className="text-blue-900 text-7xl drop-shadow-md" />
    </div>

    <h1 className="text-3xl font-extrabold text-center text-blue-900 mb-2">Mecaza</h1>
    <p className="text-base font-medium text-center text-gray-600 mb-8">Tu servicio de transporte preferido!</p>

    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-blue-900 mb-1">Correo electrónico</label>
        <div className="relative">
          <span className="absolute left-3 top-2.5 text-blue-900">
            <EnvelopeIcon className="h-5 w-5" />
          </span>
          <input
            type="email"
            placeholder="correo electrónico"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm text-blue-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
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
            type="password"
            placeholder="••••••••"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm text-blue-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
      </div>

      <button
        type="submit"
        className="w-full py-2 bg-teal-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 transition-colors"
      >
        Iniciar sesión
      </button>
    </form>

    <p className="mt-6 text-sm text-center text-blue-800">
      ¿No tienes cuenta?{" "}
      <a
        onClick={() => navigate('/registrar')}
        className="font-semibold underline hover:text-blue-600 cursor-pointer transition-colors"
      >
        Regístrate
      </a>
    </p>
  </div>
</div>

  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/index" element={<Index />} />
        <Route path="/registrar" element={<Registrar />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;