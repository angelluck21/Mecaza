import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaPhone, FaTrash, FaSearch, FaSync } from 'react-icons/fa';

import PageBg            from '../../components/ui/PageBg';
import InnerNavbar       from '../../components/layout/InnerNavbar';
import LoadingScreen     from '../../components/ui/LoadingScreen';
import ToastNotification from '../../components/ui/ToastNotification';
import { useToast }      from '../../hooks/useToast';
import axios             from 'axios';

// ── Helpers ───────────────────────────────────────────────────────────────────

const ROL_BADGE = {
  conductor:     'bg-blue-100   text-blue-700   border-blue-200',
  usuario:       'bg-green-100  text-green-700  border-green-200',
  admin:         'bg-violet-100 text-violet-700 border-violet-200',
  administrador: 'bg-violet-100 text-violet-700 border-violet-200',
};
const rolBadge = (r) => ROL_BADGE[r?.toLowerCase()] ?? 'bg-gray-100 text-gray-600 border-gray-200';

// ── Component ─────────────────────────────────────────────────────────────────

const ListaUsuarios = () => {
  const [userData,       setUserData]       = useState(null);
  const [isLoading,      setIsLoading]      = useState(true);
  const [users,          setUsers]          = useState([]);
  const [filteredUsers,  setFilteredUsers]  = useState([]);
  const [searchTerm,     setSearchTerm]     = useState('');
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [showConfirm,    setShowConfirm]    = useState(false);
  const [userToDelete,   setUserToDelete]   = useState(null);
  const [isDeleting,     setIsDeleting]     = useState(false);

  const { toast, showToast, hideToast } = useToast();
  const navigate = useNavigate();

  // ── Auth ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const stored    = localStorage.getItem('userData');
    const authToken = localStorage.getItem('authToken');
    if (!stored || !authToken) { navigate('/login'); return; }
    try {
      setUserData(JSON.parse(stored));
    } catch { navigate('/login'); return; }
    setIsLoading(false);
  }, [navigate]);

  useEffect(() => { if (userData) fetchUsers(); }, [userData]);

  // ── Búsqueda ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const lower = searchTerm.toLowerCase();
    setFilteredUsers(users.filter(u =>
      u.name?.toLowerCase().includes(lower) ||
      u.email?.toLowerCase().includes(lower) ||
      u.id?.toString().includes(lower) ||
      u.rol?.toLowerCase().includes(lower)
    ));
  }, [searchTerm, users]);

  // ── Fetch ────────────────────────────────────────────────────────────────
  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const { data } = await axios.get('https://api-mecaza.geekcorplab.com/api/usuarios', {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}`, Accept: 'application/json' },
      });
      if (data.success) {
        setUsers(data.users);
        setFilteredUsers(data.users);
        showToast(`${data.total} usuarios cargados.`, 'success');
      } else {
        showToast('Error al cargar usuarios.', 'error');
      }
    } catch (err) {
      const s = err.response?.status;
      if (s === 401) { showToast('Sesión expirada.', 'error'); navigate('/login'); }
      else showToast('Error al cargar usuarios.', 'error');
    } finally { setIsLoadingUsers(false); }
  };

  // ── Eliminar ──────────────────────────────────────────────────────────────
  const confirmDelete = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      const { data } = await axios.delete(`https://api-mecaza.geekcorplab.com/api/usuarios/${userToDelete.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}`, Accept: 'application/json' },
      });
      if (data.success) {
        showToast('Usuario eliminado correctamente.', 'success');
        fetchUsers();
      } else {
        showToast(data.message || 'Error al eliminar.', 'error');
      }
    } catch { showToast('Error al eliminar el usuario.', 'error'); }
    finally { setIsDeleting(false); setShowConfirm(false); setUserToDelete(null); }
  };

  if (isLoading) return <LoadingScreen message="Cargando usuarios..." />;
  if (!userData)  return null;

  return (
    <PageBg>
      <ToastNotification isVisible={toast.visible} message={toast.message} type={toast.type} onClose={hideToast} />
      <InnerNavbar userData={userData} title="Lista de Usuarios" backTo="/indexAdmin" />

      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 space-y-5">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-fade-in-up">
          <div>
            <h1 className="text-2xl font-extrabold text-white">Lista de Usuarios</h1>
            <p className="text-blue-200 text-sm">
              {filteredUsers.length} de {users.length} usuarios{searchTerm && ` — filtrado por "${searchTerm}"`}
            </p>
          </div>
          <button
            onClick={fetchUsers}
            disabled={isLoadingUsers}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 text-white text-sm font-medium rounded-xl hover:bg-white/20 transition-all disabled:opacity-50"
          >
            <FaSync className={isLoadingUsers ? 'animate-spin' : ''} />
            {isLoadingUsers ? 'Actualizando...' : 'Actualizar'}
          </button>
        </div>

        {/* Buscador */}
        <div className="relative animate-fade-in-up delay-100">
          <FaSearch className="absolute left-3.5 top-3 text-gray-400 text-sm" />
          <input
            type="text"
            placeholder="Buscar por nombre, email, ID o rol..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
          />
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-fade-in-up delay-200">
          <div className="h-0.5 bg-gradient-to-r from-blue-600 via-violet-500 to-purple-600" />

          {isLoadingUsers ? (
            <div className="flex items-center justify-center py-16 gap-3">
              <div className="w-6 h-6 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-gray-500 text-sm">Cargando usuarios...</span>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-3">👤</div>
              <p className="text-gray-500 font-medium">
                {searchTerm ? 'Sin resultados para tu búsqueda' : 'No hay usuarios registrados'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {['ID', 'Usuario', 'Contacto', 'Rol', 'Registro', 'Acciones'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredUsers.map((u, idx) => (
                    <tr
                      key={u.id}
                      className="hover:bg-violet-50/40 transition-colors"
                      style={{ animationDelay: `${idx * 40}ms` }}
                    >
                      <td className="px-5 py-3.5 text-xs font-mono text-gray-400">#{u.id}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-violet-500 flex items-center justify-center shrink-0">
                            <FaUser className="text-white text-xs" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800">{u.name || '—'}</p>
                            <p className="text-xs text-gray-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                          <FaPhone className="text-gray-300 text-xs" />
                          {u.tel || '—'}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${rolBadge(u.rol)}`}>
                          {u.rol || '—'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-gray-400">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString('es-ES') : '—'}
                      </td>
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => { setUserToDelete(u); setShowConfirm(true); }}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Eliminar usuario"
                        >
                          <FaTrash className="text-xs" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal confirmar eliminación */}
      {showConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
          style={{ background: 'rgba(15,10,40,0.75)', backdropFilter: 'blur(6px)' }}
        >
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl animate-scale-in text-center overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-5">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <FaTrash className="text-white text-xl" />
              </div>
              <h3 className="text-lg font-bold text-white">Eliminar usuario</h3>
              <p className="text-red-100 text-sm mt-1">{userToDelete?.name || userToDelete?.email}</p>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-500 mb-5">
                Esta acción es <span className="font-semibold text-red-600">irreversible</span>. ¿Confirmas?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => { setShowConfirm(false); setUserToDelete(null); }}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-all disabled:opacity-60"
                >
                  {isDeleting ? 'Eliminando...' : 'Eliminar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageBg>
  );
};

export default ListaUsuarios;
