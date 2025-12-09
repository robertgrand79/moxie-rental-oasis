
import React from 'react';
import PropertyList from '@/components/PropertyList';
import { useProperties } from '@/hooks/useProperties';
import LoadingState from '@/components/ui/loading-state';
import BackgroundWrapper from '@/components/home/BackgroundWrapper';
import { useTenantSettings } from '@/hooks/useTenantSettings';

const Properties = () => {
  const { properties, loading } = useProperties();
  const { settings } = useTenantSettings();

  // Dynamic location text from tenant settings
  const locationText = settings.heroLocationText || settings.location || 'our area';

  if (loading) {
    return (
      <BackgroundWrapper>
        <div className="container mx-auto px-4 py-16">
          <LoadingState variant="page" message="Loading properties..." />
        </div>
      </BackgroundWrapper>
    );
  }

  return (
    <BackgroundWrapper>
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-16">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-16 mx-auto border border-white/20">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Our Properties
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Discover our carefully curated collection of vacation rental properties in {locationText}.
              </p>
            </div>

            {properties.length > 0 ? (
              <PropertyList
                properties={properties}
                showActions={false}
              />
            ) : (
              <div className="text-center py-16">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  No Properties Available
                </h3>
                <p className="text-gray-600 mb-8">
                  We're currently updating our property listings. Please check back soon!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </BackgroundWrapper>
  );
};

export default Properties;
