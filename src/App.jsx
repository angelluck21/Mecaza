import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Login from './Usuarios/login';
import Registrar from './Usuarios/Registrar';
import Index from './pages/index';
import IndexLogin from './pages/indexLogin';
import IndexAdmin from './pages/indexAdmin';
import Conductor from './conductor/Conductor';
import ConductorNotificaciones from './conductor/ConductorNotificaciones';
import AjustesPerfil from './Usuarios/AjustesPerfil';
import VerPerfil from './Usuarios/VerPerfil';
import VerDetalles from './pages/VerDetalles';
import MisReservas from './Usuarios/MisReservas';
import ListaUsuarios from './pages/ListaUsuarios';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registrar" element={<Registrar />} />
        <Route path="/indexLogin" element={<IndexLogin />} />
        <Route path="/indexAdmin" element={<IndexAdmin />} />
        <Route path="/conductor" element={<Conductor />} />
        <Route path="/conductor-notificaciones" element={<ConductorNotificaciones />} />
        <Route path="/ver-perfil" element={<VerPerfil />} />
        <Route path="/ajustes-perfil" element={<AjustesPerfil />} />
        <Route path="/ver-detalles/:carId" element={<VerDetalles />} />
        <Route path="/mis-reservas" element={<MisReservas />} />
        <Route path="/lista-usuarios" element={<ListaUsuarios />} />
        <Route path="/usuario/:userId" element={<VerPerfil />} />
        <Route path="/editar-usuario/:userId" element={<AjustesPerfil />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;