"use client";
import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';
import type { User as AuthUser } from '@/types/auth';

type AuthContextType = {
  user: AuthUser | null;
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const supabase = createClient();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {


    let isMounted = true;

    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (isMounted) {
          setSession(session);
          setUser(mapSupabaseUser(session?.user));
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error getting session:", error);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (isMounted) {
          setSession(session);
          setUser(mapSupabaseUser(session?.user));
          setIsLoading(false);
        }
      }
    );

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  };

  const value = { user, session, isLoading, signOut };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

function mapSupabaseUser(user?: SupabaseUser | null): AuthUser | null {
  if (!user) return null;
  const role = (user.user_metadata as any)?.role ?? "";
  const isAdmin = !!process.env.SCHEMA_ADMIN_USER && role === process.env.SCHEMA_ADMIN_USER;
  return {
    sub: user.id,
    email: user.email ?? "",
    role,
    isAdmin,
  };
}
