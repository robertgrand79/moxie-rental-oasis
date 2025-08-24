import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { AlertTriangle, Database, RefreshCw, Wifi, WifiOff } from 'lucide-react';

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({ email: '', password: '', fullName: '' });
  const [debugInfo, setDebugInfo] = useState('');
  const { signIn, signUp, user, isAdmin, loading, roleLoading, databaseStatus, retryAuth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Debug logging
    const info = `
      User: ${user?.email || 'None'}
      Loading: ${loading}
      Role Loading: ${roleLoading}
      Is Admin: ${isAdmin}
      Database Connected: ${databaseStatus.isConnected}
      Database Error: ${databaseStatus.error || 'None'}
      Current Time: ${new Date().toLocaleTimeString()}
    `;
    setDebugInfo(info);

    // Handle redirect once auth is complete
    if (user && !loading) {
      console.log('🎯 Auth complete, checking role...', { 
        hasUser: !!user, 
        isAdmin, 
        roleLoading,
        userEmail: user.email 
      });
      
      // If role is still loading, wait a bit more
      if (roleLoading) {
        console.log('⏳ Role still loading, waiting...');
        return;
      }
      
      // Role loading complete, redirect
      console.log('🚀 Redirecting user...');
      if (isAdmin) {
        console.log('👑 Redirecting admin to /admin');
        navigate('/admin', { replace: true });
      } else {
        console.log('👤 Redirecting user to /');
        navigate('/', { replace: true });
      }
    }
  }, [user, isAdmin, loading, roleLoading, navigate, databaseStatus]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('🔑 Login attempt for:', loginData.email);
      
      const { error } = await signIn(loginData.email, loginData.password);
      
      if (error) {
        console.error('❌ Login failed:', error);
        
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
        console.log('✅ Login successful');
        toast({
          title: 'Welcome back!',
          description: 'You have successfully logged in.',
        });
      }
    } catch (error) {
      console.error('💥 Unexpected login error:', error);
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
      console.log('📝 Signup attempt for:', signupData.email);
      
      const { error } = await signUp(signupData.email, signupData.password, signupData.fullName);
      
      if (error) {
        console.error('❌ Signup failed:', error);
        
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
        console.log('✅ Signup successful');
        toast({
          title: 'Account Created!',
          description: 'Welcome! Please check your email to verify your account.',
        });
      }
    } catch (error) {
      console.error('💥 Unexpected signup error:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while auth is being determined
  if (user && (loading || roleLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-sm text-muted-foreground">
                {loading ? 'Authenticating...' : 'Loading your profile...'}
              </p>
              
              {/* Database status indicator */}
              <div className="flex items-center justify-center gap-2 mt-3">
                {databaseStatus.isConnected ? (
                  <div className="flex items-center gap-1 text-green-600">
                    <Database className="w-4 h-4" />
                    <span className="text-xs">Connected</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-red-600">
                    <Database className="w-4 h-4" />
                    <span className="text-xs">Disconnected</span>
                  </div>
                )}
              </div>

              {!databaseStatus.isConnected && databaseStatus.canRetry && (
                <Button 
                  onClick={databaseStatus.retry} 
                  variant="outline" 
                  size="sm" 
                  className="mt-3"
                  disabled={databaseStatus.isChecking}
                >
                  <RefreshCw className={`w-3 h-3 mr-1 ${databaseStatus.isChecking ? 'animate-spin' : ''}`} />
                  Retry Connection
                </Button>
              )}
              
              {process.env.NODE_ENV === 'development' && (
                <Alert className="mt-4">
                  <AlertDescription>
                    <pre className="text-xs whitespace-pre-wrap">{debugInfo}</pre>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">Welcome</CardTitle>
            <CardDescription>Sign in to access your account</CardDescription>
            
            {/* Database connection status */}
            <div className="flex items-center justify-center gap-2 mt-2">
              {databaseStatus.isConnected ? (
                <div className="flex items-center gap-1 text-green-600">
                  <Wifi className="w-4 h-4" />
                  <span className="text-xs">Database Connected</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-red-600">
                  <WifiOff className="w-4 h-4" />
                  <span className="text-xs">Database Disconnected</span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            
            {/* Database error alert */}
            {!databaseStatus.isConnected && databaseStatus.error && (
              <Alert className="mb-4 border-orange-200 bg-orange-50">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800">
                  <p className="font-medium mb-1">Database Connection Issue</p>
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
                      Retry Connection
                    </Button>
                  )}
                </AlertDescription>
              </Alert>
            )}
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    value={loginData.email}
                    onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                    required
                    disabled={isLoading}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading || (!databaseStatus.isConnected && !databaseStatus.isChecking)}
                >
                  {isLoading ? 'Logging in...' : 'Login'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    value={signupData.fullName}
                    onChange={(e) => setSignupData(prev => ({ ...prev, fullName: e.target.value }))}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={signupData.email}
                    onChange={(e) => setSignupData(prev => ({ ...prev, email: e.target.value }))}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={signupData.password}
                    onChange={(e) => setSignupData(prev => ({ ...prev, password: e.target.value }))}
                    required
                    disabled={isLoading}
                    minLength={6}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading || (!databaseStatus.isConnected && !databaseStatus.isChecking)}
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {/* Debug info for development */}
          {process.env.NODE_ENV === 'development' && (
            <Alert className="mt-4">
              <AlertDescription>
                <details>
                  <summary className="cursor-pointer text-sm font-medium">Debug Info</summary>
                  <pre className="text-xs whitespace-pre-wrap mt-2">{debugInfo}</pre>
                </details>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
    </ErrorBoundary>
  );
};

export default Auth;
