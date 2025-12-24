import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Home, Search, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect } from 'react';

const NotFoundAdmin: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.error('404 Error in Admin: User attempted to access non-existent route:', location.pathname);
  }, [location.pathname]);

  const suggestedLinks = [
    { label: 'Dashboard', path: '/admin', icon: Home },
    { label: 'Properties', path: '/admin/properties', icon: Search },
    { label: 'Guest Experience', path: '/admin/guest-experience', icon: HelpCircle },
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-lg text-center">
        <CardHeader className="pb-4">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center mb-4">
            <span className="text-4xl font-bold text-primary">404</span>
          </div>
          <CardTitle className="text-2xl">Page Not Found</CardTitle>
          <CardDescription className="text-base">
            The page you're looking for doesn't exist or has been moved.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Requested: <code className="bg-muted px-2 py-1 rounded text-xs">{location.pathname}</code>
          </p>

          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground mb-3">Try one of these instead:</p>
            <div className="flex flex-col gap-2">
              {suggestedLinks.map((link) => (
                <Button
                  key={link.path}
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate(link.path)}
                >
                  <link.icon className="h-4 w-4 mr-2" />
                  {link.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="text-muted-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFoundAdmin;
