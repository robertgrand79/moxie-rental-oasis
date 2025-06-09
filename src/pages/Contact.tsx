
import React from 'react';
import ContactHero from '@/components/contact/ContactHero';
import ContactForm from '@/components/contact/ContactForm';
import ContactInfo from '@/components/contact/ContactInfo';

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
      </div>
    </div>
  );
};

export default Contact;
