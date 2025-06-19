
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  roleLoading: boolean;
  userRole: string | null;
  isAdmin: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [roleLoading, setRoleLoading] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchUserRole = async (userId: string) => {
    try {
      setRoleLoading(true);
      
      // Check legacy system first
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (profile?.role === 'admin') {
        setUserRole('admin');
        setIsAdmin(true);
        return;
      }

      // Try new role system with explicit column hint
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select(`
          role:role_id(
            name
          )
        `)
        .eq('user_id', userId)
        .eq('is_active', true)
        .limit(1);

      if (userRoles && userRoles.length > 0 && userRoles[0].role) {
        const roleName = (userRoles[0].role as any).name;
        setUserRole(roleName);
        setIsAdmin(roleName === 'Admin');
      } else {
        setUserRole('user');
        setIsAdmin(false);
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
      setUserRole('user');
      setIsAdmin(false);
    } finally {
      setRoleLoading(false);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch role immediately and wait for it
          await fetchUserRole(session.user.id);
        } else {
          setUserRole(null);
          setIsAdmin(false);
          setRoleLoading(false);
        }
        
        setLoading(false);
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

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName
        }
      }
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    setUserRole(null);
    setIsAdmin(false);
    setRoleLoading(false);
    return { error };
  };

  const value = {
    user,
    session,
    loading,
    roleLoading,
    userRole,
    isAdmin,
    signUp,
    signIn,
    signOut
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
