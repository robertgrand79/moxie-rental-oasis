
import React from 'react';
import Footer from '@/components/Footer';
import NavBar from '@/components/NavBar';
import { useTenantSettings } from '@/hooks/useTenantSettings';

const TermsOfService = () => {
  const { settings } = useTenantSettings();
  // Handle both camelCase and snake_case key conventions
  const siteName = settings.siteName || settings.site_name || 'Our Company';
  const contactEmail = settings.contactEmail || settings.contact_email || '';
  const contactPhone = settings.phone || settings.contact_phone || '';
  const address = settings.address || '';

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-foreground mb-8">Terms of Service</h1>
            
            <div className="prose prose-lg max-w-none text-foreground space-y-8">
              <section>
                <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
                <p>
                  These Terms govern your reservation and stay with {siteName} ("we") at the booked property. By booking, you agree to all below.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">2. Booking & Payment</h2>
                <ul className="space-y-2 list-disc list-inside">
                  <li><strong>Rates:</strong> Quoted in USD, include taxes and standard fees.</li>
                  <li><strong>Deposit:</strong> 25% of total due at booking to secure dates.</li>
                  <li><strong>Balance:</strong> Remaining 75% due 30 days before check-in; unpaid reservations cancel automatically.</li>
                  <li><strong>Security Deposit:</strong> $300 refundable held on card 7 days before arrival.</li>
                  <li><strong>Cleaning Fee:</strong> Charged per stay at booking.</li>
                  <li><strong>Payment Methods:</strong> Major credit/debit cards, PayPal, ACH.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">3. Cancellation & Refunds</h2>
                <ul className="space-y-2 list-disc list-inside">
                  <li><strong>Full Refund:</strong> Cancel ≥ 60 days before check-in.</li>
                  <li><strong>50% Refund:</strong> Cancel 59–30 days before check-in (deposit applies).</li>
                  <li><strong>No Refund:</strong> Cancel &lt; 30 days before check-in or no-show; full charges apply.</li>
                  <li><strong>Modification Fee:</strong> $50 per date-change request.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">4. Check-In & Check-Out</h2>
                <ul className="space-y-2 list-disc list-inside">
                  <li><strong>Check-In:</strong> After 4 PM local; access code sent 48 hours prior.</li>
                  <li><strong>Check-Out:</strong> By 11 AM; late check-out $25/hour up to 2 hours (subject to availability).</li>
                  <li><strong>Self-Check-In:</strong> Do not share codes; loss of code = $25 replacement fee.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">5. Guest Obligations</h2>
                <ul className="space-y-2 list-disc list-inside">
                  <li><strong>Occupancy:</strong> Max guests per property. Unregistered additional guests incur $25/person/night.</li>
                  <li><strong>House Rules:</strong> No smoking, no parties/events. Quiet hours 10 PM–8 AM.</li>
                  <li><strong>Cleanliness:</strong> Leave property tidy. Excess cleaning or violation of rules = $100 fee.</li>
                  <li><strong>Damages:</strong> Report immediately. Repair/replacement costs beyond security deposit billed to guest.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">6. Pets</h2>
                <ul className="space-y-2 list-disc list-inside">
                  <li><strong>Policy:</strong> Pet policies vary by property. Check listing for details.</li>
                  <li><strong>Fee:</strong> Pet fees may apply per stay.</li>
                  <li><strong>Exempt:</strong> Service animals with proper documentation.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">7. Liability & Insurance</h2>
                <ul className="space-y-2 list-disc list-inside">
                  <li>Guests assume all risks of injury or loss.</li>
                  <li>Trip cancellation and property-damage insurance strongly recommended.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">8. Privacy & Data</h2>
                <ul className="space-y-2 list-disc list-inside">
                  <li>We collect your name, contact, payment details for booking and legal compliance.</li>
                  <li>Data shared only with service providers (cleaning, maintenance) as needed.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">9. Governing Law</h2>
                <p>Local law applies. Disputes handled in local courts.</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">10. Amendments</h2>
                <p>We may update these Terms for future bookings. Material changes notified via email.</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">11. Contact</h2>
                <div>
                  <p><strong>{siteName}</strong></p>
                  {address && <p>{address}</p>}
                  {contactPhone && <p>Phone: {contactPhone}</p>}
                  {contactEmail && <p>Email: {contactEmail}</p>}
                </div>
              </section>

              <div className="mt-12 pt-8 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Last updated: {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default TermsOfService;
