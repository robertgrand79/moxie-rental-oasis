import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AuthConfirm: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const verifyEmail = async () => {
      const tokenHash = searchParams.get('token_hash');
      const type = searchParams.get('type') as 'signup' | 'recovery' | 'invite' | 'email' | 'magiclink';
      const next = searchParams.get('next') || '/signup';

      if (!tokenHash || !type) {
        setStatus('error');
        setErrorMessage('Invalid confirmation link. Missing required parameters.');
        return;
      }

      try {
        // Step 1: Verify the email token
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: type,
        });

        if (error) {
          console.error('Token verification error:', error);
          setStatus('error');
          setErrorMessage(error.message || 'Failed to verify your email. The link may have expired.');
          return;
        }

        // Step 2: Ensure session is established
        if (data?.session?.access_token && data?.session?.refresh_token) {
          const { error: setSessionError } = await supabase.auth.setSession({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
          });

          if (setSessionError) {
            console.warn('Failed to set session after verifyOtp:', setSessionError);
          }
        }

        // Step 3: Success - redirect to org creation page
        // Plan info is stored in user_metadata, no localStorage needed
        setStatus('success');

        setTimeout(() => {
          // Use hard navigation to ensure auth context initializes cleanly
          window.location.href = next;
        }, 1500);

      } catch (err) {
        console.error('Unexpected error during verification:', err);
        setStatus('error');
        setErrorMessage('An unexpected error occurred. Please try again.');
      }
    };

    verifyEmail();
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

          {status === 'success' && (
            <>
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-foreground mb-2">Email Verified!</h1>
              <p className="text-muted-foreground">
                Redirecting you to set up your organization...
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
