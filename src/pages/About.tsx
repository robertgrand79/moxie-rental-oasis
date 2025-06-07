
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Award, Users, Shield } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            About Moxie Vacation Rentals
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We're passionate about creating unforgettable vacation experiences through 
            carefully curated properties in the world's most desirable destinations.
          </p>
        </div>

        {/* Story Section */}
        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
            <div className="space-y-4 text-gray-600">
              <p>
                Founded with a vision to redefine vacation rentals, Moxie began as a small 
                collection of handpicked properties chosen for their unique character and 
                exceptional locations.
              </p>
              <p>
                Today, we've grown into a trusted platform that connects travelers with 
                extraordinary accommodations, from oceanfront villas to mountain retreats, 
                each selected for its ability to create lasting memories.
              </p>
              <p>
                Our commitment to quality, service, and authentic experiences sets us apart 
                in the vacation rental industry.
              </p>
            </div>
          </div>
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1721322800607-8c38375eef04?auto=format&fit=crop&w=600&q=80"
              alt="Beautiful vacation rental interior"
              className="rounded-lg shadow-lg w-full h-96 object-cover"
            />
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center">
              <CardContent className="p-6">
                <Heart className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Passion</h3>
                <p className="text-gray-600">
                  We're passionate about travel and creating experiences that exceed expectations.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-6">
                <Award className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Excellence</h3>
                <p className="text-gray-600">
                  Every property is carefully selected and maintained to the highest standards.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-6">
                <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Community</h3>
                <p className="text-gray-600">
                  We believe in building lasting relationships with our guests and partners.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-6">
                <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Trust</h3>
                <p className="text-gray-600">
                  Your safety, security, and satisfaction are our top priorities.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Team Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Meet Our Team</h2>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Our dedicated team of travel enthusiasts and hospitality experts work around 
            the clock to ensure your vacation is nothing short of perfect.
          </p>
          
          <div className="bg-white rounded-lg shadow-lg p-8">
            <p className="text-lg text-gray-700 italic mb-4">
              "At Moxie, we don't just offer accommodations – we curate experiences that 
              become cherished memories. Every guest is part of our extended family."
            </p>
            <p className="font-semibold text-gray-900">— The Moxie Team</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
