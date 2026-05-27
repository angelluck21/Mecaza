import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaCamera, FaSave, FaDownload, FaEye, FaEyeSlash } from 'react-icons/fa';
import { EnvelopeIcon, PhoneIcon, LockClosedIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

import Navbar            from '../../components/layout/Navbar';
import Footer            from '../../components/layout/Footer';
import LoadingScreen     from '../../components/ui/LoadingScreen';
import ToastNotification from '../../components/ui/ToastNotification';
import { useToast }      from '../../hooks/useToast';
import { actualizarUsuarioApi, actualizarUsuarioConFotoApi, exportarMisDatosApi } from '../../services/api';
import { getUserPhotoUrl, compressImage } from '../../utils';

// ── Tokens ────────────────────────────────────────────────────────────────────
const T = {
  void:      '#080B12',
  surface:   '#0E1422',
  surface2:  '#141D30',
  border:    'rgba(255,255,255,0.07)',
  amber:     '#FFBE00',
  amberGlow: 'rgba(255,190,0,0.12)',
  white:     '#EEF0FA',
  fog:       '#6B728F',
  muted:     '#3A4060',
};

const ROL_LABEL = {
  admin: 'Administrador', administrador: 'Administrador',
  conductor: 'Conductor', usuario: 'Usuario',
};

const resolveField = (obj, keys) => {
  for (const k of keys) if (obj?.[k]) return obj[k];
  return '';
};

// ── Sub-components ─────────────────────────────────────────────────────────────

const Panel = ({ title, icon, children }) => (
  <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, overflow: 'hidden' }}>
    <div style={{
      padding: '12px 16px',
      background: 'linear-gradient(135deg, rgba(255,190,0,0.08) 0%, transparent 100%)',
      borderBottom: `1px solid ${T.border}`,
      display: 'flex', alignItems: 'center', gap: 8,
    }}>
      <span style={{ color: T.amber, fontSize: '0.75rem' }}>{icon}</span>
      <span style={{ fontFamily: 'Syne, sans-serif', fontSize: '0.72rem', fontWeight: 700, color: T.white, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{title}</span>
    </div>
    <div style={{ padding: '18px 16px' }}>{children}</div>
  </div>
);

const DarkInput = ({ label, icon, type = 'text', value, onChange, placeholder, disabled, required, autoComplete, right }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '0.62rem', fontWeight: 700, color: T.fog, textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 6px' }}>{label}</p>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        background: T.surface2,
        border: `1px solid ${focused ? T.amber : T.border}`,
        borderRadius: 10, padding: '0 12px',
        transition: 'border-color 0.2s',
        opacity: disabled ? 0.5 : 1,
        boxShadow: focused ? `0 0 0 3px rgba(255,190,0,0.08)` : 'none',
      }}>
        {icon && <span style={{ color: focused ? T.amber : T.fog, fontSize: '0.8rem', flexShrink: 0, transition: 'color 0.2s' }}>{icon}</span>}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            flex: 1, background: 'none', border: 'none', outline: 'none',
            color: T.white, fontSize: '0.875rem', padding: '11px 0',
            fontFamily: 'DM Sans, sans-serif',
          }}
        />
        {right && <span style={{ flexShrink: 0 }}>{right}</span>}
      </div>
    </div>
  );
};

// ── Component ─────────────────────────────────────────────────────────────────

