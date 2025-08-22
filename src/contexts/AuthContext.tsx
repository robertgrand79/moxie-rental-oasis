import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  avatar_url: string | null;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
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
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [roleLoading, setRoleLoading] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchUserRoleWithTimeout = async (userId: string, timeoutMs: number = 5000) => {
    console.log('🔍 Starting role fetch for user:', userId);
    setRoleLoading(true);
    
    try {
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Role fetch timeout')), timeoutMs);
      });

      // Create the actual fetch promise - get full profile data
      const fetchPromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      // Race the timeout against the fetch
      const { data: profileData, error } = await Promise.race([
        fetchPromise,
        timeoutPromise
      ]) as any;

      if (error) {
        console.error('❌ Error fetching user profile:', error);
        // Fallback to user role on error
        setUserRole('user');
        setIsAdmin(false);
        setProfile(null);
        return;
      }

      const role = profileData?.role || 'user';
      console.log('✅ User role fetched successfully:', role);
      
      setUserRole(role);
      setIsAdmin(role === 'admin');
      setProfile(profileData);
      
    } catch (error) {
      console.error('💥 Role fetch failed or timed out:', error);
      // Always fallback to user role if anything goes wrong
      setUserRole('user');
      setIsAdmin(false);
      setProfile(null);
    } finally {
      console.log('🏁 Role loading complete');
      setRoleLoading(false);
    }
  };

  useEffect(() => {
    console.log('🔄 Setting up auth listener...');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔐 Auth state changed:', event, session?.user?.email);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('👤 User authenticated, fetching role...');
          // Use setTimeout to avoid blocking the auth callback
          setTimeout(() => {
            fetchUserRoleWithTimeout(session.user.id);
          }, 0);
        } else {
          console.log('👤 No user, clearing role state');
          setUserRole(null);
          setIsAdmin(false);
          setProfile(null);
          setRoleLoading(false);
        }
        
        // Always set loading to false after processing auth state
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
          // Fetch role for existing session
          setTimeout(() => {
            fetchUserRoleWithTimeout(session.user.id);
          }, 0);
        } else {
          // No user, ensure loading is complete
          setRoleLoading(false);
        }
        
      } catch (error) {
        console.error('💥 Error initializing auth:', error);
        // Ensure we always stop loading even on error
        setUserRole('user');
        setIsAdmin(false);
        setProfile(null);
        setRoleLoading(false);
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
      // Update last_login_at timestamp
      try {
        await supabase
          .from('profiles')
          .update({ last_login_at: new Date().toISOString() })
          .eq('email', email);
      } catch (loginUpdateError) {
        console.warn('Failed to update last_login_at:', loginUpdateError);
      }
    }

    return { error };
  };

  const signOut = async () => {
    console.log('🚪 Signing out...');
    
    const { error } = await supabase.auth.signOut();
    
    if (!error) {
      setUserRole(null);
      setIsAdmin(false);
      setProfile(null);
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
    profile,
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
