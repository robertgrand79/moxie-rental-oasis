import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, CheckCircle, XCircle, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PendingOrganizationData } from '@/pages/platform/PlatformSignup';

const AuthConfirm: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'verifying' | 'creating_org' | 'success' | 'error'>('verifying');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [orgName, setOrgName] = useState<string>('');

  useEffect(() => {
    const verifyAndCreateOrg = async () => {
      const tokenHash = searchParams.get('token_hash');
      const type = searchParams.get('type') as 'signup' | 'recovery' | 'invite' | 'email' | 'magiclink';
      const next = searchParams.get('next') || '/admin/onboarding';

      if (!tokenHash || !type) {
        setStatus('error');
        setErrorMessage('Invalid confirmation link. Missing required parameters.');
        return;
      }

      try {
        // Step 1: Verify the email token
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: type,
        });

        if (error) {
          console.error('Token verification error:', error);
          setStatus('error');
          setErrorMessage(error.message || 'Failed to verify your email. The link may have expired.');
          return;
        }

        // Step 2: Check for pending organization data
        const pendingDataStr = localStorage.getItem('pendingOrganization');
        
        if (pendingDataStr) {
          setStatus('creating_org');
          
          try {
            const pendingData: PendingOrganizationData = JSON.parse(pendingDataStr);
            setOrgName(pendingData.name);
            
            // Get the current user
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            
            if (userError || !user) {
              throw new Error('Failed to get authenticated user');
            }
            
            // Create the organization using the RPC function
            const { data: orgId, error: createError } = await supabase
              .rpc('create_organization_with_owner', {
                _name: pendingData.name,
                _slug: pendingData.slug,
                _user_id: user.id,
                _template_id: null,
                _visual_template_id: pendingData.templateId,
                _include_demo_data: pendingData.includeDemoData,
              });

            if (createError) {
              console.error('Organization creation error:', createError);
              throw new Error(createError.message);
            }

            if (!orgId) {
              throw new Error('Organization creation failed - no ID returned');
            }

            // Clear the pending data
            localStorage.removeItem('pendingOrganization');
            
            setStatus('success');
            
            // Redirect to dashboard with the new org
            setTimeout(() => {
              window.location.href = `/admin/dashboard?org=${pendingData.slug}`;
            }, 1500);
            
          } catch (orgError) {
            console.error('Organization creation failed:', orgError);
            // Don't fail the whole flow - user can create org later
            localStorage.removeItem('pendingOrganization');
            setStatus('success');
            
            // Redirect to org signup as fallback
            setTimeout(() => {
              navigate('/signup', { replace: true });
            }, 1500);
          }
        } else {
          // No pending organization - just redirect to next
          setStatus('success');
          
          setTimeout(() => {
            navigate(next, { replace: true });
          }, 1500);
        }
      } catch (err) {
        console.error('Unexpected error during verification:', err);
        setStatus('error');
        setErrorMessage('An unexpected error occurred. Please try again.');
      }
    };

    verifyAndCreateOrg();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full mx-4">
        <div className="bg-card rounded-xl shadow-lg p-8 text-center border border-border">
          {status === 'verifying' && (
            <>
              <Loader2 className="h-16 w-16 text-primary animate-spin mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-foreground mb-2">Verifying your email...</h1>
              <p className="text-muted-foreground">Please wait while we confirm your account.</p>
            </>
          )}

          {status === 'creating_org' && (
            <>
              <div className="relative mx-auto mb-4 w-16 h-16">
                <Building2 className="h-16 w-16 text-primary" />
                <div className="absolute -bottom-1 -right-1">
                  <Loader2 className="h-6 w-6 text-primary animate-spin" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">Creating Your Organization</h1>
              <p className="text-muted-foreground">
                Setting up <strong>{orgName}</strong>...
              </p>
              <p className="text-sm text-muted-foreground mt-2">This will only take a moment</p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-foreground mb-2">
                {orgName ? 'Organization Created!' : 'Email Verified!'}
              </h1>
              <p className="text-muted-foreground">
                {orgName 
                  ? `${orgName} is ready. Redirecting to your dashboard...`
                  : 'Redirecting you to complete your setup...'
                }
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-foreground mb-2">Verification Failed</h1>
              <p className="text-muted-foreground mb-6">{errorMessage}</p>
              <div className="space-y-3">
                <Button 
                  onClick={() => navigate('/get-started')} 
                  className="w-full"
                >
                  Try signing up again
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/auth')}
                  className="w-full"
                >
                  Go to login
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthConfirm;
