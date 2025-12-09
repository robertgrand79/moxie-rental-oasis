
import React from 'react';
import { Home, Award, Heart, Star } from 'lucide-react';
import OptimizedImage from '@/components/ui/optimized-image';
import { useTenantSettings } from '@/hooks/useTenantSettings';

const AboutIntroduction = () => {
  const { settings } = useTenantSettings();
  const siteName = settings.site_name || 'Our Team';
  const aboutTitle = settings.aboutTitle || 'Meet Our Team';
  const aboutDescription = settings.aboutDescription || 
    `Welcome to ${siteName}! We're dedicated to providing exceptional vacation rental experiences with personalized service and attention to detail.`;
  const aboutImageUrl = settings.aboutImageUrl;
  const founderNames = settings.founderNames;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
      <div className="max-w-4xl mx-auto">
        <div className="space-y-8">
          {/* Header Section */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{aboutTitle}</h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              {aboutDescription}
            </p>
          </div>

          {/* Hero Photo Section - Only show if configured */}
          {aboutImageUrl && (
            <div className="flex justify-center">
              <div className="relative w-full max-w-2xl">
                <OptimizedImage
                  src={aboutImageUrl}
                  alt={`${siteName} team`}
                  className="w-full h-auto rounded-xl shadow-lg object-cover"
                  priority={true}
                />
              </div>
            </div>
          )}

          {/* Feature boxes with muted backgrounds */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-gradient-from to-gradient-to border border-gray-200 rounded-lg p-4 text-center">
              <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Home className="h-5 w-5 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 text-sm mb-2">Local Expertise</h4>
              <p className="text-xs text-gray-600">Deep knowledge of our area with insight into every hidden gem</p>
            </div>
            
            <div className="bg-muted border border-gray-200 rounded-lg p-4 text-center">
              <div className="w-10 h-10 bg-gray-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Award className="h-5 w-5 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 text-sm mb-2">Quality Focus</h4>
              <p className="text-xs text-gray-600">Every property carefully curated and maintained</p>
            </div>
            
            <div className="bg-accent border border-gray-200 rounded-lg p-4 text-center">
              <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 text-sm mb-2">Passionate Hosts</h4>
              <p className="text-xs text-gray-600">Genuine love for hospitality and exceptional service</p>
            </div>
            
            <div className="bg-gradient-to-br from-gradient-accent-from to-gradient-accent-to border border-gray-200 rounded-lg p-4 text-center">
              <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Star className="h-5 w-5 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 text-sm mb-2">Family Values</h4>
              <p className="text-xs text-gray-600">Family-owned business creating memorable experiences</p>
            </div>
          </div>

          {/* Quote section - Only show if founder names configured */}
          {founderNames && (
            <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-gray-400">
              <blockquote className="text-lg text-gray-700 italic mb-4">
                "We believe in creating spaces where families can come together, where memories are made, 
                and where the beauty of your destination becomes part of your story."
              </blockquote>
              <p className="font-semibold text-gray-900">— {founderNames}</p>
            </div>
          )}

          {/* Bottom tagline and tags */}
          <div className="text-center">
            <p className="text-gray-600 mb-4">Your local ambassadors to exceptional vacation experiences</p>
            <div className="flex flex-wrap justify-center gap-2">
              <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">Local</span>
              <span className="bg-gray-150 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">Trusted</span>
              <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">Quality</span>
              <span className="bg-gray-150 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">Family</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutIntroduction;
