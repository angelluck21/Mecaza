import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaCamera, FaSave } from 'react-icons/fa';
import { EnvelopeIcon, PhoneIcon, LockClosedIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

import PageBg        from '../../components/ui/PageBg';
import InnerNavbar   from '../../components/layout/InnerNavbar';
import LoadingScreen from '../../components/ui/LoadingScreen';
import FormInput     from '../../components/ui/FormInput';
import SectionCard   from '../../components/ui/SectionCard';
import ToastNotification from '../../components/ui/ToastNotification';
import { useToast }            from '../../hooks/useToast';
import { actualizarUsuarioApi, actualizarUsuarioConFotoApi } from '../../services/api';
import { getUserPhotoUrl, compressImage } from '../../utils';
import UserAvatar from '../../components/ui/UserAvatar';

// ── Helpers ───────────────────────────────────────────────────────────────────

const resolveField = (obj, keys) => {
  for (const k of keys) if (obj?.[k]) return obj[k];
  return '';
};

const ROL_LABEL = { admin: 'Administrador', administrador: 'Administrador', conductor: 'Conductor', usuario: 'Usuario' };

// ── Component ─────────────────────────────────────────────────────────────────

const AjustesPerfil = () => {
  const [userData,    setUserData]    = useState(null);
  const [isLoading,   setIsLoading]   = useState(true);
  const [isSaving,    setIsSaving]    = useState(false);
  const [showPass,    setShowPass]    = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [form, setForm] = useState({ nombre: '', email: '', telefono: '', contrasena: '', confirmar: '' });
  const { toast, showToast, hideToast } = useToast();
  const navigate = useNavigate();

  // ── Carga inicial ─────────────────────────────────────────────────────────
  useEffect(() => {
    const stored    = localStorage.getItem('userData');
    const authToken = localStorage.getItem('authToken');
    if (!stored || !authToken) { navigate('/login'); return; }

    try {
      const user = JSON.parse(stored);
      const userId = resolveField(user, ['id', 'id_users', 'ID', 'user_id', 'userId']);
      if (!userId) { navigate('/login'); return; }

      setUserData(user);
      setForm({
        nombre:    resolveField(user, ['Nombre', 'nombre', 'name']),
        email:     resolveField(user, ['Correo', 'correo', 'email', 'Email']),
        telefono:  resolveField(user, ['Telefono', 'telefono', 'tel', 'phone']),
        contrasena: '',
        confirmar:  '',
      });
      const fotoActual = resolveField(user, ['fotoperfil', 'fotoPerfil', 'Fotoperfil']);
      if (fotoActual) setImagePreview(getUserPhotoUrl(fotoActual) || fotoActual);
    } catch {
      navigate('/login');
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  // ── Imagen ────────────────────────────────────────────────────────────────
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setProfileImage(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  // ── Guardar ───────────────────────────────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault();

    if (form.contrasena && form.contrasena !== form.confirmar) {
      showToast('Las contraseñas no coinciden.', 'error');
      return;
    }

    setIsSaving(true);
    const userId = resolveField(userData, ['id', 'id_users', 'ID', 'user_id', 'userId']);

    try {
      let fotoGuardada = resolveField(userData, ['fotoperfil', 'fotoPerfil', 'Fotoperfil']) || null;

      // Si hay foto nueva, subirla primero
      if (profileImage) {
        const compressed = await compressImage(profileImage);
        const formData = new FormData();
        formData.append('fotoperfil', compressed);
        formData.append('_method', 'PUT');
        formData.append('Nombre',   form.nombre);
        formData.append('Correo',   form.email);
        formData.append('Rol',      userData.rol ?? 'usuario');
        formData.append('Telefono', form.telefono || '');
        if (form.contrasena) formData.append('Contrasena', form.contrasena);

        const resp = await actualizarUsuarioConFotoApi(userId, formData);
        fotoGuardada = resp.data?.fotoperfil || resp.data?.data?.fotoperfil || fotoGuardada;
      } else {
        const payload = {
          Nombre:   form.nombre,
          Correo:   form.email,
          Rol:      userData.rol ?? 'usuario',
          Telefono: form.telefono || resolveField(userData, ['Telefono', 'telefono', 'tel', 'phone']) || '',
        };
        if (form.contrasena) payload.Contrasena = form.contrasena;
        await actualizarUsuarioApi(userId, payload);
      }

      const fotoUrl = fotoGuardada ? (getUserPhotoUrl(fotoGuardada) || fotoGuardada) : imagePreview;
      const updated = {
        ...userData,
        Nombre:     form.nombre,
        Correo:     form.email,
        Telefono:   form.telefono,
        fotoperfil: fotoGuardada,
        fotoPerfil: fotoUrl,
      };
      localStorage.setItem('userData', JSON.stringify(updated));
      setUserData(updated);
      setImagePreview(fotoUrl || null);
      setForm(f => ({ ...f, contrasena: '', confirmar: '' }));
      setProfileImage(null);
      showToast('Perfil actualizado correctamente.', 'success');

    } catch (err) {
      const status = err.response?.status;
      if (status === 401) { showToast('Sesión expirada. Inicia sesión nuevamente.', 'error'); navigate('/login'); }
      else if (status === 404) showToast('Usuario no encontrado.', 'error');
      else if (status === 500) showToast('Error del servidor. Intenta más tarde.', 'error');
      else if (err.request)   showToast('Sin conexión al servidor.', 'error');
      else showToast('Error inesperado.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  if (isLoading) return <LoadingScreen message="Cargando ajustes..." />;
  if (!userData)  return null;

  return (
    <PageBg>
      <ToastNotification isVisible={toast.visible} message={toast.message} type={toast.type} onClose={hideToast} />
      <InnerNavbar userData={userData} title="Ajustes de perfil" />

      <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-8">
        <form onSubmit={handleSave} className="space-y-5 animate-fade-in-up">

          {/* Avatar */}
          <SectionCard title="Foto de perfil" icon={<FaCamera className="text-sm" />}>
            <div className="flex items-center gap-5">
              <div className="relative shrink-0">
                <div className="w-20 h-20 rounded-2xl overflow-hidden shadow">
                  {imagePreview
                    ? <img src={imagePreview} alt="Foto" className="w-full h-full object-cover" />
                    : <UserAvatar userData={userData} size="xl" className="rounded-2xl w-full h-full" />
                  }
                </div>
                <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-gradient-to-r from-blue-600 to-violet-600 rounded-full flex items-center justify-center cursor-pointer shadow-md hover:scale-110 transition-transform">
                  <FaCamera className="text-white text-xs" />
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700">{resolveField(userData, ['Nombre', 'nombre', 'name']) || 'Usuario'}</p>
                <p className="text-xs text-gray-400 mt-0.5">{ROL_LABEL[userData.rol] ?? 'Usuario'}</p>
                <p className="text-xs text-violet-500 mt-1">Haz clic en el ícono para cambiar la foto</p>
              </div>
            </div>
          </SectionCard>

          {/* Datos personales */}
          <SectionCard title="Datos personales" icon={<FaUser className="text-sm" />}>
            <div className="space-y-4">
              <FormInput
                label="Nombre completo"
                icon={<FaUser className="text-sm" />}
                type="text"
                value={form.nombre}
                onChange={set('nombre')}
                placeholder="Tu nombre"
                required
              />
              <FormInput
                label="Correo electrónico"
                icon={<EnvelopeIcon className="w-4 h-4" />}
                type="email"
                value={form.email}
                onChange={set('email')}
                placeholder="tu@correo.com"
                required
              />
              <FormInput
                label="Teléfono"
                icon={<PhoneIcon className="w-4 h-4" />}
                type="tel"
                value={form.telefono}
                onChange={set('telefono')}
                placeholder="+57 300 000 0000"
              />
              <FormInput
                label="Rol (no editable)"
                icon={<FaUser className="text-sm" />}
                value={ROL_LABEL[userData.rol] ?? 'Usuario'}
                disabled
                hint="El rol no puede modificarse desde aquí."
              />
            </div>
          </SectionCard>

          {/* Contraseña */}
          <SectionCard title="Cambiar contraseña" icon={<LockClosedIcon className="w-4 h-4" />} accent="blue">
            <div className="space-y-4">
              <FormInput
                label="Nueva contraseña"
                icon={<LockClosedIcon className="w-4 h-4" />}
                type={showPass ? 'text' : 'password'}
                value={form.contrasena}
                onChange={set('contrasena')}
                placeholder="Deja vacío para no cambiar"
                right={
                  <button type="button" onClick={() => setShowPass(p => !p)} className="text-gray-400 hover:text-violet-500 transition-colors">
                    {showPass ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                  </button>
                }
              />
              {form.contrasena && (
                <FormInput
                  label="Confirmar contraseña"
                  icon={<LockClosedIcon className="w-4 h-4" />}
                  type="password"
                  value={form.confirmar}
                  onChange={set('confirmar')}
                  placeholder="Repite la nueva contraseña"
                  required
                />
              )}
            </div>
          </SectionCard>

          {/* Acciones */}
          <div className="flex flex-col sm:flex-row gap-3 pt-1">
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-700 to-violet-600 text-white font-bold rounded-xl shadow-md hover:shadow-violet-300/50 hover:shadow-lg transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> Guardando...</>
              ) : (
                <><FaSave /> Guardar cambios</>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 py-3 bg-white text-gray-600 font-semibold rounded-xl border border-gray-200 hover:border-violet-300 hover:text-violet-700 hover:bg-violet-50 transition-all active:scale-95"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </PageBg>
  );
};

export default AjustesPerfil;
