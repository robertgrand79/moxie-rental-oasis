import React from 'react';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import AccessibilityStatement from '@/components/legal/AccessibilityStatement';

const Accessibility: React.FC = () => {
  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <AccessibilityStatement />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Accessibility;
