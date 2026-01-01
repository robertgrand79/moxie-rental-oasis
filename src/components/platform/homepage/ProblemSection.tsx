import React from 'react';
import { Ghost, Search, Mail, Calendar } from 'lucide-react';

const problems = [
  {
    icon: Ghost,
    title: 'Abandoned Sites',
    description: 'You built a direct booking site. Then what? Without fresh content, it sits invisible to Google and forgettable to guests.',
  },
  {
    icon: Search,
    title: 'No SEO Strategy',
    description: "Your direct site doesn't rank because there's no blog, no local content, no reason for Google to surface it in search results.",
  },
  {
    icon: Mail,
    title: 'Zero Retention',
    description: 'Guests book once and forget you. No newsletters, no updates, no relationship building to bring them back.',
  },
  {
    icon: Calendar,
    title: 'Missed Local Opportunity',
    description: "Travelers search 'things to do in [your area]' every day. Without a local hub, you're invisible to that traffic.",
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
            Direct booking sites fail
            <br />
            <span className="text-blue-600">because nobody does the work</span>
          </h2>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            Everyone can set up a booking page. But without ongoing content, it becomes a ghost town.
          </p>
        </div>

        {/* Problem cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {problems.map((problem, index) => (
            <div
              key={index}
              className="group p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300"
            >
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-5 group-hover:bg-red-200 transition-colors">
                <problem.icon className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 font-fraunces">
                {problem.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
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
