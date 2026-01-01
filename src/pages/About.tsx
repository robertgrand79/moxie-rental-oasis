import React from 'react';
import { Loader2 } from 'lucide-react';
import AboutHero from '@/components/about/AboutHero';
import AboutIntroduction from '@/components/about/AboutIntroduction';
import MissionSection from '@/components/about/MissionSection';
import ValuesSection from '@/components/about/ValuesSection';
import ExcellenceAuthenticitySection from '@/components/about/ExcellenceAuthenticitySection';
import { useTenantSettings } from '@/hooks/useTenantSettings';

const About = () => {
  const { loading, error } = useTenantSettings();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Unable to load page</h1>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted">
      <AboutHero />
      <div className="container mx-auto px-4 py-8 space-y-8">
        <AboutIntroduction />
        <MissionSection />
        <ValuesSection />
        <ExcellenceAuthenticitySection />
      </div>
    </div>
  );
};

export default About;
