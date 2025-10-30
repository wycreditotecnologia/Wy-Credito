import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (user) {
      navigate('/solicitud', { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  }, [user, loading, navigate]);

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <p>Procesando autenticación...</p>
    </div>
  );
};

export default AuthCallbackPage;