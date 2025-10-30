import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

// Contexto global de autenticación
const AuthContext = createContext({ session: null, user: null, loading: true });

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Obtener la sesión inicial
    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!mounted) return;
        const currentSession = data?.session || null;
        setSession(currentSession);
        setUser(currentSession?.user || null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    // Suscripción a cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) return;
      setSession(nextSession || null);
      setUser(nextSession?.user || null);
    });

    // Cleanup
    return () => {
      mounted = false;
      subscription?.unsubscribe?.();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ session, user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);