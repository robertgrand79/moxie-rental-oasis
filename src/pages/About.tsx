
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Award, Users, Shield, CheckCircle, Zap, Star, HandHeart } from 'lucide-react';

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
            carefully curated properties in Eugene, Oregon and the Pacific Northwest.
          </p>
        </div>

        {/* Get To Know Our Family Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Get To Know Our Family</h2>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <img 
                src="/lovable-uploads/8d88b689-dbb7-492d-bce6-e3486c88b504.png"
                alt="Robert and Shelly at a beautiful temple location"
                className="rounded-lg shadow-lg w-full h-96 object-cover"
              />
            </div>
            <div>
              <div className="space-y-4 text-gray-600">
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
          
          {/* Gabby's Introduction */}
          <div className="bg-white rounded-lg shadow-lg p-8 mt-12">
            <div className="max-w-3xl mx-auto text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Hey! I'm Gabby</h3>
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
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-xl p-8 text-white">
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
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <CheckCircle className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Integrity First</h3>
                <p className="text-gray-600">
                  We prioritize unwavering honesty, transparency, and ethical practices in all aspects of our business.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <Zap className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Fast Action Experience</h3>
                <p className="text-gray-600">
                  We provide swift and efficient solutions while ensuring a seamless and enjoyable experience for our guests.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <Star className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Undisputable Value</h3>
                <p className="text-gray-600">
                  We provide unparalleled experiences that are unmatched in the industry, ensuring exceptional value.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <HandHeart className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">People Over Profits</h3>
                <p className="text-gray-600">
                  We prioritize the well-being, satisfaction, and success of our guests and communities above all financial considerations.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Authenticity & Excellence Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-8">
              <Award className="h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-2xl font-semibold mb-4">Excellence</h3>
              <p className="text-gray-600 leading-relaxed">
                We strive for excellence in every aspect of our business, from the meticulously maintained 
                properties to the curated experiences we provide. We go above and beyond to ensure that 
                our guests have an unforgettable stay.
              </p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-8">
              <Heart className="h-12 w-12 text-purple-600 mb-4" />
              <h3 className="text-2xl font-semibold mb-4">Authenticity</h3>
              <p className="text-gray-600 leading-relaxed">
                We believe in showcasing the true essence of Oregon. From recommending local dining 
                experiences to offering outdoor activities, we provide an authentic and immersive 
                experience that allows guests to truly connect with the beauty and culture of the region.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Closing Statement */}
        <div className="text-center">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <p className="text-lg text-gray-700 italic mb-4">
              "Immerse yourself in the wonders of Oregon and indulge in the comfort, style, and hospitality 
              that Moxie Vacation Rentals offers, guided by the expertise of our passionate team."
            </p>
            <p className="font-semibold text-gray-900">— The Moxie Family</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
