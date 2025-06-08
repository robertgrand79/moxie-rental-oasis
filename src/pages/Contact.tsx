
import React from 'react';
import ContactHero from '@/components/contact/ContactHero';
import ContactForm from '@/components/contact/ContactForm';
import ContactInfo from '@/components/contact/ContactInfo';
import PropertyMap from '@/components/PropertyMap';

const Contact = () => {
  return (
    <div className="min-h-screen bg-background">
      <ContactHero />
      
      <div className="container mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <ContactForm />
          </div>
          
          {/* Contact Information */}
          <div>
            <ContactInfo />
          </div>
        </div>
        
        {/* Map Section */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-foreground mb-6 text-center">
            Find Us
          </h3>
          <PropertyMap properties={[]} />
        </div>
      </div>
    </div>
  );
};

export default Contact;
