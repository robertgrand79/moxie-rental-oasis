import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: 'How does StayMoxie sync with Airbnb and VRBO?',
    answer: 'StayMoxie connects to your Airbnb and VRBO accounts via their official APIs and iCal feeds. Once connected, your calendars sync automatically every 15 minutes, ensuring your availability is always accurate across all platforms. You can also trigger manual syncs anytime.',
  },
  {
    question: 'Do I need to leave Airbnb to use StayMoxie?',
    answer: 'Not at all! StayMoxie works alongside your existing OTA listings. Keep your Airbnb and VRBO presence while also building your direct booking channel. Many hosts find that direct bookings grow over time as guests discover their branded website.',
  },
  {
    question: 'How does the direct booking website help me get bookings?',
    answer: 'Your StayMoxie website is SEO-optimized and designed to convert visitors into guests. By adding local content like area guides, events, and blog posts, you attract travelers searching for your destination. Returning guests can book directly, saving you OTA fees.',
  },
  {
    question: 'What can Moxie AI actually do?',
    answer: 'Moxie AI answers guest questions 24/7 based on your property information, house rules, and local recommendations. It handles common inquiries about check-in procedures, WiFi passwords, local restaurants, and more. For complex requests, it escalates to you with full context.',
  },
  {
    question: 'How do I create local content for my area?',
    answer: 'StayMoxie includes a content management system where you can create blog posts, add local events, and build area guides. You can also import events from local calendars and let AI help you write engaging content about your destination.',
  },
  {
    question: 'Do I need technical skills to use StayMoxie?',
    answer: 'No technical skills required! StayMoxie is designed for hosts, not developers. The visual website builder lets you customize your site with drag-and-drop, and our setup wizard guides you through connecting your accounts step by step.',
  },
];

const FAQSection: React.FC = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-12">
          <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">
            FAQ
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-gray-900 font-fraunces">
            Common questions
          </h2>
        </div>

        {/* Accordion */}
        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="bg-white rounded-xl border border-gray-200 px-6 overflow-hidden"
            >
              <AccordionTrigger className="text-left font-semibold text-gray-900 hover:no-underline py-5">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 pb-5 leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQSection;
