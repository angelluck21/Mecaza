import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROLES } from '../constants';

/**
 * Lee userData del localStorage. Si requireAuth=true redirige a /login
 * si no hay sesión. Si allowedRoles se indica, verifica que el rol coincida.
 */
export const useAuth = ({ requireAuth = false, allowedRoles = [] } = {}) => {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('userData');
    const token  = localStorage.getItem('authToken');

    if (requireAuth && !token) {
      navigate('/login');
      return;
    }

    if (stored) {
      try {
        const user = JSON.parse(stored);

        if (allowedRoles.length > 0 && !allowedRoles.includes(user.rol)) {
          navigate('/indexLogin');
          return;
        }

        setUserData(user);
      } catch {
        navigate('/login');
        return;
      }
    } else if (requireAuth) {
      navigate('/login');
      return;
    }

    setIsLoading(false);
  }, [navigate, requireAuth, allowedRoles.join(',')]);

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('id_users');
    localStorage.removeItem('token');
    navigate('/login');
  };

  return { userData, setUserData, isLoading, logout };
};
