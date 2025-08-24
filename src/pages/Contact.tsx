
import React from 'react';
import ContactHero from '@/components/contact/ContactHero';
import ContactForm from '@/components/contact/ContactForm';
import ContactInfo from '@/components/contact/ContactInfo';

const Contact = () => {
  return (
    <div className="min-h-screen">
      <ContactHero />
      <div className="container mx-auto px-4 py-16">
        <div className="space-y-12">
          <ContactInfo />
          <ContactForm />
        </div>
      </div>
    </div>
  );
};

export default Contact;
