
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { LogOut, User, Menu, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const NavBar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to sign out. Please try again.',
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Signed out',
        description: 'You have been successfully signed out.'
      });
      navigate('/');
    }
  };

  const navigationItems = [
    { title: 'Home', href: '/' },
    { title: 'Listings', href: '/listings' },
    { title: 'Blog', href: '/blog' },
    { title: 'About', href: '/about' },
    { title: 'Local Favorites', href: '/experiences' },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img 
                src="/lovable-uploads/a5d1cce3-c3fc-40a0-9eed-f641995e8887.png" 
                alt="Moxie Vacation Rentals" 
                className="h-8 w-auto"
              />
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <Link
                key={item.title}
                to={item.href}
                className="text-gray-700 hover:text-gray-900 font-medium text-sm transition-colors duration-200"
              >
                {item.title}
              </Link>
            ))}
          </div>
          
          {/* Auth & Mobile Menu Section */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <div className="hidden sm:flex items-center space-x-3">
                  <div className="flex items-center px-3 py-2 bg-gray-50 rounded-lg">
                    <User className="h-4 w-4 text-gray-600 mr-2" />
                    <span className="text-sm font-medium text-gray-700">{user.email}</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Sign Out</span>
                </Button>
              </>
            ) : (
              <Link to="/auth">
                <Button 
                  size="sm"
                  className="bg-gray-900 hover:bg-gray-800 text-white px-6 rounded-full"
                >
                  BOOK NOW
                </Button>
              </Link>
            )}
            
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden p-2"
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? 
                <X className="h-6 w-6 text-gray-700" /> : 
                <Menu className="h-6 w-6 text-gray-700" />
              }
            </Button>
          </div>
        </div>
        
        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-100">
            <div className="py-4 space-y-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.title}
                  to={item.href}
                  className="block px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg font-medium transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.title}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
