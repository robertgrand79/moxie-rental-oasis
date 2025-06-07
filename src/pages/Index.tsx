
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import PropertyShowcase from '@/components/PropertyShowcase';
import { useEffect } from 'react';
import { Home, MapPin, Ruler, Eye, Building, Sparkles, User, Star, Wifi, Car, Tv, Shirt, ChefHat, Package, Bed, Calendar, Users, MessageCircle, CreditCard, ArrowRight } from 'lucide-react';

const Index = () => {
  const { user } = useAuth();

  useEffect(() => {
    // Load Hospitable search widget script
    const script = document.createElement('script');
    script.src = 'https://hospitable.b-cdn.net/direct-property-search-widget/hospitable-search-widget.prod.js';
    script.async = true;
    document.head.appendChild(script);

    return () => {
      // Cleanup script on unmount
      const existingScript = document.querySelector('script[src="https://hospitable.b-cdn.net/direct-property-search-widget/hospitable-search-widget.prod.js"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  const whyMoxieFeatures = [
    {
      icon: Home,
      title: "Luxury Amenities",
      description: "Premium features and high-end amenities for the ultimate comfort experience."
    },
    {
      icon: MapPin,
      title: "Prime Locations",
      description: "Strategically located properties in the most desirable areas."
    },
    {
      icon: Ruler,
      title: "Spacious accommodations",
      description: "Thoughtfully designed spaces that provide room to relax and unwind."
    },
    {
      icon: Eye,
      title: "Stunning views",
      description: "Breathtaking vistas and scenic surroundings at every property."
    },
    {
      icon: Building,
      title: "Modern design",
      description: "Contemporary architecture and stylish interiors throughout."
    },
    {
      icon: Sparkles,
      title: "Impeccable cleanliness",
      description: "Pristine properties maintained to the highest standards."
    },
    {
      icon: User,
      title: "Personalized experiences",
      description: "Tailored services and attention to detail for every guest."
    },
    {
      icon: Star,
      title: "Excellent customer service",
      description: "Dedicated support team committed to your satisfaction."
    }
  ];

  const whatWeOffer = [
    {
      icon: ChefHat,
      title: "Fully Equipped Kitchen",
      description: "Enjoy the convenience of luxury appliances and a fully stocked kitchen. We think of everything so you don't have to."
    },
    {
      icon: Package,
      title: "The Essentials",
      description: "We've got you covered with the toiletries to make your stay as comfortable as possible."
    },
    {
      icon: Bed,
      title: "Comfort & Style",
      description: "Indulge in the ultimate comfort and style, with each of our accommodations designed to the highest standards."
    },
    {
      icon: MapPin,
      title: "Great Location",
      description: "Discover the best of the city with our great locations conveniently situated throughout the area."
    },
    {
      icon: Wifi,
      title: "Free Wi-Fi",
      description: "Stay connected with up to 500 MBPS of free Wi-Fi available to all guests."
    },
    {
      icon: Car,
      title: "Parking",
      description: "Whether onsite or just a short distance away, we offer convenient parking options for your ease and comfort."
    },
    {
      icon: Tv,
      title: "Smart Entertainment",
      description: "Unwind with your favourite shows on our smart entertainment systems featuring popular streaming services like Netflix and Disney Plus."
    },
    {
      icon: Shirt,
      title: "Linen & Towels",
      description: "Rest easy knowing fresh linen and towels are provided for your stay."
    }
  ];

  const bookingBenefits = [
    {
      icon: Calendar,
      title: "Best Rates",
      description: "Booking directly with us means that you can potentially get the best rates available for your accommodation."
    },
    {
      icon: Users,
      title: "Loyalty Programs & Guest Benefits",
      description: "Access to discounted rates when you continue booking using our website."
    },
    {
      icon: MessageCircle,
      title: "Enhanced Customer Service",
      description: "When you book directly, you have a direct line of communication with the property owner or manager, which often translates into better customer service."
    },
    {
      icon: CreditCard,
      title: "No Booking Fees",
      description: "Booking with us means that you don't have to pay any additional booking fees and this can translate into significant savings."
    }
  ];

  return (
    <div className="min-h-screen relative">
      {/* Fixed Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Cpath d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      {/* Content Sections */}
      <div className="relative z-10">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="relative py-24 sm:py-32 lg:py-40 px-4">
            <div className="container mx-auto text-center">
              <div className="max-w-4xl mx-auto">
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-8 leading-tight">
                  Welcome to 
                  <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Moxie Vacation Rentals
                  </span>
                </h1>
                <p className="text-xl sm:text-2xl text-gray-200 mb-12 max-w-3xl mx-auto leading-relaxed">
                  Discover extraordinary vacation rental properties in the world's most coveted destinations. 
                  Your perfect luxury escape awaits.
                </p>
                
                {!user && (
                  <div className="flex justify-center mb-12">
                    <Link to="/auth">
                      <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 backdrop-blur-sm px-8 py-3 text-lg">
                        Admin Access
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                  </div>
                )}
              </div>

              {/* Elegant Search Widget */}
              <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 max-w-5xl mx-auto border border-white/20">
                <div className="text-center mb-8">
                  <h3 className="text-3xl font-bold text-gray-900 mb-3">Find Your Perfect Sanctuary</h3>
                  <p className="text-gray-600 text-lg">Search and reserve your ideal luxury retreat</p>
                </div>
                <hospitable-direct-mps identifier="fd74480f-9b42-4ff4-bd3d-c586d3ae77ab" type="custom" results-url="/search"></hospitable-direct-mps>
              </div>

              {user && (
                <div className="mt-16">
                  <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-8 max-w-4xl mx-auto border border-white/20">
                    <h2 className="text-3xl font-bold text-white mb-6">Executive Dashboard</h2>
                    <p className="text-gray-200 mb-8 text-lg">
                      Welcome back! You have complete administrative control over the Moxie Vacation Rentals platform.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <Link to="/properties">
                        <Button variant="outline" className="p-8 h-auto w-full border-white/20 text-white hover:bg-white/10 backdrop-blur-sm">
                          <div className="text-center">
                            <h3 className="font-semibold text-lg mb-2">Property Management</h3>
                            <p className="text-sm text-gray-300">Curate and manage luxury properties</p>
                          </div>
                        </Button>
                      </Link>
                      <Link to="/blog-management">
                        <Button variant="outline" className="p-8 h-auto w-full border-white/20 text-white hover:bg-white/10 backdrop-blur-sm">
                          <div className="text-center">
                            <h3 className="font-semibold text-lg mb-2">Content Studio</h3>
                            <p className="text-sm text-gray-300">Create premium SEO content</p>
                          </div>
                        </Button>
                      </Link>
                      <Button variant="outline" className="p-8 h-auto border-white/20 text-white hover:bg-white/10 backdrop-blur-sm">
                        <div className="text-center">
                          <h3 className="font-semibold text-lg mb-2">User Administration</h3>
                          <p className="text-sm text-gray-300">Manage administrative access</p>
                        </div>
                      </Button>
                      <Link to="/site-settings">
                        <Button variant="outline" className="p-8 h-auto w-full border-white/20 text-white hover:bg-white/10 backdrop-blur-sm">
                          <div className="text-center">
                            <h3 className="font-semibold text-lg mb-2">Brand Studio</h3>
                            <p className="text-sm text-gray-300">Customize brand identity</p>
                          </div>
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Why Moxie Section - Floating Card */}
        <div className="py-24 relative">
          <div className="container mx-auto px-4">
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-16 mx-auto border border-white/20">
              <div className="text-center mb-20">
                <h2 className="text-5xl font-bold text-gray-900 mb-6">
                  The Moxie Difference
                </h2>
                <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto mb-8"></div>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                  Experience unparalleled luxury and sophistication in every detail
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                {whyMoxieFeatures.map((feature, index) => {
                  const IconComponent = feature.icon;
                  return (
                    <div key={index} className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl p-8 text-center border border-gray-100 transition-all duration-300 hover:-translate-y-2">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                          <IconComponent className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">
                          {feature.title}
                        </h3>
                        <p className="text-gray-600 leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="text-center">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-12 py-4 text-lg rounded-full shadow-xl hover:shadow-2xl transition-all duration-300">
                  RESERVE YOUR ESCAPE
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* What We Offer Section - Floating Dark Card */}
        <div className="py-24 relative">
          <div className="container mx-auto px-4">
            <div className="bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl p-16 mx-auto border border-white/20 relative overflow-hidden">
              <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
              }}></div>
              <div className="relative">
                <div className="text-center mb-20">
                  <h2 className="text-5xl font-bold text-white mb-6">
                    Curated Luxury Amenities
                  </h2>
                  <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-purple-400 mx-auto mb-8"></div>
                  <p className="text-xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
                    Every detail meticulously crafted for your ultimate comfort and convenience
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {whatWeOffer.map((offer, index) => {
                    const IconComponent = offer.icon;
                    return (
                      <div key={index} className="group bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-8 text-center border border-white/20 hover:bg-white/20 transition-all duration-300 hover:-translate-y-2">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-400 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                          <IconComponent className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-4">
                          {offer.title}
                        </h3>
                        <p className="text-gray-200 leading-relaxed">
                          {offer.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Eugene Information Section - Floating Light Card */}
        <div className="py-24 relative">
          <div className="container mx-auto px-4">
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-16 mx-auto border border-white/20">
              <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                  <div>
                    <h2 className="text-5xl font-bold text-gray-900 mb-8 leading-tight">
                      Discover the 
                      <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Enchanting Eugene
                      </span>
                    </h2>
                    <div className="space-y-6 text-gray-700 text-lg leading-relaxed">
                      <p>
                        Immerse yourself in the captivating allure of Eugene, Oregon. Located in the heart 
                        of the magnificent Pacific Northwest, Eugene offers an exquisite blend of natural 
                        splendor, vibrant culture, and boundless outdoor adventures.
                      </p>
                      <p>
                        Explore breathtaking landscapes surrounding the city, from pristine forests and 
                        cascading waterfalls to the majestic mountain vistas. Experience the renowned 
                        Eugene Saturday Market, a cultural epicenter showcasing local artisans, musicians, 
                        and culinary artisans.
                      </p>
                      <p className="font-semibold text-gray-900 text-xl">
                        Moxie Vacation Rentals invites you to uncover Eugene's countless treasures 
                        and craft unforgettable memories.
                      </p>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl p-1 shadow-2xl">
                      <div className="bg-white rounded-3xl p-8">
                        <div className="text-center">
                          <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <MapPin className="h-12 w-12 text-white" />
                          </div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-4">Premium Location</h3>
                          <p className="text-gray-600 leading-relaxed">
                            Strategically positioned in the heart of Eugene's most desirable neighborhoods, 
                            offering unparalleled access to the city's finest attractions and amenities.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Benefits Section - Floating Light Card */}
        <div className="py-24 relative">
          <div className="container mx-auto px-4">
            <div className="bg-gradient-to-br from-blue-50/95 to-purple-50/95 backdrop-blur-xl rounded-3xl shadow-2xl p-16 mx-auto border border-white/20">
              <div className="text-center mb-20">
                <h2 className="text-5xl font-bold text-gray-900 mb-6">
                  Exclusive Direct Booking Benefits
                </h2>
                <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto mb-8"></div>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                  Unlock premium advantages when you book directly with us
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {bookingBenefits.map((benefit, index) => {
                  const IconComponent = benefit.icon;
                  return (
                    <div key={index} className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl p-8 text-center border border-gray-100 transition-all duration-300 hover:-translate-y-2">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
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
        
        {/* Property Showcase - Floating Card */}
        <div className="py-24 relative">
          <div className="container mx-auto px-4">
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-16 mx-auto border border-white/20">
              <PropertyShowcase />
            </div>
          </div>
        </div>
          
        {/* Enhanced Features Section - Final Dark Card */}
        <div className="py-24 relative">
          <div className="container mx-auto px-4">
            <div className="bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl p-16 mx-auto border border-white/20">
              <div className="text-center mb-20">
                <h2 className="text-5xl font-bold text-white mb-6">
                  Why Choose Moxie
                </h2>
                <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-purple-400 mx-auto"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="group bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-10 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:-translate-y-2">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <MapPin className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Premium Destinations</h3>
                  <p className="text-gray-200 text-lg leading-relaxed">
                    Meticulously curated properties in the world's most coveted vacation destinations.
                  </p>
                </div>
                <div className="group bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-10 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:-translate-y-2">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Star className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Concierge Support</h3>
                  <p className="text-gray-200 text-lg leading-relaxed">
                    Our dedicated luxury concierge team ensures your every need is anticipated and fulfilled.
                  </p>
                </div>
                <div className="group bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-10 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:-translate-y-2">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Seamless Experience</h3>
                  <p className="text-gray-200 text-lg leading-relaxed">
                    Effortless booking process with instant confirmation and premium guest services.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
