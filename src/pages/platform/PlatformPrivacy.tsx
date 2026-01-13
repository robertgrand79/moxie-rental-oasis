/**
 * Platform Privacy Policy Page
 * 
 * Privacy policy for StayMoxie.com platform
 */

import React from 'react';
import { Shield, Lock, Eye, Database, Mail, Globe } from 'lucide-react';

const PlatformPrivacy: React.FC = () => {
  const lastUpdated = 'January 13, 2026';

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gray-900 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600/20 rounded-full mb-4">
            <Shield className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-blue-300">Legal</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white font-fraunces mb-4">
            Privacy Policy
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
                At StayMoxie ("we," "our," or "us"), we are committed to protecting your privacy. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your 
                information when you use our vacation rental management platform and related services.
              </p>
            </div>

            {/* Section 1 */}
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Database className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 font-fraunces m-0">
                  1. Information We Collect
                </h2>
              </div>
              <div className="pl-13 space-y-4 text-gray-600">
                <h3 className="text-lg font-semibold text-gray-800">Personal Information</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Name, email address, and phone number</li>
                  <li>Billing information and payment details</li>
                  <li>Property and business information you provide</li>
                  <li>Account credentials and preferences</li>
                </ul>
                
                <h3 className="text-lg font-semibold text-gray-800 mt-6">Automatically Collected Information</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Device information (browser type, operating system)</li>
                  <li>IP address and location data</li>
                  <li>Usage data and interaction with our services</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>
              </div>
            </div>

            {/* Section 2 */}
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Eye className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 font-fraunces m-0">
                  2. How We Use Your Information
                </h2>
              </div>
              <div className="pl-13 space-y-4 text-gray-600">
                <p>We use the information we collect to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide, maintain, and improve our services</li>
                  <li>Process transactions and send related information</li>
                  <li>Send promotional communications (with your consent)</li>
                  <li>Respond to your comments, questions, and requests</li>
                  <li>Monitor and analyze trends, usage, and activities</li>
                  <li>Detect, investigate, and prevent fraudulent transactions</li>
                  <li>Personalize and improve your experience</li>
                </ul>
              </div>
            </div>

            {/* Section 3 */}
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Globe className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 font-fraunces m-0">
                  3. Information Sharing and Disclosure
                </h2>
              </div>
              <div className="pl-13 space-y-4 text-gray-600">
                <p>We may share your information in the following situations:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Service Providers:</strong> Third-party vendors who perform services on our behalf</li>
                  <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                  <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                  <li><strong>With Your Consent:</strong> When you have given us permission to share</li>
                </ul>
                <p className="mt-4">
                  We do not sell your personal information to third parties.
                </p>
              </div>
            </div>

            {/* Section 4 */}
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Lock className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 font-fraunces m-0">
                  4. Data Security
                </h2>
              </div>
              <div className="pl-13 space-y-4 text-gray-600">
                <p>
                  We implement appropriate technical and organizational security measures to protect 
                  your personal information, including:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Encryption of data in transit and at rest</li>
                  <li>Regular security assessments and audits</li>
                  <li>Access controls and authentication measures</li>
                  <li>Employee training on data protection</li>
                </ul>
              </div>
            </div>

            {/* Section 5 */}
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Shield className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 font-fraunces m-0">
                  5. Your Privacy Rights
                </h2>
              </div>
              <div className="pl-13 space-y-4 text-gray-600">
                <p>Depending on your location, you may have the right to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Access and receive a copy of your personal data</li>
                  <li>Rectify or update inaccurate information</li>
                  <li>Request deletion of your personal data</li>
                  <li>Object to or restrict processing of your data</li>
                  <li>Data portability</li>
                  <li>Withdraw consent at any time</li>
                </ul>
              </div>
            </div>

            {/* Section 6 */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 font-fraunces mb-4">
                6. Cookies and Tracking
              </h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  We use cookies and similar tracking technologies to collect and track information 
                  about your activity on our platform. You can control cookies through your browser 
                  settings and other tools.
                </p>
              </div>
            </div>

            {/* Section 7 */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 font-fraunces mb-4">
                7. Children's Privacy
              </h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  Our services are not intended for individuals under the age of 18. We do not 
                  knowingly collect personal information from children.
                </p>
              </div>
            </div>

            {/* Section 8 */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 font-fraunces mb-4">
                8. Changes to This Policy
              </h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  We may update this Privacy Policy from time to time. We will notify you of any 
                  changes by posting the new Privacy Policy on this page and updating the "Last 
                  updated" date.
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
                If you have any questions about this Privacy Policy, please contact us:
              </p>
              <ul className="text-gray-600 space-y-2">
                <li><strong>Email:</strong> privacy@staymoxie.com</li>
                <li><strong>Website:</strong> staymoxie.com/contact</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PlatformPrivacy;
