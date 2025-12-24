import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { useTenantSettings } from '@/hooks/useTenantSettings';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { AlertTriangle, RefreshCw, Loader2, Mail } from 'lucide-react';

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({ email: '', password: '', fullName: '', phone: '' });
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const { signIn, signUp, resetPassword, user, isAdmin, loading, roleLoading, databaseStatus } = useAuth();
  const { isOrgAdmin, loading: orgLoading } = useCurrentOrganization();
  const { settings, loading: settingsLoading } = useTenantSettings();
  const navigate = useNavigate();

  // Check if user has any admin access (legacy admin OR organization admin)
  const hasAdminAccess = isAdmin || isOrgAdmin();

  // Tenant branding
  const siteName = settings?.site_name || 'Welcome';
  const logoUrl = settings?.logo_url;
  const heroImageUrl = settings?.hero_image_url;

  useEffect(() => {
    // Handle redirect once auth is complete
    if (user && !loading) {
      // If role or org is still loading, wait
      if (roleLoading || orgLoading) {
        return;
      }
      
      // Tenant auth page - always redirect to admin dashboard
      // Fetch user's organization to include in redirect
      const fetchOrgAndRedirect = async () => {
        try {
          const { data: membership } = await supabase
            .from('organization_members')
            .select('organization:organizations(slug)')
            .eq('user_id', user.id)
            .order('joined_at', { ascending: false })
            .limit(1)
            .maybeSingle();
          
          const orgSlug = (membership?.organization as { slug?: string })?.slug;
          
          if (orgSlug) {
            window.location.href = `/admin?org=${orgSlug}`;
          } else {
            navigate('/admin', { replace: true });
          }
        } catch (err) {
          console.error('Error fetching org for redirect:', err);
          navigate('/admin', { replace: true });
        }
      };
      fetchOrgAndRedirect();
    }
  }, [user, isAdmin, hasAdminAccess, loading, roleLoading, orgLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await signIn(loginData.email, loginData.password);
      
      if (error) {
        let errorMessage = error.message;
        if (error.message.includes('invalid_credentials') || error.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please check your credentials and try again.';
        } else if (error.message.includes('email_not_confirmed')) {
          errorMessage = 'Please check your email and confirm your account before signing in.';
        }
        
        toast({
          title: 'Login Failed',
          description: errorMessage,
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Welcome back!',
          description: 'You have successfully logged in.',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await signUp(signupData.email, signupData.password, signupData.fullName, signupData.phone || undefined);
      
      if (error) {
        let errorMessage = error.message;
        if (error.message.includes('already registered')) {
          errorMessage = 'This email is already registered. Please try logging in instead.';
        }
        
        toast({
          title: 'Signup Failed',
          description: errorMessage,
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Account Created!',
          description: 'Welcome! Please check your email to verify your account.',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotPasswordLoading(true);

    try {
      const { error } = await resetPassword(forgotPasswordEmail);
      
      if (error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Check your email',
          description: 'If an account exists with this email, you will receive a password reset link.',
        });
        setForgotPasswordOpen(false);
        setForgotPasswordEmail('');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  // Show loading/redirecting state whenever user is authenticated
  // This prevents the sign-in form from flashing during redirect
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">
            {loading ? 'Authenticating...' : 
             roleLoading || orgLoading ? 'Loading your profile...' : 
             'Redirecting to dashboard...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex">
        {/* Left side - Form */}
        <div className="flex-1 flex items-center justify-center p-8 bg-background">
          <div className="w-full max-w-md space-y-8">
            {/* Logo and branding */}
            <div className="text-center">
              {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt={siteName} 
                  className="h-16 w-auto mx-auto mb-6 object-contain"
                />
              ) : (
                <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-primary">
                    {siteName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <h1 className="text-2xl font-bold text-foreground">
                Welcome to {siteName}
              </h1>
              <p className="text-muted-foreground mt-2">
                Sign in to access your account
              </p>
            </div>

            {/* Database error alert */}
            {!databaseStatus.isConnected && databaseStatus.error && (
              <Alert className="border-destructive/50 bg-destructive/10">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <AlertDescription className="text-destructive">
                  <p className="font-medium mb-1">Connection Issue</p>
                  <p className="text-sm">{databaseStatus.error}</p>
                  {databaseStatus.canRetry && (
                    <Button 
                      onClick={databaseStatus.retry} 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      disabled={databaseStatus.isChecking}
                    >
                      <RefreshCw className={`w-3 h-3 mr-1 ${databaseStatus.isChecking ? 'animate-spin' : ''}`} />
                      Retry
                    </Button>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {/* Auth tabs */}
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Create Account</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="you@example.com"
                      value={loginData.email}
                      onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                      required
                      disabled={isLoading}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginData.password}
                      onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                      required
                      disabled={isLoading}
                      className="h-11"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setForgotPasswordEmail(loginData.email);
                        setForgotPasswordOpen(true);
                      }}
                      className="text-sm text-primary hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-11" 
                    disabled={isLoading || (!databaseStatus.isConnected && !databaseStatus.isChecking)}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="John Doe"
                      value={signupData.fullName}
                      onChange={(e) => setSignupData(prev => ({ ...prev, fullName: e.target.value }))}
                      required
                      disabled={isLoading}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@example.com"
                      value={signupData.email}
                      onChange={(e) => setSignupData(prev => ({ ...prev, email: e.target.value }))}
                      required
                      disabled={isLoading}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={signupData.password}
                      onChange={(e) => setSignupData(prev => ({ ...prev, password: e.target.value }))}
                      required
                      disabled={isLoading}
                      minLength={6}
                      className="h-11"
                    />
                    <p className="text-xs text-muted-foreground">
                      Must be at least 6 characters
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-phone">Phone Number <span className="text-muted-foreground">(optional)</span></Label>
                    <Input
                      id="signup-phone"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={signupData.phone}
                      onChange={(e) => setSignupData(prev => ({ ...prev, phone: e.target.value }))}
                      disabled={isLoading}
                      className="h-11"
                    />
                    <p className="text-xs text-muted-foreground">
                      For SMS notifications
                    </p>
                  </div>
                  <Button
                    type="submit" 
                    className="w-full h-11" 
                    disabled={isLoading || (!databaseStatus.isConnected && !databaseStatus.isChecking)}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {/* Footer */}
            <p className="text-center text-sm text-muted-foreground">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>

        {/* Forgot Password Dialog */}
        <Dialog open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <DialogTitle className="text-center">Reset your password</DialogTitle>
              <DialogDescription className="text-center">
                Enter your email address and we'll send you a link to reset your password.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="forgot-email">Email</Label>
                <Input
                  id="forgot-email"
                  type="email"
                  placeholder="you@example.com"
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  required
                  disabled={forgotPasswordLoading}
                  className="h-11"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-11" 
                disabled={forgotPasswordLoading}
              >
                {forgotPasswordLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Right side - Hero image/gradient (hidden on mobile) */}
        <div 
          className="hidden lg:flex flex-1 items-center justify-center relative overflow-hidden"
          style={{
            background: heroImageUrl 
              ? `linear-gradient(to bottom, hsl(var(--primary) / 0.8), hsl(var(--primary) / 0.9)), url(${heroImageUrl}) center/cover`
              : 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.8))'
          }}
        >
          <div className="relative z-10 text-center p-12 max-w-lg">
            <h2 className="text-3xl font-bold text-primary-foreground mb-4">
              {siteName}
            </h2>
            <p className="text-primary-foreground/80 text-lg">
              Manage your properties, bookings, and guest experiences all in one place.
            </p>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-white/20 blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Auth;
