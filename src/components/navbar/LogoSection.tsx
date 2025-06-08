
import React from 'react';
import { Link } from 'react-router-dom';

const LogoSection = () => {
  return (
    <div className="flex items-center">
      <Link to="/" className="flex items-center">
        <img 
          src="/lovable-uploads/7471f968-e7b4-49d2-9281-852c85dc81e4.png" 
          alt="Moxie Vacation Rentals" 
          className="h-10 w-auto"
        />
      </Link>
    </div>
  );
};

export default LogoSection;
