import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import GlobalRatingCheck from './components/GlobalRatingCheck';

// Auth
import Login    from './features/auth/Login';
import Registrar from './features/auth/Registrar';

// Usuario
import MisReservas       from './features/usuario/MisReservas';
import MisFacturas       from './features/usuario/MisFacturas';
import MisNotificaciones from './features/usuario/MisNotificaciones';
import VerPerfil         from './features/usuario/VerPerfil';
import AjustesPerfil     from './features/usuario/AjustesPerfil';

// Conductor
import Conductor from './features/conductor/Conductor';

// Admin
import IndexAdmin from './features/admin/indexAdmin';

// Pages
import Home             from './pages/Home';
import VerDetalles      from './pages/VerDetalles';
import RegConductor     from './pages/RegConductor';
import PerfilConductor  from './pages/PerfilConductor';

function App() {
  return (
    <BrowserRouter>
      <GlobalRatingCheck />
      <Routes>
        {/* Públicas */}
        <Route path="/"       element={<Home />} />
        <Route path="/index"  element={<Home />} />
        <Route path="/login"  element={<Login />} />
        <Route path="/registrar" element={<Registrar />} />
        <Route path="/registrar-conductor" element={<RegConductor />} />

        {/* Usuario autenticado */}
        <Route path="/indexLogin"       element={<Navigate to="/" replace />} />
        <Route path="/mis-reservas"     element={<MisReservas />} />
        <Route path="/mis-facturas"     element={<MisFacturas />} />
        <Route path="/notificaciones"   element={<MisNotificaciones />} />
        <Route path="/ver-perfil"           element={<VerPerfil />} />
        <Route path="/ver-perfil/:userId"   element={<VerPerfil />} />
        <Route path="/ajustes-perfil" element={<AjustesPerfil />} />
        <Route path="/usuario/:userId"        element={<VerPerfil />} />
        <Route path="/editar-usuario/:userId" element={<AjustesPerfil />} />

        {/* Detalles de viaje */}
        <Route path="/ver-detalles/:carId"             element={<VerDetalles />} />
        <Route path="/conductor-perfil/:conductorId"   element={<PerfilConductor />} />

        {/* Conductor */}
        <Route path="/conductor" element={<Conductor />} />

        {/* Admin */}
        <Route path="/indexAdmin" element={<IndexAdmin />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
