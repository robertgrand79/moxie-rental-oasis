
import React from 'react';
import { Calendar, Users, MessageCircle, CreditCard } from 'lucide-react';

const BookingBenefitsSection = () => {
  const benefits = [
    {
      icon: Calendar,
      title: "Best Eugene Rates",
      description: "Direct booking means better rates and more savings for your Eugene adventure."
    },
    {
      icon: Users,
      title: "Local Loyalty Program",
      description: "Return guest discounts for exploring more of Eugene and the Pacific Northwest."
    },
    {
      icon: MessageCircle,
      title: "Eugene Local Support",
      description: "Direct communication with local hosts who know the city inside and out."
    },
    {
      icon: CreditCard,
      title: "No Booking Fees",
      description: "More savings to spend on Eugene's farmers markets and local dining."
    }
  ];

  return (
    <section className="py-20 relative">
      <div className="container mx-auto px-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-12 mx-auto border border-white/30">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Direct Booking Benefits
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-gradient-from to-gradient-accent-from mx-auto mb-8 rounded-full"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Book directly for the best Eugene experience and exclusive local advantages
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <div key={index} className="group text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-gradient-from to-gradient-accent-from rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BookingBenefitsSection;
