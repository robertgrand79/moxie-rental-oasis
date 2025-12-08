
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';

const Privacy = () => {
  const { tenantId } = useTenant();

  const { data: settings } = useQuery({
    queryKey: ['privacy-page-settings', tenantId],
    queryFn: async () => {
      let query = supabase
        .from('site_settings')
        .select('key, value')
        .in('key', ['siteName', 'contactEmail', 'phone', 'address']);

      if (tenantId) {
        query = query.eq('organization_id', tenantId);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data?.reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {} as Record<string, any>) || {};
    },
    staleTime: 5 * 60 * 1000,
  });

  const siteName = settings?.siteName || 'Our Company';
  const contactEmail = settings?.contactEmail || '';
  const phone = settings?.phone || '';
  const siteUrl = window.location.origin;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-8">Privacy Policy</h1>
          
          <div className="prose max-w-none prose-headings:text-foreground prose-p:text-muted-foreground space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
              <p>
                {siteName} ("we," "us," "our") operates this website. 
                This Privacy Policy explains how we collect, use, share, and protect your personal information when you book or interact with our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
              <ul className="space-y-2 list-disc list-inside">
                <li><strong>Booking & Contact Data:</strong> Name, mailing address, email, phone number</li>
                <li><strong>Payment Data:</strong> Credit/debit card details, billing address</li>
                <li><strong>Technical Data:</strong> IP address, device type, browser, operating system</li>
                <li><strong>Usage Data:</strong> Pages visited, clicks, referral sources</li>
                <li><strong>Communications Data:</strong> Messages you send us, customer-service notes</li>
                <li><strong>Optional Data:</strong> Preferences you provide (accessibility needs, pet requests)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
              <ul className="space-y-2 list-disc list-inside">
                <li>Process and confirm reservations</li>
                <li>Collect payment and issue refunds</li>
                <li>Send booking details, self-check-in codes, updates, promotions</li>
                <li>Provide customer service and respond to inquiries</li>
                <li>Improve our website, services, and marketing</li>
                <li>Comply with legal obligations (tax reporting, safety regulations)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Sharing & Disclosure</h2>
              <ul className="space-y-2 list-disc list-inside">
                <li><strong>Service Providers:</strong> Cleaning crews, maintenance teams, payment processors</li>
                <li><strong>Legal Authorities:</strong> To comply with court orders or legal claims</li>
                <li><strong>Business Transfers:</strong> In a merger, sale, or reorganization</li>
                <li><strong>Aggregate Data:</strong> Non-identifying analytics for internal use</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Cookies & Tracking</h2>
              <p>
                We use cookies and similar tools to recognize devices, track sessions, and analyze traffic. You may disable cookies in your browser, but some features may not work.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Security & Retention</h2>
              <ul className="space-y-2 list-disc list-inside">
                <li>Access limited to authorized staff and contractors</li>
                <li>Safeguards include encryption, firewalls, secure servers</li>
                <li>Data retained only as long as necessary or as required by law</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Your Rights</h2>
              <p className="mb-4">You may:</p>
              <ul className="space-y-2 list-disc list-inside">
                <li>Access, correct, or delete your personal data</li>
                <li>Object to or restrict processing</li>
                <li>Request data portability</li>
                <li>Withdraw consent where applicable</li>
              </ul>
              {contactEmail && (
                <p className="mt-4">
                  To exercise these rights, contact us at{' '}
                  <a href={`mailto:${contactEmail}`} className="text-primary hover:underline">{contactEmail}</a>.
                </p>
              )}
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Third-Party Links</h2>
              <p>
                Our site may link to third-party sites. We are not responsible for their practices. Review their policies before sharing information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Children's Privacy</h2>
              <p>
                We do not knowingly collect data from children under 16. If we do, we'll delete it upon request.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy at any time. Material changes take effect on the "Effective Date" above; we'll notify you by email or via our website.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">11. Contact Us</h2>
              <div>
                <p><strong>{siteName}</strong></p>
                {contactEmail && (
                  <p>
                    <a href={`mailto:${contactEmail}`} className="text-primary hover:underline">{contactEmail}</a>
                    {phone && ` | ${phone}`}
                  </p>
                )}
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

export default Privacy;
