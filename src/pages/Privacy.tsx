
import React from 'react';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-8">Privacy Policy</h1>
          
          <div className="prose max-w-none prose-headings:text-foreground prose-p:text-muted-foreground">
            <p className="text-lg mb-6">
              At Moxie Vacation Rentals, we respect your privacy and are committed to protecting your personal information.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">Information We Collect</h2>
            <p>
              We collect information you provide directly to us, such as when you create an account, make a reservation, 
              or contact us for support.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">How We Use Your Information</h2>
            <p>
              We use the information we collect to provide, maintain, and improve our services, process transactions, 
              and communicate with you.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">Information Sharing</h2>
            <p>
              We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, 
              except as described in this policy.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">Data Security</h2>
            <p>
              We implement appropriate security measures to protect your personal information against unauthorized access, 
              alteration, disclosure, or destruction.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at privacy@moxievacationrentals.com.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
