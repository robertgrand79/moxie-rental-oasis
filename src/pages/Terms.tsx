
import React from 'react';

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-8">Terms of Service</h1>
          
          <div className="prose max-w-none prose-headings:text-foreground prose-p:text-muted-foreground space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
              <p>
                These Terms govern your reservation and stay with Moxie Vacation Rentals ("we") at the booked property. By booking, you agree to all below.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Booking & Payment</h2>
              <ul className="space-y-2 list-disc list-inside">
                <li>Rates: Quoted in USD, include taxes and standard fees</li>
                <li>Deposit: 25% of total due at booking to secure dates</li>
                <li>Balance: Remaining 75% due 30 days before check-in; unpaid reservations cancel automatically</li>
                <li>Security Deposit: $300 refundable held on card 7 days before arrival</li>
                <li>Cleaning Fee: $125 per stay, charged at booking</li>
                <li>Payment Methods: Major credit/debit cards, PayPal, ACH</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Cancellation & Refunds</h2>
              <ul className="space-y-2 list-disc list-inside">
                <li>Full Refund: Cancel ≥ 60 days before check-in</li>
                <li>50% Refund: Cancel 59–30 days before check-in (deposit applies)</li>
                <li>No Refund: Cancel &lt; 30 days before check-in or no-show; full charges apply</li>
                <li>Modification Fee: $50 per date-change request</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Check-In & Check-Out</h2>
              <ul className="space-y-2 list-disc list-inside">
                <li>Check-In: After 4 PM local; access code sent 48 hours prior</li>
                <li>Check-Out: By 11 AM; late check-out $25/hour up to 2 hours (subject to availability)</li>
                <li>Self-Check-In: Do not share codes; $25 replacement fee per lost code</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Guest Obligations</h2>
              <ul className="space-y-2 list-disc list-inside">
                <li>Occupancy: Max 6 guests; unregistered extra guests incur $25/person/night</li>
                <li>House Rules: No smoking, no parties/events; quiet hours 10 PM–8 AM</li>
                <li>Cleanliness: Leave property tidy; excess cleaning or rule violations = $100 fee</li>
                <li>Damages: Report immediately; repair/replacement costs beyond security deposit billed to guest</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Pets</h2>
              <ul className="space-y-2 list-disc list-inside">
                <li>Allowed: 1 dog ≤ 50 lbs with advance approval</li>
                <li>Fee: $75 per stay</li>
                <li>Service animals exempt with documentation</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Liability & Insurance</h2>
              <p>
                Guests assume all risks of injury or loss. Trip cancellation and property-damage insurance strongly recommended.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Privacy & Data</h2>
              <p>
                We collect your name, contact, payment details for booking and legal compliance. Data shared only with service providers as needed.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Governing Law</h2>
              <p>Oregon law applies. Disputes resolved in Lane County courts.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Amendments</h2>
              <p>We may update these Terms for future bookings. Material changes notified via email.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">11. Contact</h2>
              <div>
                <p><strong>Moxie Vacation Rentals</strong></p>
                <p>2472 Willamette St, Eugene, OR 97405</p>
                <p>Phone: 541-214-2163</p>
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
    </div>
  );
};

export default Terms;
