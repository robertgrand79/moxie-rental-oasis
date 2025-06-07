
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Award, Users, Shield, CheckCircle, Zap, Star, HandHeart } from 'lucide-react';
import BackgroundWrapper from '@/components/home/BackgroundWrapper';

const About = () => {
  return (
    <BackgroundWrapper>
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            About Moxie Vacation Rentals
          </h1>
          <p className="text-xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
            We're passionate about creating unforgettable vacation experiences through 
            carefully curated properties in Eugene, Oregon and the Pacific Northwest.
          </p>
        </div>

        {/* Get To Know Our Family Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Get To Know Our Family</h2>
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-12 border border-white/20">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Photo Collage */}
              <div className="relative">
                <div className="grid grid-cols-2 gap-4 h-96">
                  {/* Top left - Temple photo */}
                  <div className="relative overflow-hidden rounded-xl shadow-lg">
                    <img 
                      src="/lovable-uploads/8d88b689-dbb7-492d-bce6-e3486c88b504.png"
                      alt="Robert and Shelly at a beautiful temple location"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  
                  {/* Top right - Oregon Ducks game */}
                  <div className="relative overflow-hidden rounded-xl shadow-lg">
                    <img 
                      src="/lovable-uploads/697e2c26-983b-4e24-b9fa-f6e1dea503e2.png"
                      alt="Robert and Shelly at Oregon Ducks game"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  
                  {/* Bottom left - Mountain lake adventure */}
                  <div className="relative overflow-hidden rounded-xl shadow-lg">
                    <img 
                      src="/lovable-uploads/ca979f86-d583-4e11-a233-176ed76d2d7b.png"
                      alt="Robert and Shelly at a beautiful mountain lake"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  
                  {/* Bottom right - Tropical vacation */}
                  <div className="relative overflow-hidden rounded-xl shadow-lg">
                    <img 
                      src="/lovable-uploads/e7ccb595-827a-4d3f-bd2e-6177ed527894.png"
                      alt="Robert and Shelly enjoying a tropical setting"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <div className="space-y-6 text-gray-600 text-lg leading-relaxed">
                  <p>
                    Meet the dynamic duo behind Moxie Vacation Rentals: Robert and Shelly. Hailing from Oregon, 
                    they bring a perfect blend of expertise and passion to their premier vacation rental business.
                  </p>
                  <p>
                    Together, their shared love for Oregon and commitment to exceptional service shine through 
                    in Moxie Vacation Rentals, providing guests with a remarkable stay combining outdoor adventures, 
                    culinary delights, and stylish accommodations.
                  </p>
                  <p>
                    With Moxie Vacation Rentals, you can expect nothing less than excellence. They are more than 
                    just hosts; they are passionate ambassadors of Oregon, ensuring that each guest leaves with 
                    unforgettable memories.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Gabby's Introduction */}
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-12 mt-12 border border-white/20">
            <div className="max-w-4xl mx-auto text-center">
              <h3 className="text-3xl font-bold text-gray-900 mb-6">Hey! I'm Gabby</h3>
              <p className="text-lg text-gray-700 leading-relaxed">
                I'm thrilled to be a part of the team managing Airbnb properties. Having lived my whole life 
                in Oregon, I've had the privilege of growing up with my Dad Robert, Step-Mom Shelly, sister, 
                and my three awesome bonus siblings, which has been quite the adventure! I attended South Eugene 
                High School, and these days, you'll often find me spending time with my son Theo. I'm here to 
                ensure your stay is absolutely perfect!
              </p>
            </div>
          </div>
        </div>

        {/* Mission Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Mission</h2>
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl shadow-2xl p-12 text-white border border-white/20">
            <div className="max-w-4xl mx-auto text-center">
              <p className="text-xl leading-relaxed mb-6">
                Our mission at Moxie Vacation Rentals is to create remarkable vacation experiences that embody 
                the spirit of Oregon. We aim to combine outdoor adventures, culinary delights, and stylish 
                accommodations to offer our guests a truly unforgettable stay.
              </p>
              <p className="text-lg leading-relaxed">
                With our expertise in hospitality, home improvement, and interior design, we are dedicated to 
                providing exceptional service and curating experiences that reflect the unique charm of the 
                Pacific Northwest. Our goal is to exceed guest expectations and leave them with cherished 
                memories of their time spent in Oregon.
              </p>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center hover:shadow-2xl transition-shadow bg-white/95 backdrop-blur-xl border-white/20">
              <CardContent className="p-8">
                <CheckCircle className="h-16 w-16 text-blue-600 mx-auto mb-6" />
                <h3 className="text-xl font-semibold mb-4">Integrity First</h3>
                <p className="text-gray-600 leading-relaxed">
                  We prioritize unwavering honesty, transparency, and ethical practices in all aspects of our business.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-2xl transition-shadow bg-white/95 backdrop-blur-xl border-white/20">
              <CardContent className="p-8">
                <Zap className="h-16 w-16 text-purple-600 mx-auto mb-6" />
                <h3 className="text-xl font-semibold mb-4">Fast Action Experience</h3>
                <p className="text-gray-600 leading-relaxed">
                  We provide swift and efficient solutions while ensuring a seamless and enjoyable experience for our guests.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-2xl transition-shadow bg-white/95 backdrop-blur-xl border-white/20">
              <CardContent className="p-8">
                <Star className="h-16 w-16 text-yellow-500 mx-auto mb-6" />
                <h3 className="text-xl font-semibold mb-4">Undisputable Value</h3>
                <p className="text-gray-600 leading-relaxed">
                  We provide unparalleled experiences that are unmatched in the industry, ensuring exceptional value.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-2xl transition-shadow bg-white/95 backdrop-blur-xl border-white/20">
              <CardContent className="p-8">
                <HandHeart className="h-16 w-16 text-red-500 mx-auto mb-6" />
                <h3 className="text-xl font-semibold mb-4">People Over Profits</h3>
                <p className="text-gray-600 leading-relaxed">
                  We prioritize the well-being, satisfaction, and success of our guests and communities above all financial considerations.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Authenticity & Excellence Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card className="hover:shadow-2xl transition-shadow bg-white/95 backdrop-blur-xl border-white/20">
            <CardContent className="p-12">
              <Award className="h-16 w-16 text-blue-600 mb-6" />
              <h3 className="text-2xl font-semibold mb-6">Excellence</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                We strive for excellence in every aspect of our business, from the meticulously maintained 
                properties to the curated experiences we provide. We go above and beyond to ensure that 
                our guests have an unforgettable stay.
              </p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-2xl transition-shadow bg-white/95 backdrop-blur-xl border-white/20">
            <CardContent className="p-12">
              <Heart className="h-16 w-16 text-purple-600 mb-6" />
              <h3 className="text-2xl font-semibold mb-6">Authenticity</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                We believe in showcasing the true essence of Oregon. From recommending local dining 
                experiences to offering outdoor activities, we provide an authentic and immersive 
                experience that allows guests to truly connect with the beauty and culture of the region.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Closing Statement */}
        <div className="text-center">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-12 border border-white/20">
            <p className="text-xl text-gray-700 italic mb-6 leading-relaxed">
              "Immerse yourself in the wonders of Oregon and indulge in the comfort, style, and hospitality 
              that Moxie Vacation Rentals offers, guided by the expertise of our passionate team."
            </p>
            <p className="font-semibold text-gray-900 text-lg">— The Moxie Family</p>
          </div>
        </div>
      </div>
    </BackgroundWrapper>
  );
};

export default About;
