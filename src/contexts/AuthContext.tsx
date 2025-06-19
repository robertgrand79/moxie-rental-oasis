
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
      console.log('🔍 Fetching role for user:', userId);
      
      // Use only the legacy system for now - it's what works
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('❌ Error fetching user profile:', error);
        setUserRole('user');
        setIsAdmin(false);
        return;
      }

      const role = profile?.role || 'user';
      console.log('✅ User role from profiles:', role);
      
      setUserRole(role);
      setIsAdmin(role === 'admin');
      
    } catch (error) {
      console.error('💥 Unexpected error fetching user role:', error);
      setUserRole('user');
      setIsAdmin(false);
    } finally {
      setRoleLoading(false);
    }
  };

  useEffect(() => {
    console.log('🔄 Setting up auth listener...');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 Auth state changed:', event, session?.user?.email);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('👤 User authenticated, fetching role...');
          await fetchUserRole(session.user.id);
        } else {
          console.log('👤 No user, clearing role state');
          setUserRole(null);
          setIsAdmin(false);
          setRoleLoading(false);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    const initializeAuth = async () => {
      try {
        console.log('🔍 Checking for existing session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Error getting session:', error);
          setLoading(false);
          return;
        }
        
        console.log('📋 Initial session check:', session?.user?.email || 'No session');
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchUserRole(session.user.id);
        }
        
      } catch (error) {
        console.error('💥 Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      console.log('🧹 Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    console.log('📝 Attempting sign up for:', email);
    
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

    if (error) {
      console.error('❌ Sign up error:', error);
    } else {
      console.log('✅ Sign up successful');
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    console.log('🔑 Attempting sign in for:', email);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('❌ Sign in error:', error);
    } else {
      console.log('✅ Sign in successful');
    }

    return { error };
  };

  const signOut = async () => {
    console.log('🚪 Signing out...');
    
    const { error } = await supabase.auth.signOut();
    
    if (!error) {
      setUserRole(null);
      setIsAdmin(false);
      setRoleLoading(false);
      console.log('✅ Sign out successful');
    } else {
      console.error('❌ Sign out error:', error);
    }
    
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
