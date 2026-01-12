import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

/**
 * PlatformGetStarted - Legacy redirect page
 * 
 * This page now redirects to the consolidated signup flow at /platform/signup.
 * All signup functionality has been consolidated into a single form that collects
 * personal info, business details, and template selection upfront.
 */
const PlatformGetStarted: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the consolidated signup flow
    navigate('/platform/signup', { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Redirecting to signup...</p>
      </div>
    </div>
  );
};

export default PlatformGetStarted;
