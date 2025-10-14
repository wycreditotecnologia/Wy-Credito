import { Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useEffect, useState } from 'react';

const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    let mounted = true;
    const check = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setIsAuthed(!!data?.session);
      setLoading(false);
    };
    check();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setIsAuthed(!!session);
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (loading) return null;
  if (!isAuthed) return <Navigate to="/login" replace />;
  return children;
};

export default ProtectedRoute;