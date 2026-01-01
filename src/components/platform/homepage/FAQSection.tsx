import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: 'Do I need to write all the content myself?',
    answer: "No! Moxie AI helps you create content quickly. It can draft blog posts about local attractions, suggest topics based on what travelers search for, and help write newsletter content. You just review and personalize—the heavy lifting is done for you.",
  },
  {
    question: 'How does the blog help me get bookings?',
    answer: "When travelers search 'things to do in [your area]' or 'best restaurants near [destination]', a content-rich site can appear in results. This captures guests during the trip-planning phase—before they've booked anywhere. It's free, organic traffic that OTAs can't take from you.",
  },
  {
    question: 'What if I don\'t know local events to feature?',
    answer: "StayMoxie can pull events from local calendars and sources automatically. You can also manually add events you discover. Over time, your events calendar becomes a valuable resource that travelers bookmark and share.",
  },
  {
    question: 'How does StayMoxie integrate with Airbnb and VRBO?',
    answer: 'StayMoxie fully integrates with Airbnb and VRBO via their official APIs and iCal feeds. Your calendars sync automatically, keeping availability accurate across all platforms. The content tools work alongside your OTA presence—they bring new guests, your content brings them back direct.',
  },
  {
    question: 'Do I need to leave Airbnb to use StayMoxie?',
    answer: "Absolutely not! StayMoxie works WITH your OTA listings. Keep your Airbnb and VRBO presence—they're great for discovery. StayMoxie helps you build the local content hub that turns one-time OTA guests into repeat direct bookers.",
  },
  {
    question: 'Do I need technical skills to use StayMoxie?',
    answer: 'No technical skills required! The content tools are designed for hosts, not developers. Add blog posts, events, and places with simple forms. The newsletter builder uses templates. Our setup wizard guides you through everything step by step.',
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
