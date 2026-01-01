import React from 'react';
import { Layers, Eye, MessageCircle } from 'lucide-react';

const problems = [
  {
    icon: Layers,
    title: 'Scattered Tools',
    description: 'Jumping between platforms for bookings, messaging, and pricing wastes hours every week.',
  },
  {
    icon: Eye,
    title: 'Invisible Brand',
    description: 'Your properties get lost in OTA search results. Guests remember Airbnb, not you.',
  },
  {
    icon: MessageCircle,
    title: '24/7 Questions',
    description: 'Late-night check-in questions, WiFi passwords, local tips—the messages never stop.',
  },
];

const ProblemSection: React.FC = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">
            The Problem
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 font-fraunces">
            Running rentals shouldn't feel like
            <br />
            <span className="text-blue-600">running in circles</span>
          </h2>
        </div>

        {/* Problem cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {problems.map((problem, index) => (
            <div
              key={index}
              className="group p-8 bg-gray-50 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300"
            >
              <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-red-200 transition-colors">
                <problem.icon className="w-7 h-7 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 font-fraunces">
                {problem.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {problem.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
