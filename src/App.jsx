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
    <div className="min-h-screen flex items-center justify-center bg-blue-900 px-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-8">
        <div className="flex justify-center mb-5">
          <FaCar className="text-blue-900 text-7xl" />
        </div>

        <h1 className="text-2xl font-bold text-center text-blue-900 mb-6">Mecaza</h1>
        <h1 className="text-base font-medium text-center text-blue-900 mb-6">Tu servicio de transporte preferido!</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-blue-900 mb-1">Correo electrónico</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-blue-900">
                <EnvelopeIcon className="h-5 w-5" />
              </span>
              <input
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
            Iniciar sesión
          </button>
        </form>

        <p className="mt-6 text-sm text-center text-blue-800">
          ¿No tienes cuenta?{' '}
          <a
            onClick={() => navigate('/registrar')}
            className="font-semibold underline hover:text-blue-600 cursor-pointer"
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