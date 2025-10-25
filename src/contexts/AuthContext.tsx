import { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import type { UserRole } from '@/config/permissions';
import { saveRouteState, restoreRouteState, shouldRestoreRoute } from '@/utils/routePersistence';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, phone: string, redirectUrl?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string, redirectUrl?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  userRole: UserRole | null;
  hasRole: (roles: UserRole[]) => boolean;
  refreshRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const navigate = useNavigate();
  const abortControllerRef = useRef<AbortController | null>(null);
  const hasRestoredRoute = useRef(false);

  useEffect(() => {
    // Cancel any pending fetch on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchUserRole(session.user.id);
          
          // Restore route on sign in if not already restored
          if (event === 'SIGNED_IN' && !hasRestoredRoute.current) {
            hasRestoredRoute.current = true;
            const savedRoute = restoreRouteState();
            if (savedRoute && shouldRestoreRoute(window.location.pathname)) {
              navigate(savedRoute.path + savedRoute.search, { replace: true });
            }
          }
        } else {
          setUserRole(null);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchUserRole(session.user.id);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const fetchUserRole = async (userId: string) => {
    // Cancel previous fetch if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role, active')
        .eq('user_id', userId)
        .eq('active', true)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching user role:', error);
        setUserRole(null);
        return;
      }
      
      if (data) {
        setUserRole(data.role as UserRole);
      } else {
        // Fallback to 'client' if no role found
        setUserRole('client');
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Unexpected error fetching user role:', error);
        setUserRole(null);
      }
    } finally {
      abortControllerRef.current = null;
    }
  };

  const refreshRole = async () => {
    if (user?.id) {
      await fetchUserRole(user.id);
    }
  };

  const hasRole = (roles: UserRole[]): boolean => {
    if (!userRole) return false;
    return roles.includes(userRole);
  };

  const signUp = async (email: string, password: string, fullName: string, phone: string, redirectUrl?: string) => {
    const emailRedirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: emailRedirectUrl,
        data: {
          full_name: fullName,
          phone: phone
        }
      }
    });
    
    if (!error && redirectUrl) {
      navigate(redirectUrl);
    }
    
    return { error };
  };

  const signIn = async (email: string, password: string, redirectUrl?: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (!error) {
      // Redirect to the stored URL or default to homepage
      navigate(redirectUrl || '/');
    }
    
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUserRole(null);
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut, userRole, hasRole, refreshRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
