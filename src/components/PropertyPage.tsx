
import React from 'react';
import { useParams } from 'react-router-dom';
import BackgroundWrapper from '@/components/home/BackgroundWrapper';
import { propertyData } from '@/data/propertyData';
import PropertyHeader from './property/PropertyHeader';
import PropertyDetails from './property/PropertyDetails';
import BookingCard from './property/BookingCard';

const PropertyPage = () => {
  const { propertyId } = useParams<{ propertyId: string }>();
  const property = propertyId ? propertyData[propertyId] : null;

  if (!property) {
    return (
      <BackgroundWrapper>
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Property Not Found</h1>
            <p className="text-xl text-gray-600">The property you're looking for doesn't exist.</p>
          </div>
        </div>
      </BackgroundWrapper>
    );
  }

  return (
    <BackgroundWrapper>
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20">
          {/* Property Image */}
          <div className="aspect-video lg:aspect-[2/1] relative">
            <img 
              src={property.imageUrl} 
              alt={property.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="p-8 lg:p-12">
            <PropertyHeader property={property} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <PropertyDetails property={property} />
              <BookingCard property={property} />
            </div>
          </div>
        </div>
      </div>
    </BackgroundWrapper>
  );
};

export default PropertyPage;
