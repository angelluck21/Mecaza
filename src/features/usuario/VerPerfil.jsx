import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaUser, FaEnvelope, FaPhone, FaShieldAlt,
  FaEdit, FaTrash, FaIdCard,
} from 'react-icons/fa';

import PageBg        from '../../components/ui/PageBg';
import InnerNavbar   from '../../components/layout/InnerNavbar';
import LoadingScreen from '../../components/ui/LoadingScreen';
import SectionCard   from '../../components/ui/SectionCard';
import InfoRow       from '../../components/ui/InfoRow';
import ToastNotification from '../../components/ui/ToastNotification';
import { useToast }  from '../../hooks/useToast';
import axios         from 'axios';

// ── Helpers ───────────────────────────────────────────────────────────────────

const ROL_LABEL = { admin: 'Administrador', administrador: 'Administrador', conductor: 'Conductor', usuario: 'Usuario' };
const ROL_COLOR = { admin: 'violet', administrador: 'violet', conductor: 'blue', usuario: 'green' };

const resolveField = (obj, keys) => {
  for (const k of keys) if (obj?.[k]) return obj[k];
  return null;
};

// ── Component ─────────────────────────────────────────────────────────────────

const VerPerfil = () => {
  const [userData,   setUserData]   = useState(null);
  const [isLoading,  setIsLoading]  = useState(true);
  const [showDelete, setShowDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast, showToast, hideToast } = useToast();
  const navigate = useNavigate();

  // ── Carga de datos ────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      const stored    = localStorage.getItem('userData');
      const authToken = localStorage.getItem('authToken');

      if (!stored || !authToken) { navigate('/login'); return; }

      const user   = JSON.parse(stored);
      const userId = resolveField(user, ['id_users', 'id', 'ID', 'id_user', 'user_id', 'userId']);

      if (!userId) { navigate('/login'); return; }

      try {
        const { data } = await axios.get('https://api-mecaza.geekcorplab.com/api/listarusuario', {
          headers: { Authorization: `Bearer ${authToken}`, Accept: 'application/json' },
        });
        const lista     = data?.data ?? [];
        const fresco    = lista.find(u => resolveField(u, ['id_users', 'id', 'ID']) == userId);
        const resultado = fresco ?? user;
        localStorage.setItem('userData', JSON.stringify(resultado));
        setUserData(resultado);
      } catch {
        setUserData(user);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [navigate]);

  // ── Eliminar cuenta ───────────────────────────────────────────────────────
  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      const userId    = resolveField(userData, ['id_users', 'id', 'ID', 'id_user', 'user_id', 'userId']);
      const authToken = localStorage.getItem('authToken');
      await axios.delete(`https://api-mecaza.geekcorplab.com/api/eliminarusuario/${userId}`, {
        headers: { Authorization: `Bearer ${authToken}`, Accept: 'application/json' },
      });
      showToast('Cuenta eliminada exitosamente.', 'success');
      setTimeout(() => {
        localStorage.removeItem('userData');
        localStorage.removeItem('authToken');
        navigate('/login');
      }, 1800);
    } catch (err) {
      const status = err.response?.status;
      if (status === 401) showToast('Sesión expirada. Inicia sesión nuevamente.', 'error');
      else if (status === 404) showToast('Cuenta no encontrada en el sistema.', 'error');
      else showToast('Error al eliminar la cuenta. Intenta nuevamente.', 'error');
    } finally {
      setIsDeleting(false);
      setShowDelete(false);
    }
  };

  if (isLoading) return <LoadingScreen message="Cargando perfil..." />;
  if (!userData) return null;

  const nombre  = resolveField(userData, ['Nombre', 'nombre', 'name', 'nombre_usuario', 'NOMBRE']);
  const correo  = resolveField(userData, ['Correo', 'correo', 'email', 'Email']);
  const telefono = resolveField(userData, ['Telefono', 'telefono', 'tel', 'phone', 'TELEFONO']);
  const userId  = resolveField(userData, ['id_users', 'id', 'ID', 'user_id', 'userId']);
  const rol     = userData.rol ?? 'usuario';

  return (
    <PageBg>
      <ToastNotification isVisible={toast.visible} message={toast.message} type={toast.type} onClose={hideToast} />

      <InnerNavbar userData={userData} title="Mi Perfil" />

      <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 py-8">

        {/* Hero card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-violet-900/20 overflow-hidden mb-6 animate-fade-in-up">
          <div className="h-24 bg-gradient-to-r from-blue-800 to-violet-700 relative">
            <div className="absolute -bottom-10 left-8">
              <div className="w-20 h-20 rounded-2xl bg-white shadow-lg flex items-center justify-center border-4 border-white">
                {userData.fotoPerfil
                  ? <img src={userData.fotoPerfil} alt="Foto" className="w-full h-full object-cover rounded-xl" />
                  : <FaUser className="text-3xl text-violet-500" />
                }
              </div>
            </div>
          </div>

          <div className="pt-14 pb-6 px-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">{nombre || 'Sin nombre'}</h1>
              <span className={`inline-block mt-1 text-xs font-bold px-3 py-1 rounded-full
                ${rol === 'conductor' ? 'bg-blue-100 text-blue-700'
                  : rol === 'admin' || rol === 'administrador' ? 'bg-violet-100 text-violet-700'
                  : 'bg-green-100 text-green-700'}`}>
                {ROL_LABEL[rol] ?? 'Usuario'}
              </span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => navigate('/ajustes-perfil')}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-700 to-violet-600 text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-violet-300/40 transition-all hover:scale-105 active:scale-95"
              >
                <FaEdit /> Editar perfil
              </button>
              <button
                onClick={() => setShowDelete(true)}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 text-sm font-semibold rounded-xl border border-red-200 hover:bg-red-100 transition-all active:scale-95"
              >
                <FaTrash />
              </button>
            </div>
          </div>
        </div>

        {/* Info cards */}
        <div className="grid md:grid-cols-2 gap-4 animate-fade-in-up delay-100">
          <SectionCard title="Información personal" icon={<FaUser className="text-sm" />} accent="violet">
            <InfoRow label="ID de usuario" value={`#${userId}`}  icon={<FaIdCard className="text-xs" />} />
            <InfoRow label="Nombre"        value={nombre}         icon={<FaUser   className="text-xs" />} />
            <InfoRow label="Rol"           value={ROL_LABEL[rol]} icon={<FaShieldAlt className="text-xs" />} badge color={ROL_COLOR[rol]} />
          </SectionCard>

          <SectionCard title="Información de contacto" icon={<FaEnvelope className="text-sm" />} accent="blue">
            <InfoRow label="Correo"    value={correo}   icon={<FaEnvelope className="text-xs" />} />
            <InfoRow label="Teléfono"  value={telefono} icon={<FaPhone    className="text-xs" />} />
            <InfoRow label="Estado"    value="Activa"   badge color="green" />
          </SectionCard>
        </div>
      </div>

      {/* Modal confirmación eliminar */}
      {showDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
          style={{ background: 'rgba(15,10,40,0.75)', backdropFilter: 'blur(6px)' }}
        >
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-scale-in text-center">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaTrash className="text-red-500 text-xl" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">¿Eliminar cuenta?</h3>
            <p className="text-sm text-gray-500 mb-6">
              Esta acción es <span className="font-semibold text-red-600">irreversible</span>. Se eliminará toda tu información, reservas y datos del sistema.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDelete(false)}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-all disabled:opacity-60"
              >
                {isDeleting ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageBg>
  );
};

export default VerPerfil;
