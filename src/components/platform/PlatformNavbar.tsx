import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, Sparkles } from 'lucide-react';

const PlatformNavbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { href: '/features', label: 'Features' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/#faq', label: 'FAQ' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 font-fraunces">
              StayMoxie
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/auth">
              <Button variant="ghost" className="text-gray-700 hover:text-blue-600">
                Log In
              </Button>
            </Link>
            <Link to="/auth?tab=signup">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6">
                Start Free
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-100">
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="block py-2 text-gray-600 hover:text-blue-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 border-t border-gray-100 space-y-3">
              <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                <Button variant="outline" className="w-full">Log In</Button>
              </Link>
              <Link to="/auth?tab=signup" onClick={() => setIsMenuOpen(false)}>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  Start Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default PlatformNavbar;
