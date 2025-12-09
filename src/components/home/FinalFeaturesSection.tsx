
import React from 'react';
import { Coffee, Star, TreePine } from 'lucide-react';
import { useTenantSettings } from '@/hooks/useTenantSettings';

const FinalFeaturesSection = () => {
  const { settings } = useTenantSettings();

  const sectionTitle = settings.finalFeatureSectionTitle || 'Why Choose Us';

  const features = [
    {
      icon: Coffee,
      title: settings.finalFeature1Title || "Local Culture",
      description: settings.finalFeature1Description || "Experience the unique local culture and community atmosphere during your stay.",
      color: "text-icon-amber"
    },
    {
      icon: Star,
      title: settings.finalFeature2Title || "Expert Hosts",
      description: settings.finalFeature2Description || "Our local team provides insider knowledge and curated guides to help you explore.",
      color: "text-icon-purple"
    },
    {
      icon: TreePine,
      title: settings.finalFeature3Title || "Prime Location",
      description: settings.finalFeature3Description || "Perfect location for exploring the surrounding area and local attractions.",
      color: "text-icon-green"
    }
  ];

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="bg-card rounded-2xl shadow-lg p-8 border">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              {sectionTitle}
            </h2>
            <div className="w-16 h-1 bg-gradient-to-r from-gradient-from to-gradient-accent-from mx-auto mb-6 rounded-full"></div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="group text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-gradient-from to-gradient-accent-from rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <IconComponent className={`h-8 w-8 ${feature.color} transition-colors duration-300`} />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalFeaturesSection;
