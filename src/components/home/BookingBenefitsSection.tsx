
import React from 'react';
import { Calendar, Users, MessageCircle, CreditCard } from 'lucide-react';

const BookingBenefitsSection = () => {
  const benefits = [
    {
      icon: Calendar,
      title: "Best Eugene Rates",
      description: "Direct booking means better rates and more savings for your Eugene adventure.",
      color: "text-icon-blue"
    },
    {
      icon: Users,
      title: "Local Loyalty Program",
      description: "Return guest discounts for exploring more of Eugene and the Pacific Northwest.",
      color: "text-icon-purple"
    },
    {
      icon: MessageCircle,
      title: "Eugene Local Support",
      description: "Direct communication with local hosts who know the city inside and out.",
      color: "text-icon-green"
    },
    {
      icon: CreditCard,
      title: "No Booking Fees",
      description: "More savings to spend on Eugene's farmers markets and local dining.",
      color: "text-icon-emerald"
    }
  ];

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="bg-card rounded-2xl shadow-lg p-8 border">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Direct Booking Benefits
            </h2>
            <div className="w-16 h-1 bg-gradient-to-r from-gradient-from to-gradient-accent-from mx-auto mb-6 rounded-full"></div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
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
                    <IconComponent className={`h-8 w-8 text-white group-hover:${benefit.color} transition-colors duration-300`} />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-4">
                    {benefit.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
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
