/**
 * Platform Terms of Service Page
 * 
 * Terms of service for StayMoxie.com platform
 */

import React from 'react';
import { FileText, Scale, AlertTriangle, CreditCard, UserCheck, Shield, Mail } from 'lucide-react';

const PlatformTerms: React.FC = () => {
  const lastUpdated = 'January 13, 2026';

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gray-900 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600/20 rounded-full mb-4">
            <FileText className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-blue-300">Legal</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white font-fraunces mb-4">
            Terms of Service
          </h1>
          <p className="text-xl text-gray-400">
            Last updated: {lastUpdated}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            {/* Introduction */}
            <div className="mb-12">
              <p className="text-gray-600 text-lg leading-relaxed">
                Welcome to StayMoxie. These Terms of Service ("Terms") govern your access to and use 
                of StayMoxie's vacation rental management platform, website, and services (collectively, 
                the "Services"). By accessing or using our Services, you agree to be bound by these Terms.
              </p>
            </div>

            {/* Section 1 */}
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <UserCheck className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 font-fraunces m-0">
                  1. Acceptance of Terms
                </h2>
              </div>
              <div className="pl-13 space-y-4 text-gray-600">
                <p>
                  By creating an account or using our Services, you confirm that you:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Are at least 18 years of age</li>
                  <li>Have the legal capacity to enter into binding agreements</li>
                  <li>Are not prohibited from using our Services under applicable law</li>
                  <li>Will comply with these Terms and all applicable laws and regulations</li>
                </ul>
              </div>
            </div>

            {/* Section 2 */}
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 font-fraunces m-0">
                  2. Description of Services
                </h2>
              </div>
              <div className="pl-13 space-y-4 text-gray-600">
                <p>
                  StayMoxie provides a software-as-a-service (SaaS) platform for vacation rental 
                  property managers, including:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Direct booking website creation and management</li>
                  <li>Property listing and availability management</li>
                  <li>Guest communication and AI assistant tools</li>
                  <li>Local area content and SEO optimization</li>
                  <li>Payment processing integration</li>
                  <li>Analytics and reporting tools</li>
                </ul>
              </div>
            </div>

            {/* Section 3 */}
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Shield className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 font-fraunces m-0">
                  3. Account Responsibilities
                </h2>
              </div>
              <div className="pl-13 space-y-4 text-gray-600">
                <p>You are responsible for:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Maintaining the confidentiality of your account credentials</li>
                  <li>All activities that occur under your account</li>
                  <li>Providing accurate and complete information</li>
                  <li>Promptly updating any changes to your information</li>
                  <li>Notifying us immediately of any unauthorized access</li>
                </ul>
              </div>
            </div>

            {/* Section 4 */}
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 font-fraunces m-0">
                  4. Fees and Payment
                </h2>
              </div>
              <div className="pl-13 space-y-4 text-gray-600">
                <ul className="list-disc pl-6 space-y-2">
                  <li>Subscription fees are billed monthly or annually as selected</li>
                  <li>All fees are non-refundable unless otherwise stated</li>
                  <li>We reserve the right to change pricing with 30 days notice</li>
                  <li>Failure to pay may result in suspension or termination of services</li>
                  <li>You are responsible for all applicable taxes</li>
                </ul>
              </div>
            </div>

            {/* Section 5 */}
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 font-fraunces m-0">
                  5. Prohibited Uses
                </h2>
              </div>
              <div className="pl-13 space-y-4 text-gray-600">
                <p>You agree not to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Use the Services for any unlawful purpose</li>
                  <li>Violate any intellectual property rights</li>
                  <li>Transmit malware, viruses, or harmful code</li>
                  <li>Attempt to gain unauthorized access to our systems</li>
                  <li>Interfere with or disrupt the Services</li>
                  <li>Scrape, copy, or harvest data from the Services</li>
                  <li>Impersonate any person or entity</li>
                  <li>Use the Services to send spam or unsolicited communications</li>
                </ul>
              </div>
            </div>

            {/* Section 6 */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 font-fraunces mb-4">
                6. Intellectual Property
              </h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  The Services, including all content, features, and functionality, are owned by 
                  StayMoxie and are protected by copyright, trademark, and other intellectual 
                  property laws. You retain ownership of content you create and upload to the platform.
                </p>
                <p>
                  By using our Services, you grant us a limited license to use, display, and 
                  distribute your content solely for the purpose of providing the Services.
                </p>
              </div>
            </div>

            {/* Section 7 */}
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Scale className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 font-fraunces m-0">
                  7. Limitation of Liability
                </h2>
              </div>
              <div className="pl-13 space-y-4 text-gray-600">
                <p>
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, STAYMOXIE SHALL NOT BE LIABLE FOR ANY 
                  INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING 
                  LOSS OF PROFITS, DATA, OR GOODWILL, ARISING FROM YOUR USE OF THE SERVICES.
                </p>
                <p>
                  Our total liability shall not exceed the amount you paid us in the twelve (12) 
                  months preceding the claim.
                </p>
              </div>
            </div>

            {/* Section 8 */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 font-fraunces mb-4">
                8. Disclaimer of Warranties
              </h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY 
                  KIND, EITHER EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE SERVICES WILL BE 
                  UNINTERRUPTED, ERROR-FREE, OR SECURE.
                </p>
              </div>
            </div>

            {/* Section 9 */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 font-fraunces mb-4">
                9. Indemnification
              </h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  You agree to indemnify, defend, and hold harmless StayMoxie and its officers, 
                  directors, employees, and agents from any claims, damages, losses, or expenses 
                  arising from your use of the Services or violation of these Terms.
                </p>
              </div>
            </div>

            {/* Section 10 */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 font-fraunces mb-4">
                10. Termination
              </h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  We may suspend or terminate your access to the Services at any time for any 
                  reason, including violation of these Terms. You may cancel your account at 
                  any time through your account settings.
                </p>
                <p>
                  Upon termination, your right to use the Services will immediately cease, and 
                  we may delete your data in accordance with our data retention policies.
                </p>
              </div>
            </div>

            {/* Section 11 */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 font-fraunces mb-4">
                11. Governing Law
              </h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  These Terms shall be governed by and construed in accordance with the laws of 
                  the State of Oregon, United States, without regard to its conflict of law provisions.
                </p>
              </div>
            </div>

            {/* Section 12 */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 font-fraunces mb-4">
                12. Changes to Terms
              </h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  We reserve the right to modify these Terms at any time. We will provide notice 
                  of material changes by posting the updated Terms on our website and updating the 
                  "Last updated" date. Your continued use of the Services after changes constitutes 
                  acceptance of the modified Terms.
                </p>
              </div>
            </div>

            {/* Contact */}
            <div className="bg-gray-50 rounded-2xl p-8 mt-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 font-fraunces m-0">
                  Contact Us
                </h2>
              </div>
              <p className="text-gray-600 mb-4">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <ul className="text-gray-600 space-y-2">
                <li><strong>Email:</strong> legal@staymoxie.com</li>
                <li><strong>Website:</strong> staymoxie.com/contact</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PlatformTerms;
