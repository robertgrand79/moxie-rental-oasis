import React from 'react';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import DataExportRequest from '@/components/legal/DataExportRequest';

const DataPrivacy: React.FC = () => {
  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-foreground mb-2">Data Privacy Center</h1>
            <p className="text-lg text-muted-foreground mb-8">
              Manage your personal data and exercise your privacy rights
            </p>
            
            <DataExportRequest />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default DataPrivacy;
