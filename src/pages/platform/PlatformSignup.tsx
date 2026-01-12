import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { toast } from '@/hooks/use-toast';
import { Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

const PlatformSignup: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [signupData, setSignupData] = useState({ email: '', password: '', fullName: '', phone: '' });
  const { signUp, user, loading, roleLoading } = useAuth();
  const { organization, loading: orgLoading } = useCurrentOrganization();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect authenticated users based on organization status
    if (user && !loading && !roleLoading && !orgLoading) {
      if (organization?.slug) {
        // User has organization - go to their admin dashboard
        window.location.href = `/admin?org=${organization.slug}`;
      } else {
        // User needs to create organization
        navigate('/signup', { replace: true });
      }
    }
  }, [user, loading, roleLoading, orgLoading, organization, navigate]);

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
          description: 'Please check your email to verify your account before signing in.',
          duration: 8000,
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

  if (user && (loading || roleLoading || orgLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <Card className="w-full max-w-md border-0 shadow-xl">
          <CardHeader className="text-center pb-2">
            {/* Logo */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                StayMoxie
              </span>
            </div>
            
            <CardTitle className="text-2xl">Start Your Free Trial</CardTitle>
            <CardDescription>
              Create your account to get started with StayMoxie
            </CardDescription>
          </CardHeader>
          
          <CardContent>
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
                  placeholder="John Smith"
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
                  placeholder="you@example.com"
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
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-phone">Phone Number <span className="text-muted-foreground text-xs">(optional)</span></Label>
                <Input
                  id="signup-phone"
                  type="tel"
                  value={signupData.phone}
                  onChange={(e) => setSignupData(prev => ({ ...prev, phone: e.target.value }))}
                  disabled={isLoading}
                  placeholder="+1 (555) 123-4567"
                />
                <p className="text-xs text-muted-foreground">For SMS notifications</p>
              </div>
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white" 
                disabled={isLoading}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>
            
            <p className="text-xs text-muted-foreground text-center mt-4">
              By signing up, you agree to our{' '}
              <a href="/terms" className="underline">Terms of Service</a>{' '}
              and{' '}
              <a href="/privacy" className="underline">Privacy Policy</a>.
            </p>
            
            <div className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/auth" className="text-blue-600 hover:underline font-medium">
                Log in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Side - Benefits (hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-12 items-center justify-center">
        <div className="max-w-md text-white">
          <h2 className="text-3xl font-bold mb-8">
            Start growing your direct bookings today
          </h2>
          
          <div className="space-y-6">
            {[
              'Direct booking engine with Stripe payments',
              'Local content hub for SEO domination',
              'AI-powered guest messaging',
              'Smart home integration',
              'Multi-channel calendar sync',
            ].map((benefit, index) => (
              <div key={index} className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-blue-300 flex-shrink-0" />
                <span className="text-lg">{benefit}</span>
              </div>
            ))}
          </div>
          
          <div className="mt-12 p-6 bg-white/10 rounded-xl backdrop-blur">
            <p className="text-white/90 italic mb-4">
              "Built by vacation rental operators for vacation rental operators. We know what it takes to grow direct bookings."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-medium">The StayMoxie Team</div>
                <div className="text-sm text-white/70">Your direct booking partner</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlatformSignup;
