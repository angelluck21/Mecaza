import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './Usuarios/login';
import Registrar from './Usuarios/Registrar';
import Index from './pages/index';
import IndexLogin from './pages/indexLogin';
import IndexAdmin from './pages/indexAdmin';
import AjustesPerfil from './pages/AjustesPerfil';
import VerPerfil from './Usuarios/VerPerfil';
import VerDetalles from './pages/VerDetalles';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registrar" element={<Registrar />} />
        <Route path="/indexLogin" element={<IndexLogin />} />
        <Route path="/indexAdmin" element={<IndexAdmin />} />
        <Route path="/ajustes-perfil" element={<AjustesPerfil />} />
        <Route path="/ver-perfil" element={<VerPerfil />} />
        <Route path="/ver-detalles/:carId" element={<VerDetalles />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;