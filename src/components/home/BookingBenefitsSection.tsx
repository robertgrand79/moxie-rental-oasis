
import React from 'react';
import { Calendar, Users, MessageCircle, CreditCard } from 'lucide-react';

const BookingBenefitsSection = () => {
  const bookingBenefits = [
    {
      icon: Calendar,
      title: "Best Eugene Rates",
      description: "Booking directly with us means you get the best rates for authentic Eugene vacation rentals."
    },
    {
      icon: Users,
      title: "Local Loyalty Program",
      description: "Return guest discounts for exploring more of Eugene and the Pacific Northwest."
    },
    {
      icon: MessageCircle,
      title: "Eugene Local Support",
      description: "Direct communication with local Eugene hosts who know the city inside and out."
    },
    {
      icon: CreditCard,
      title: "No Booking Fees",
      description: "More savings to spend on Eugene's farmers markets, local dining, and Oregon adventures."
    }
  ];

  return (
    <div className="py-24 relative">
      <div className="container mx-auto px-4">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-16 mx-auto border border-white/20">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Direct Booking Benefits in Eugene
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-gradient-from to-gradient-accent-from mx-auto mb-8"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Book directly for the best Eugene experience and exclusive local advantages
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {bookingBenefits.map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <div key={index} className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl p-8 text-center border border-gray-100 transition-all duration-300 hover:-translate-y-2">
                  <div className="absolute inset-0 bg-gradient-to-br from-gradient-accent-to to-gradient-to rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-gradient-from to-gradient-accent-from rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingBenefitsSection;
