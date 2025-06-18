
import React from 'react';

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-8">Terms of Service</h1>
          
          <div className="prose max-w-none prose-headings:text-foreground prose-p:text-muted-foreground">
            <p className="text-lg mb-6">
              Welcome to Moxie Vacation Rentals. These terms and conditions outline the rules and regulations 
              for the use of our services.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">Acceptance of Terms</h2>
            <p>
              By accessing and using this website, you accept and agree to be bound by the terms and provision 
              of this agreement.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">Booking and Reservations</h2>
            <p>
              All bookings are subject to availability and confirmation. We reserve the right to refuse service 
              to anyone for any reason at any time.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">Cancellation Policy</h2>
            <p>
              Cancellation policies vary by property and booking type. Please review the specific cancellation 
              policy for your reservation before booking.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">Guest Responsibilities</h2>
            <p>
              Guests are responsible for maintaining the property in good condition and following all house rules 
              provided at the time of booking.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">Contact Information</h2>
            <p>
              For questions about these Terms of Service, please contact us at legal@moxievacationrentals.com.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
