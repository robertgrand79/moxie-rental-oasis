import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';

const sampleConversations = [
  {
    question: "What's the WiFi password?",
    answer: "The WiFi network is 'CoastalRetreat' and the password is 'beachvibes2024'. You'll find it printed on the welcome card on the kitchen counter too! 🏖️",
  },
  {
    question: "Best coffee shop nearby?",
    answer: "Blue Bottle is just a 3-minute walk—turn right on Ocean Ave. They open at 6:30 AM. For a local favorite, try Coastal Roasters on Pine Street (5 min). Both have great espresso! ☕",
  },
  {
    question: "Help me write a blog post about local beaches",
    answer: "I'd love to help! Here's a draft: '5 Hidden Beaches Near [Your Property]' — Start with Sunset Cove (quietest at sunrise), then cover Shell Beach for families, Surfer's Point for waves... Want me to expand on any section?",
  },
];

const MoxieAISection: React.FC = () => {
  const [activeConversation, setActiveConversation] = useState(0);
  const [showTyping, setShowTyping] = useState(false);

  const handleQuestionClick = (index: number) => {
    setShowTyping(true);
    setActiveConversation(index);
    setTimeout(() => setShowTyping(false), 800);
  };

  return (
    <section id="ai" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">AI-Powered</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6 font-fraunces">
              Meet Moxie AI
              <br />
              <span className="text-blue-600">Concierge + Content Creator</span>
            </h2>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Moxie does double duty: answers guest questions 24/7 AND helps you create 
              local content. Blog posts, newsletter drafts, event descriptions—powered 
              by your property knowledge and local expertise.
            </p>

            <ul className="space-y-4">
              {[
                'Answers guest questions in seconds',
                'Drafts blog posts about local attractions',
                'Helps write newsletter content',
                'Suggests local events to feature',
                'Available in 50+ languages',
              ].map((feature, idx) => (
                <li key={idx} className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right - Chat demo */}
          <div className="bg-gray-900 rounded-3xl p-6 shadow-2xl">
            {/* Chat header */}
            <div className="flex items-center gap-3 pb-4 border-b border-gray-700">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-white font-semibold">Moxie AI</div>
                <div className="text-xs text-green-400 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  Online now
                </div>
              </div>
            </div>

            {/* Chat messages */}
            <div className="py-6 min-h-[200px]">
              {/* Guest question */}
              <div className="flex justify-end mb-4">
                <div className="bg-blue-600 text-white px-4 py-3 rounded-2xl rounded-br-md max-w-[80%]">
                  {sampleConversations[activeConversation].question}
                </div>
              </div>

              {/* AI response */}
              <div className="flex justify-start">
                <div className="bg-gray-800 text-gray-100 px-4 py-3 rounded-2xl rounded-bl-md max-w-[80%]">
                  {showTyping ? (
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  ) : (
                    sampleConversations[activeConversation].answer
                  )}
                </div>
              </div>
            </div>

            {/* Quick questions */}
            <div className="pt-4 border-t border-gray-700">
              <p className="text-xs text-gray-400 mb-3">Try asking:</p>
              <div className="flex flex-wrap gap-2">
                {sampleConversations.map((conv, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuestionClick(idx)}
                    className={`px-3 py-1.5 text-sm rounded-full transition-all ${
                      activeConversation === idx
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {conv.question}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MoxieAISection;
