import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FaUser, FaEnvelope, FaPhone, FaShieldAlt,
  FaEdit, FaTrash, FaIdCard, FaArrowLeft,
} from 'react-icons/fa';

import PageBg        from '../../components/ui/PageBg';
import InnerNavbar   from '../../components/layout/InnerNavbar';
import LoadingScreen from '../../components/ui/LoadingScreen';
import SectionCard   from '../../components/ui/SectionCard';
import InfoRow       from '../../components/ui/InfoRow';
import ToastNotification from '../../components/ui/ToastNotification';
import { useToast }      from '../../hooks/useToast';
import { verUsuarioApi, eliminarUsuarioApi } from '../../services/api';

// ── Helpers ───────────────────────────────────────────────────────────────────

const ROL_LABEL = { admin: 'Administrador', administrador: 'Administrador', conductor: 'Conductor', usuario: 'Usuario' };
const ROL_COLOR = { admin: 'violet', administrador: 'violet', conductor: 'blue', usuario: 'green' };

const resolveField = (obj, keys) => {
  for (const k of keys) if (obj?.[k]) return obj[k];
  return null;
};

// ── Component ─────────────────────────────────────────────────────────────────

const VerPerfil = () => {
  const { userId: paramUserId } = useParams();

  const [loggedInUser,   setLoggedInUser]   = useState(null); // siempre el usuario autenticado
  const [userData,       setUserData]       = useState(null); // perfil que se muestra
  const [isViewingOther, setIsViewingOther] = useState(false);
  const [isLoading,      setIsLoading]      = useState(true);
  const [showDelete,     setShowDelete]     = useState(false);
  const [isDeleting,     setIsDeleting]     = useState(false);

  const { toast, showToast, hideToast } = useToast();
  const navigate = useNavigate();

  // ── Carga de datos ────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      const stored    = localStorage.getItem('userData');
      const authToken = localStorage.getItem('authToken');
      if (!stored || !authToken) { navigate('/login'); return; }

      let loggedIn;
      try { loggedIn = JSON.parse(stored); } catch { navigate('/login'); return; }

      const rol     = loggedIn.rol;
      const isAdmin = rol === 'admin' || rol === 'administrador';

      // Admin viendo a otro usuario
      const viewingOther = !!(paramUserId && isAdmin);
      setLoggedInUser(loggedIn);
      setIsViewingOther(viewingOther);

      const targetId = viewingOther
        ? paramUserId
        : resolveField(loggedIn, ['id_users', 'id', 'ID', 'id_user', 'user_id', 'userId']);

      if (!targetId) { navigate('/login'); return; }

      try {
        const { data } = await verUsuarioApi(targetId);
        const perfil   = data?.data ?? data?.user ?? data ?? {};

        if (viewingOther) {
          setUserData(perfil);
        } else {
          const merged = { ...loggedIn, ...perfil };
          localStorage.setItem('userData', JSON.stringify(merged));
          setUserData(merged);
        }
      } catch {
        if (viewingOther) {
          showToast('No se pudo cargar el perfil del usuario.', 'error');
          navigate('/lista-usuarios');
        } else {
          setUserData(loggedIn);
        }
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [navigate, paramUserId]);

  // ── Eliminar ──────────────────────────────────────────────────────────────
  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      const targetId = resolveField(userData, ['id_users', 'id', 'ID', 'id_user', 'user_id', 'userId']);
      await eliminarUsuarioApi(targetId);
      showToast(isViewingOther ? 'Usuario eliminado correctamente.' : 'Cuenta eliminada exitosamente.', 'success');
      setTimeout(() => {
        if (isViewingOther) {
          navigate('/lista-usuarios');
        } else {
          localStorage.removeItem('userData');
          localStorage.removeItem('authToken');
          navigate('/login');
        }
      }, 1500);
    } catch (err) {
      const status = err.response?.status;
      if (status === 401) showToast('Sesión expirada.', 'error');
      else if (status === 404) showToast('Usuario no encontrado.', 'error');
      else showToast('Error al eliminar. Intenta nuevamente.', 'error');
    } finally {
      setIsDeleting(false);
      setShowDelete(false);
    }
  };

  if (isLoading) return <LoadingScreen message="Cargando perfil..." />;
  if (!userData || !loggedInUser) return null;

  const nombre   = resolveField(userData, ['Nombre', 'nombre', 'name']);
  const correo   = resolveField(userData, ['Correo', 'correo', 'email', 'Email']);
  const telefono = resolveField(userData, ['Telefono', 'telefono', 'tel', 'phone']);
  const userId   = resolveField(userData, ['id_users', 'id', 'ID', 'user_id', 'userId']);
  const rol      = userData.rol ?? 'usuario';

  const loggedInRol   = loggedInUser.rol;
  const loggedInIsAdmin = loggedInRol === 'admin' || loggedInRol === 'administrador';

  return (
    <PageBg>
      <ToastNotification isVisible={toast.visible} message={toast.message} type={toast.type} onClose={hideToast} />

      <InnerNavbar
        userData={loggedInUser}
        title={isViewingOther ? `Perfil de ${nombre || 'Usuario'}` : 'Mi Perfil'}
        backTo={isViewingOther ? '/lista-usuarios' : undefined}
      />

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
              <span className={`inline-block mt-1 text-xs font-bold px-3 py-1 rounded-full ${
                rol === 'conductor'                          ? 'bg-blue-100 text-blue-700'
                : rol === 'admin' || rol === 'administrador' ? 'bg-violet-100 text-violet-700'
                : 'bg-green-100 text-green-700'
              }`}>
                {ROL_LABEL[rol] ?? 'Usuario'}
              </span>
            </div>

            <div className="flex gap-2">
              {isViewingOther ? (
                /* Admin viendo perfil ajeno: solo eliminar */
                <>
                  <button
                    onClick={() => navigate('/lista-usuarios')}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-200 transition-all active:scale-95"
                  >
                    <FaArrowLeft /> Volver a lista
                  </button>
                  <button
                    onClick={() => setShowDelete(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 text-sm font-semibold rounded-xl border border-red-200 hover:bg-red-100 transition-all active:scale-95"
                  >
                    <FaTrash /> Eliminar usuario
                  </button>
                </>
              ) : (
                /* Perfil propio: editar y eliminar */
                <>
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
                </>
              )}
            </div>
          </div>
        </div>

        {/* Info cards */}
        <div className="grid md:grid-cols-2 gap-4 animate-fade-in-up">
          <SectionCard title="Información personal" icon={<FaUser className="text-sm" />} accent="violet">
            {(loggedInIsAdmin) && (
              <InfoRow label="ID de usuario" value={`#${userId}`} icon={<FaIdCard className="text-xs" />} />
            )}
            <InfoRow label="Nombre" value={nombre}         icon={<FaUser      className="text-xs" />} />
            <InfoRow label="Rol"    value={ROL_LABEL[rol]} icon={<FaShieldAlt className="text-xs" />} badge color={ROL_COLOR[rol]} />
          </SectionCard>

          <SectionCard title="Información de contacto" icon={<FaEnvelope className="text-sm" />} accent="blue">
            <InfoRow label="Correo"   value={correo}   icon={<FaEnvelope className="text-xs" />} />
            <InfoRow label="Teléfono" value={telefono} icon={<FaPhone    className="text-xs" />} />
          </SectionCard>
        </div>
      </div>

      {/* Modal confirmación eliminar */}
      {showDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(15,10,40,0.75)', backdropFilter: 'blur(6px)' }}
        >
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl text-center">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaTrash className="text-red-500 text-xl" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {isViewingOther ? '¿Eliminar este usuario?' : '¿Eliminar tu cuenta?'}
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Esta acción es <span className="font-semibold text-red-600">irreversible</span>.
              {isViewingOther
                ? ` Se eliminará toda la información de ${nombre || 'este usuario'}.`
                : ' Se eliminará toda tu información, reservas y datos del sistema.'
              }
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDelete(false)}
                disabled={isDeleting}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all disabled:opacity-50"
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