const AjustesPerfil = () => {
  const [userData,     setUserData]     = useState(null);
  const [isLoading,    setIsLoading]    = useState(true);
  const [isSaving,     setIsSaving]     = useState(false);
  const [isExporting,  setIsExporting]  = useState(false);
  const [showPass,     setShowPass]     = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [form, setForm] = useState({ nombre: '', email: '', telefono: '', contrasena: '', confirmar: '' });

  const { toast, showToast, hideToast } = useToast();
  const navigate  = useNavigate();
  const fileInput = useRef(null);

  useEffect(() => {
    const stored = localStorage.getItem('userData');
    if (!stored) { navigate('/login'); return; }
    try {
      const user = JSON.parse(stored);
      const userId = resolveField(user, ['id', 'id_users', 'ID', 'user_id', 'userId']);
      if (!userId) { navigate('/login'); return; }
      setUserData(user);
      setForm({
        nombre:     resolveField(user, ['Nombre', 'nombre', 'name']),
        email:      resolveField(user, ['Correo', 'correo', 'email', 'Email']),
        telefono:   resolveField(user, ['Telefono', 'telefono', 'tel', 'phone']),
        contrasena: '',
        confirmar:  '',
      });
      const fotoActual = resolveField(user, ['fotoperfil', 'fotoPerfil', 'Fotoperfil']);
      if (fotoActual) setImagePreview(getUserPhotoUrl(fotoActual) || fotoActual);
    } catch { navigate('/login'); }
    finally { setIsLoading(false); }
  }, [navigate]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setProfileImage(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

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

      if (profileImage) {
        const compressed = await compressImage(profileImage);
        const formData = new FormData();
        formData.append('fotoperfil', compressed);
        formData.append('_method',  'PUT');
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
      const updated = { ...userData, Nombre: form.nombre, Correo: form.email, Telefono: form.telefono, fotoperfil: fotoGuardada, fotoPerfil: fotoUrl };
      localStorage.setItem('userData', JSON.stringify(updated));
      setUserData(updated);
      setImagePreview(fotoUrl || null);
      setForm(f => ({ ...f, contrasena: '', confirmar: '' }));
      setProfileImage(null);
      showToast('Perfil actualizado correctamente.', 'success');
      setTimeout(() => navigate(-1), 1200);
    } catch (err) {
      const status = err.response?.status;
      if (status === 401)    { showToast('Sesión expirada.', 'error'); navigate('/login'); }
      else if (status === 404) showToast('Usuario no encontrado.', 'error');
      else if (status === 500) showToast('Error del servidor. Intenta más tarde.', 'error');
      else if (err.request)    showToast('Sin conexión al servidor.', 'error');
      else                     showToast('Error inesperado.', 'error');
    } finally { setIsSaving(false); }
  };

  const handleExportarDatos = async () => {
    setIsExporting(true);
    try {
      const { data } = await exportarMisDatosApi();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `mecaza-mis-datos-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Datos exportados correctamente.', 'success');
    } catch {
      showToast('Error al exportar los datos. Intenta de nuevo.', 'error');
    } finally { setIsExporting(false); }
  };

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  if (isLoading) return <LoadingScreen message="Cargando ajustes..." />;
  if (!userData) return null;

  const nombre = resolveField(userData, ['Nombre', 'nombre', 'name']) || 'Usuario';

  return (
    <div style={{ minHeight: '100vh', background: T.void, display: 'flex', flexDirection: 'column', fontFamily: 'DM Sans, sans-serif' }}>
      <ToastNotification isVisible={toast.visible} message={toast.message} type={toast.type} onClose={hideToast} />
      <Navbar />

      <div style={{ flex: 1, maxWidth: 640, width: '100%', margin: '0 auto', padding: '2rem 1rem 3rem' }}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }} className="animate-fade-in-up">

          {/* ── Foto de perfil ─────────────────────────────────────────────── */}
          <Panel title="Foto de perfil" icon={<FaCamera />}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>

              {/* Avatar con botón de cámara */}
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{
                  width: 80, height: 80, borderRadius: 18, overflow: 'hidden',
                  border: `2px solid ${T.amber}`,
                  boxShadow: `0 0 0 3px ${T.surface}, 0 4px 16px rgba(255,190,0,0.2)`,
                  background: T.surface2,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {imagePreview
                    ? <img src={imagePreview} alt="Foto" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.8rem', fontWeight: 800, color: T.amber }}>
                        {nombre.charAt(0).toUpperCase()}
                      </span>
                  }
                </div>
                <label style={{
                  position: 'absolute', bottom: -4, right: -4,
                  width: 28, height: 28, borderRadius: '50%',
                  background: `linear-gradient(135deg, #C8960C, ${T.amber})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', boxShadow: '0 2px 8px rgba(255,190,0,0.4)',
                  border: `2px solid ${T.surface}`,
                }}>
                  <FaCamera style={{ color: '#080B12', fontSize: '0.65rem' }} />
                  <input ref={fileInput} type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                </label>
              </div>

              {/* Info */}
              <div>
                <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '0.95rem', fontWeight: 700, color: T.white, margin: 0 }}>{nombre}</p>
                <p style={{ fontSize: '0.75rem', color: T.fog, margin: '3px 0 8px' }}>{ROL_LABEL[userData.rol] ?? 'Usuario'}</p>
                <p style={{ fontSize: '0.72rem', color: T.amber, margin: 0, opacity: 0.8 }}>
                  Haz clic en el ícono de cámara para cambiar la foto
                </p>
              </div>
            </div>
          </Panel>

          {/* ── Datos personales ───────────────────────────────────────────── */}
          <Panel title="Datos personales" icon={<FaUser />}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <DarkInput
                label="Nombre completo"
                icon={<FaUser />}
                value={form.nombre}
                onChange={set('nombre')}
                placeholder="Tu nombre completo"
                required
              />
              <DarkInput
                label="Correo electrónico"
                icon={<EnvelopeIcon style={{ width: 16, height: 16 }} />}
                type="email"
                value={form.email}
                onChange={set('email')}
                placeholder="tu@correo.com"
                required
              />
              <DarkInput
                label="Teléfono"
                icon={<PhoneIcon style={{ width: 16, height: 16 }} />}
                type="tel"
                value={form.telefono}
                onChange={set('telefono')}
                placeholder="+57 300 000 0000"
              />
              <DarkInput
                label="Rol (no editable)"
                icon={<FaUser />}
                value={ROL_LABEL[userData.rol] ?? 'Usuario'}
                disabled
              />
            </div>
          </Panel>

          {/* ── Cambiar contraseña ─────────────────────────────────────────── */}
          <Panel title="Cambiar contraseña" icon={<LockClosedIcon style={{ width: 14, height: 14 }} />}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <DarkInput
                label="Nueva contraseña"
                icon={<LockClosedIcon style={{ width: 16, height: 16 }} />}
                type={showPass ? 'text' : 'password'}
                value={form.contrasena}
                onChange={set('contrasena')}
                placeholder="Deja vacío para no cambiar"
                autoComplete="new-password"
                right={
                  <button
                    type="button"
                    onClick={() => setShowPass(p => !p)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.fog, display: 'flex', alignItems: 'center', padding: 0 }}
                  >
                    {showPass
                      ? <FaEyeSlash style={{ fontSize: '0.85rem' }} />
                      : <FaEye     style={{ fontSize: '0.85rem' }} />
                    }
                  </button>
                }
              />
              {form.contrasena && (
                <DarkInput
                  label="Confirmar contraseña"
                  icon={<LockClosedIcon style={{ width: 16, height: 16 }} />}
                  type="password"
                  value={form.confirmar}
                  onChange={set('confirmar')}
                  placeholder="Repite la nueva contraseña"
                  autoComplete="new-password"
                  required
                />
              )}
              {!form.contrasena && (
                <p style={{ fontSize: '0.72rem', color: T.muted, margin: 0 }}>
                  Deja el campo vacío si no deseas cambiar tu contraseña.
                </p>
              )}
            </div>
          </Panel>

          {/* ── Privacidad y datos ─────────────────────────────────────────── */}
          <Panel title="Privacidad y datos" icon={<ShieldCheckIcon style={{ width: 14, height: 14 }} />}>
            <p style={{ fontSize: '0.78rem', color: T.fog, lineHeight: 1.6, margin: '0 0 14px' }}>
              Descarga una copia completa de tus datos: perfil, reservas, facturas y notificaciones. El archivo se entrega en formato JSON.
            </p>
            <button
              type="button"
              onClick={handleExportarDatos}
              disabled={isExporting}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '9px 18px',
                background: T.surface2,
                border: `1px solid ${T.border}`,
                borderRadius: 10, color: T.white,
                fontSize: '0.8rem', fontWeight: 600,
                cursor: isExporting ? 'not-allowed' : 'pointer',
                fontFamily: 'Syne, sans-serif',
                opacity: isExporting ? 0.6 : 1,
                transition: 'border-color 0.2s, color 0.2s',
              }}
              onMouseEnter={e => { if (!isExporting) { e.currentTarget.style.borderColor = T.amber; e.currentTarget.style.color = T.amber; } }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.white; }}
            >
              {isExporting ? (
                <>
                  <div style={{ width: 14, height: 14, border: `2px solid rgba(255,190,0,0.2)`, borderTopColor: T.amber, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  Exportando...
                </>
              ) : (
                <><FaDownload style={{ fontSize: '0.75rem' }} /> Descargar mis datos</>
              )}
            </button>
          </Panel>

          {/* ── Acciones ───────────────────────────────────────────────────── */}
          <div style={{ display: 'flex', gap: 12, paddingTop: 4 }}>
            <button
              type="submit"
              disabled={isSaving}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '12px',
                background: isSaving ? T.surface2 : `linear-gradient(135deg, #C8960C, ${T.amber})`,
                border: 'none', borderRadius: 12,
                color: '#080B12', fontSize: '0.85rem', fontWeight: 800,
                cursor: isSaving ? 'not-allowed' : 'pointer',
                fontFamily: 'Syne, sans-serif',
                boxShadow: isSaving ? 'none' : '0 4px 18px rgba(255,190,0,0.3)',
                opacity: isSaving ? 0.7 : 1,
                transition: 'all 0.2s',
              }}
            >
              {isSaving ? (
                <>
                  <div style={{ width: 14, height: 14, border: '2px solid rgba(8,11,18,0.2)', borderTopColor: '#080B12', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  Guardando...
                </>
              ) : (
                <><FaSave style={{ fontSize: '0.8rem' }} /> Guardar cambios</>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              style={{
                flex: 1, padding: '12px',
                background: T.surface,
                border: `1px solid ${T.border}`,
                borderRadius: 12, color: T.fog,
                fontSize: '0.85rem', fontWeight: 600,
                cursor: 'pointer', fontFamily: 'Syne, sans-serif',
                transition: 'border-color 0.2s, color 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = T.white; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.fog; }}
            >
              Cancelar
            </button>
          </div>

        </form>
      </div>
      <Footer />
    </div>
  );
};

export default AjustesPerfil;
