import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Home, Search, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTenantSettings } from '@/hooks/useTenantSettings';
import { useEffect } from 'react';

const NotFoundGuest: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { settings } = useTenantSettings();

  useEffect(() => {
    console.error('404 Error on Guest Site: User attempted to access non-existent route:', location.pathname);
  }, [location.pathname]);

  const siteName = settings?.site_title || 'Our Site';

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-lg text-center">
        {/* Brand Logo/Title */}
        <div className="mb-8">
          {settings?.logo_url ? (
            <img 
              src={settings.logo_url} 
              alt={siteName} 
              className="h-12 mx-auto mb-4"
            />
          ) : (
            <h1 className="text-2xl font-bold text-primary">{siteName}</h1>
          )}
        </div>

        {/* 404 Content */}
        <div className="bg-card rounded-2xl shadow-xl p-8 border">
          <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <MapPin className="h-10 w-10 text-primary" />
          </div>
          
          <h2 className="text-5xl font-bold text-foreground mb-4">404</h2>
          <h3 className="text-xl font-semibold text-foreground mb-2">Page Not Found</h3>
          <p className="text-muted-foreground mb-8">
            We couldn't find the page you're looking for. It may have been moved or no longer exists.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => navigate('/')} className="flex-1 sm:flex-none">
              <Home className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
            <Button variant="outline" onClick={() => navigate('/properties')} className="flex-1 sm:flex-none">
              <Search className="h-4 w-4 mr-2" />
              View Properties
            </Button>
          </div>

          <div className="mt-6 pt-6 border-t">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="text-muted-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>

        {/* Help Text */}
        <p className="text-sm text-muted-foreground mt-6">
          Need help? <a href="/contact" className="text-primary hover:underline">Contact us</a>
        </p>
      </div>
    </div>
  );
};

export default NotFoundGuest;
