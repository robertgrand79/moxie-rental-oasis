import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useDatabase } from '@/hooks/useDatabase';

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
  databaseStatus: {
    isConnected: boolean;
    isChecking: boolean;
    error: string | null;
    retry: () => void;
    canRetry: boolean;
  };
  retryAuth: () => void;
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
  const [authRetryCount, setAuthRetryCount] = useState(0);
  const [roleRetriesMap, setRoleRetriesMap] = useState<Map<string, number>>(new Map());
  
  const databaseStatus = useDatabase();

  const fetchUserRoleWithTimeout = async (userId: string, timeoutMs: number = 5000, retryCount = 0) => {
    // Prevent duplicate simultaneous fetches for the same user
    const currentRetries = roleRetriesMap.get(userId) || 0;
    if (currentRetries > 0) {
      console.log('🔄 Role fetch already in progress for user:', userId, 'skipping duplicate');
      return;
    }

    console.log('🔍 Starting role fetch for user:', userId, `(attempt ${retryCount + 1})`);
    setRoleLoading(true);
    
    // Track this user's retry attempt
    setRoleRetriesMap(prev => new Map(prev.set(userId, retryCount + 1)));
    
    try {
      // Shorter timeout and simpler database check
      if (!databaseStatus.isConnected && retryCount === 0) {
        console.warn('⚠️ Database not connected, attempting to connect...');
        databaseStatus.checkConnection();
      }

      // Create the fetch promise with a reasonable timeout
      const { data: profileData, error } = await Promise.race([
        supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single(),
        new Promise<any>((_, reject) => 
          setTimeout(() => reject(new Error('Role fetch timeout')), timeoutMs)
        )
      ]);

      if (error) {
        console.error('❌ Error fetching user profile:', error);
        throw error;
      }

      const role = profileData?.role || 'user';
      console.log('✅ User role fetched successfully:', role);
      
      setUserRole(role);
      setIsAdmin(role === 'admin');
      setProfile(profileData);
      
      // Clear retry tracking on success
      setRoleRetriesMap(prev => {
        const newMap = new Map(prev);
        newMap.delete(userId);
        return newMap;
      });
      
    } catch (error) {
      console.error('💥 Role fetch failed or timed out:', error);
      
      // Only retry on first attempt and for connection-related errors
      if (retryCount === 0 && error instanceof Error && (
        error.message.includes('timeout') || 
        error.message.includes('connection') ||
        error.message.includes('network')
      )) {
        console.log('🔄 Retrying role fetch due to connection issue...');
        
        // Schedule single retry after delay
        setTimeout(() => {
          fetchUserRoleWithTimeout(userId, timeoutMs, 1);
        }, 2000);
        return;
      }
      
      // After max retries or non-connection errors, fallback to user role
      console.log('🚨 Max retries reached or permanent error, defaulting to user role');
      setUserRole('user');
      setIsAdmin(false);
      setProfile(null);
      
      // Clear retry tracking
      setRoleRetriesMap(prev => {
        const newMap = new Map(prev);
        newMap.delete(userId);
        return newMap;
      });
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
    
    try {
      // Check database connection before attempting sign up
      if (!databaseStatus.isConnected && !databaseStatus.isChecking) {
        console.warn('⚠️ Database not connected, checking connection...');
        await databaseStatus.checkConnection();
      }

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
        return { error };
      }

      console.log('✅ Sign up successful');
      return { error: null };
    } catch (error) {
      console.error('💥 Unexpected sign up error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      return { error: { message: errorMessage } };
    }
  };

  const signIn = async (email: string, password: string) => {
    console.log('🔑 Attempting sign in for:', email);
    
    try {
      // Check database connection before attempting sign in
      if (!databaseStatus.isConnected && !databaseStatus.isChecking) {
        console.warn('⚠️ Database not connected, checking connection...');
        await databaseStatus.checkConnection();
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('❌ Sign in error:', error);
        // Add more specific error context
        if (error.message.includes('Invalid login credentials')) {
          return { error: { ...error, message: 'Invalid email or password. Please check your credentials.' } };
        }
        return { error };
      }

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

      return { error: null };
    } catch (error) {
      console.error('💥 Unexpected sign in error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      return { error: { message: errorMessage } };
    }
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

  const retryAuth = () => {
    if (authRetryCount < 3) {
      console.log('🔄 Retrying authentication...', authRetryCount + 1);
      setAuthRetryCount(prev => prev + 1);
      
      // Retry getting the session
      supabase.auth.getSession().then(({ data: { session }, error }) => {
        if (error) {
          console.error('❌ Auth retry failed:', error);
          return;
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => {
            fetchUserRoleWithTimeout(session.user.id);
          }, 0);
        }
      });
    }
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
    signOut,
    databaseStatus: {
      isConnected: databaseStatus.isConnected,
      isChecking: databaseStatus.isChecking,
      error: databaseStatus.error,
      retry: databaseStatus.retry,
      canRetry: databaseStatus.canRetry
    },
    retryAuth
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
