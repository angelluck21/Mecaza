import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Auth
import Login    from './features/auth/Login';
import Registrar from './features/auth/Registrar';

// Usuario
import IndexLogin   from './features/usuario/IndexLogin';
import MisReservas  from './features/usuario/MisReservas';
import MisFacturas  from './features/usuario/MisFacturas';
import VerPerfil    from './features/usuario/VerPerfil';
import AjustesPerfil from './features/usuario/AjustesPerfil';

// Conductor
import Conductor              from './features/conductor/Conductor';
import ConductorNotificaciones from './features/conductor/ConductorNotificaciones';

// Admin
import IndexAdmin    from './features/admin/indexAdmin';
import ListaUsuarios from './features/admin/ListaUsuarios';

// Pages
import Home          from './pages/Home';
import VerDetalles   from './pages/VerDetalles';
import RegConductor  from './pages/RegConductor';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Públicas */}
        <Route path="/"       element={<Home />} />
        <Route path="/index"  element={<Home />} />
        <Route path="/login"  element={<Login />} />
        <Route path="/registrar" element={<Registrar />} />
        <Route path="/registrar-conductor" element={<RegConductor />} />

        {/* Usuario autenticado */}
        <Route path="/indexLogin"  element={<IndexLogin />} />
        <Route path="/mis-reservas" element={<MisReservas />} />
        <Route path="/mis-facturas" element={<MisFacturas />} />
        <Route path="/ver-perfil"           element={<VerPerfil />} />
        <Route path="/ver-perfil/:userId"   element={<VerPerfil />} />
        <Route path="/ajustes-perfil" element={<AjustesPerfil />} />
        <Route path="/usuario/:userId"        element={<VerPerfil />} />
        <Route path="/editar-usuario/:userId" element={<AjustesPerfil />} />

        {/* Detalles de viaje */}
        <Route path="/ver-detalles/:carId" element={<VerDetalles />} />

        {/* Conductor */}
        <Route path="/conductor"               element={<Conductor />} />
        <Route path="/conductor-notificaciones" element={<ConductorNotificaciones />} />

        {/* Admin */}
        <Route path="/indexAdmin"     element={<IndexAdmin />} />
        <Route path="/lista-usuarios" element={<ListaUsuarios />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
