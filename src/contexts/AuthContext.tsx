import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useDatabase } from '@/hooks/useDatabase';
import { toast } from '@/hooks/use-toast';
import { trackFailedLogin, clearFailedLoginTracking } from '@/utils/securityNotifications';

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
  signUp: (email: string, password: string, fullName: string, phone?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
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
          
          // Update last_login_at for SIGNED_IN events (covers all login methods)
          if (event === 'SIGNED_IN') {
            console.log('📝 Updating last login timestamp...');
            supabase.rpc('update_user_last_login', { user_id: session.user.id })
              .then(({ error }) => {
                if (error) {
                  console.warn('Failed to update last_login_at:', error);
                } else {
                  console.log('✅ Last login timestamp updated');
                }
              });
          }
          
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

  const signUp = async (email: string, password: string, fullName: string, phone?: string) => {
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
            full_name: fullName,
            phone: phone || null
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

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('❌ Sign in error:', error);
        
        // Track failed login attempts for security
        if (error.message.includes('Invalid login credentials')) {
          // Get organization ID from user's profile if possible (for multi-org security)
          const { data: orgData } = await supabase
            .from('organization_members')
            .select('organization_id')
            .limit(1)
            .maybeSingle();
          
          trackFailedLogin(email, orgData?.organization_id);
          
          return { error: { ...error, message: 'Invalid email or password. Please check your credentials.' } };
        }
        return { error };
      }

      // Clear failed login tracking on successful login
      clearFailedLoginTracking(email);

      console.log('✅ Sign in successful');
      
      // Note: last_login_at is now updated via onAuthStateChange SIGNED_IN event
      if (data?.user?.id) {
        // Check for unread notifications and show welcome toast
        try {
          const { count, error: notifError } = await supabase
            .from('admin_notifications')
            .select('*', { count: 'exact', head: true })
            .eq('is_read', false)
            .eq('is_archived', false);
          
          if (!notifError && count !== null) {
            const firstName = data.user.user_metadata?.full_name?.split(' ')[0] || 'back';
            if (count > 0) {
              toast({
                title: `Welcome ${firstName}!`,
                description: `You have ${count} unread notification${count !== 1 ? 's' : ''}`,
              });
            } else {
              toast({
                title: `Welcome ${firstName}!`,
                description: "You're all caught up - no new notifications",
              });
            }
          }
        } catch (notifErr) {
          console.warn('Failed to fetch notification count:', notifErr);
        }
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
    
    try {
      // Clear localStorage auth tokens first to prevent re-authentication
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sb-') && key.includes('-auth-token')) {
          localStorage.removeItem(key);
        }
      });
      
      // Use 'global' scope to invalidate session on all devices/tabs
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      // Always clear local state regardless of error
      // This handles cases where session is already expired/missing on server
      setUser(null);
      setSession(null);
      setUserRole(null);
      setIsAdmin(false);
      setProfile(null);
      setRoleLoading(false);
      
      // CRITICAL: Clear session storage to prevent user context mixing
      sessionStorage.removeItem('current_tenant_slug');
      sessionStorage.removeItem('chat_session_id');
      sessionStorage.removeItem('client_id');
      sessionStorage.removeItem('ga-connected-shown');
      sessionStorage.removeItem('ga_retry_count');
      
      // Handle "session not found" or "Auth session missing" gracefully
      // These errors mean the user is already signed out on the server
      if (error) {
        const isSessionMissingError = 
          error.message?.includes('session') || 
          error.message?.includes('Session') ||
          (error as any).code === 'session_not_found';
        
        if (isSessionMissingError) {
          console.log('ℹ️ Session already expired or missing, treating as successful sign out');
          return { error: null }; // Treat as success
        }
        
        console.error('❌ Sign out error:', error);
        return { error };
      }
      
      console.log('✅ Sign out successful, session storage cleared');
      return { error: null };
    } catch (error) {
      console.error('💥 Unexpected sign out error:', error);
      
      // Still clear local state on unexpected errors
      setUser(null);
      setSession(null);
      setUserRole(null);
      setIsAdmin(false);
      setProfile(null);
      setRoleLoading(false);
      
      // Return null error to allow redirect - user is effectively signed out locally
      return { error: null };
    }
  };

  const resetPassword = async (email: string) => {
    console.log('🔑 Requesting password reset for:', email);
    
    const redirectUrl = `${window.location.origin}/reset-password`;
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });
    
    if (error) {
      console.error('❌ Password reset error:', error);
    } else {
      console.log('✅ Password reset email sent');
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
    resetPassword,
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
