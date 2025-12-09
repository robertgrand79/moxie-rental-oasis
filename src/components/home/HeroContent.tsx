
import React from 'react';
import { ArrowRight, MapPin, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface HeroContentProps {
  settings: {
    heroTitle: string;
    heroSubtitle: string;
    heroDescription: string;
    heroLocationText: string;
    heroCTAText: string;
  };
}

const HeroContent = ({ settings }: HeroContentProps) => {
  return (
    <div className="relative z-10 text-center text-hero-text px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      <div className="space-y-8">
        {/* Main Heading */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight">
          {settings.heroTitle}
          <span className="text-accent block sm:inline sm:ml-3">
            {settings.heroSubtitle}
          </span>
        </h1>

        {/* Subheading */}
        <p className="text-lg sm:text-xl md:text-2xl text-hero-text-muted max-w-4xl mx-auto leading-relaxed">
          {settings.heroDescription}
        </p>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-8 py-6">
          <div className="flex items-center space-x-2">
            <Star className="h-5 w-5 text-accent" />
            <span className="text-sm font-medium">5-Star Experiences</span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-accent" />
            <span className="text-sm font-medium">{settings.heroLocationText}</span>
          </div>
        </div>

        {/* CTA Button */}
        <div className="flex justify-center items-center pt-4">
          <Button 
            asChild
            size="lg" 
            className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-8 py-4 text-lg"
          >
            <Link to="/properties" className="flex items-center space-x-2">
              <span>{settings.heroCTAText}</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HeroContent;
