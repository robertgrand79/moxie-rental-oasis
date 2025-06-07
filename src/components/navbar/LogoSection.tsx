
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface LogoSectionProps {
  isAdminPage: boolean;
}

const LogoSection = ({ isAdminPage }: LogoSectionProps) => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div className="flex items-center">
      {isAdminPage ? (
        <div className="flex items-center space-x-4">
          <Link to="/" className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft className="h-5 w-5 mr-1 text-icon-gray" />
            <span className="text-sm font-medium">Back to Site</span>
          </Link>
        </div>
      ) : (
        <Link to="/" className="flex items-center">
          <img 
            src="/lovable-uploads/7471f968-e7b4-49d2-9281-852c85dc81e4.png" 
            alt="Moxie Vacation Rentals" 
            className={`h-12 w-auto transition-all duration-300 ${
              isHomePage ? 'drop-shadow-lg filter brightness-0 invert' : ''
            }`}
          />
        </Link>
      )}
    </div>
  );
};

export default LogoSection;
