
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { auditService } from '@/services/auditService';
import { validatePasswordComplexity, RateLimiter } from '@/utils/security';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Rate limiter for login attempts
const loginRateLimiter = new RateLimiter(5, 15 * 60 * 1000); // 5 attempts per 15 minutes

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Configure Supabase client with explicit auth settings for security
    const initializeAuth = async () => {
      try {
        // Set up auth state listener FIRST
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('Auth state changed:', event, session?.user?.email);
            setSession(session);
            setUser(session?.user ?? null);
            
            // Check admin status when user changes
            if (session?.user) {
              setTimeout(async () => {
                try {
                  const { data, error } = await supabase.rpc('is_admin');
                  if (!error) {
                    setIsAdmin(data);
                  }
                } catch (error) {
                  console.error('Error checking admin status:', error);
                  setIsAdmin(false);
                }
              }, 0);
            } else {
              setIsAdmin(false);
            }
            
            setLoading(false);
          }
        );

        // THEN check for existing session
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setSession(session);
          setUser(session.user);
          
          // Check if user is admin
          try {
            const { data, error } = await supabase.rpc('is_admin');
            if (!error) {
              setIsAdmin(data);
            }
          } catch (error) {
            console.error('Error checking admin status:', error);
            setIsAdmin(false);
          }
        }
        
        if (!session) {
          setLoading(false);
        }

        return () => subscription.unsubscribe();
      } catch (error) {
        console.error('Auth initialization error:', error);
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    // Validate password complexity
    const passwordValidation = validatePasswordComplexity(password);
    if (!passwordValidation.isValid) {
      const error = {
        message: `Password requirements not met: ${passwordValidation.errors.join(', ')}`
      };
      await auditService.logLoginAttempt(email, false, error.message);
      return { error };
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

    await auditService.logLoginAttempt(email, !error, error?.message);
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    // Check rate limiting
    if (!loginRateLimiter.isAllowed(email)) {
      const error = {
        message: 'Too many login attempts. Please try again in 15 minutes.'
      };
      await auditService.logLoginAttempt(email, false, error.message);
      return { error };
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (!error) {
      // Reset rate limiting on successful login
      loginRateLimiter.reset(email);
    }

    await auditService.logLoginAttempt(email, !error, error?.message);
    return { error };
  };

  const signOut = async () => {
    await auditService.logSecurityEvent({
      action: 'logout',
      success: true
    });

    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    isAdmin
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
