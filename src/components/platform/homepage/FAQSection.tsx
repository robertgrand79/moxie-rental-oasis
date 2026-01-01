import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: 'How long does it take to get set up?',
    answer: 'Most hosts are fully set up within 24-48 hours. Our onboarding wizard guides you through connecting your channels, importing properties, and customizing your direct booking website. Complex migrations from other PMS platforms may take a bit longer—we offer white-glove migration assistance for Professional and Portfolio plans.',
  },
  {
    question: 'Will this create double bookings?',
    answer: 'No! StayMoxie uses real-time two-way sync with all major OTAs. When you receive a booking on any platform, all other calendars are instantly blocked. Our sync runs every 5 minutes as a backup, but instant webhooks handle the majority of updates.',
  },
  {
    question: 'Can I try before I commit?',
    answer: 'Absolutely! All plans include a 14-day free trial with full access to features. No credit card required to start. You can import your properties, test the AI assistant, and even accept live bookings during your trial.',
  },
  {
    question: 'How does Moxie AI learn about my properties?',
    answer: 'Moxie automatically ingests your property descriptions, house rules, local recommendations, and FAQ answers. You can also add custom knowledge through our simple interface. The AI gets smarter over time as it learns from guest interactions.',
  },
  {
    question: "What if a guest asks something Moxie can't answer?",
    answer: "Moxie is trained to recognize its limitations. When it encounters a question it can't confidently answer, it collects the guest's contact info and escalates to you immediately via email, SMS, or push notification. You can respond directly, and that answer can be added to Moxie's knowledge base.",
  },
  {
    question: 'Do you charge per booking or per guest?',
    answer: "Never! We believe in simple, predictable pricing. You pay one flat monthly or annual rate based on your property count. No hidden fees, no per-booking charges, no percentage of revenue. The more bookings you get, the more you save.",
  },
  {
    question: 'Can I keep my existing PMS and just use certain features?',
    answer: 'While StayMoxie works best as your primary PMS, we understand transitions take time. Many hosts start by using our direct booking website and AI assistant alongside their existing tools, then gradually migrate as they see the benefits.',
  },
];

const FAQSection: React.FC = () => {
  return (
    <section className="py-20 bg-gray-50" id="faq">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-12">
          <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">
            FAQ
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 font-fraunces">
            Questions? We've got answers
          </h2>
        </div>

        {/* FAQ Accordion */}
        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`faq-${index}`}
              className="bg-white rounded-2xl border border-gray-200 px-6 overflow-hidden"
            >
              <AccordionTrigger className="text-left text-lg font-semibold text-gray-900 hover:text-blue-600 py-6 [&[data-state=open]]:text-blue-600">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 pb-6 leading-relaxed">
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
