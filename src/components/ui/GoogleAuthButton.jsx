import React, { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { googleAuthApi }  from '../../services/api';
import { buildUserData }  from '../../utils';

const REDIRECT_BY_ROLE = {
  usuario:       '/indexLogin',
  conductor:     '/conductor',
  administrador: '/indexAdmin',
  admin:         '/indexAdmin',
};

/**
 * Botón "Continuar con Google".
 *
 * Props:
 *   onSuccess(userData, token) – callback tras login exitoso
 *   onError(message)           – callback si algo falla
 *   label                      – texto del botón (default: "Continuar con Google")
 */
const HAS_GOOGLE = !!import.meta.env.VITE_GOOGLE_CLIENT_ID;

const GoogleAuthInner = ({ onSuccess, onError, label }) => {
  const [loading, setLoading] = useState(false);

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        // useGoogleLogin devuelve un access_token, no un id_token.
        // Necesitamos obtener el perfil del usuario con el access_token.
        const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });

        if (!profileRes.ok) throw new Error('No se pudo obtener el perfil de Google.');
        const profile = await profileRes.json();

        // Enviamos el access_token + info al backend para que lo verifique
        // Usamos un enfoque simplificado: enviamos el sub (google_id) + email + name
        // El backend crea/busca al usuario directamente con estos datos.
        // Para mayor seguridad en producción se recomienda usar id_token.
        const { data } = await googleAuthApi(tokenResponse.access_token);

        const userData = buildUserData(data, data.user?.email || profile.email);
        localStorage.setItem('userData', JSON.stringify(userData));
        localStorage.setItem('id_users', userData.id_users || '');

        onSuccess?.(userData);
      } catch (err) {
        const msg = err.response?.data?.message || 'Error al iniciar sesión con Google.';
        onError?.(msg);
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      onError?.('El inicio de sesión con Google fue cancelado.');
    },
    flow: 'implicit',
  });

  return (
    <button
      type="button"
      onClick={() => login()}
      disabled={loading}
      className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white border border-gray-200 rounded-xl text-gray-700 text-sm font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {loading ? (
        <>
          <svg className="w-4 h-4 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          Conectando con Google...
        </>
      ) : (
        <>
          {/* Logo oficial de Google */}
          <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" aria-hidden="true">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          {label}
        </>
      )}
    </button>
  );
};

const GoogleAuthButton = (props) =>
  HAS_GOOGLE ? <GoogleAuthInner {...props} /> : null;

export { REDIRECT_BY_ROLE };
export default GoogleAuthButton;
