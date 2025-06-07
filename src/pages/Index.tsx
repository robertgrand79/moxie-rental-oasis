
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import PropertyShowcase from '@/components/PropertyShowcase';
import { useEffect } from 'react';
import { Home, MapPin, Ruler, Eye, Building, Sparkles, User, Star, Wifi, Car, Tv, Shirt, ChefHat, Package, Bed, Calendar, Users, MessageCircle, CreditCard, ArrowRight, Coffee, Trees, Mountain } from 'lucide-react';

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
      title: "Local Living",
      description: "Experience Eugene like a local with properties in tree-lined neighborhoods and walkable areas."
    },
    {
      icon: MapPin,
      title: "Prime Eugene Locations",
      description: "Strategically located in Eugene's most charming and walkable neighborhoods."
    },
    {
      icon: Coffee,
      title: "Artisan Coffee Culture",
      description: "Locally roasted coffee and access to Eugene's vibrant artisan coffee scene."
    },
    {
      icon: Trees,
      title: "Pacific Northwest Nature",
      description: "Easy access to lush trails, Hendricks Park, and Oregon's natural beauty."
    },
    {
      icon: Building,
      title: "Modern Comfort",
      description: "Homes styled with warmth, character, and contemporary Pacific Northwest design."
    },
    {
      icon: Sparkles,
      title: "Curated Details",
      description: "Thoughtfully curated welcome baskets and guidebooks to hidden local spots."
    },
    {
      icon: User,
      title: "Personal Connection",
      description: "Stays that feel personal, memorable, and connected to Eugene's community spirit."
    },
    {
      icon: Star,
      title: "Local Expertise",
      description: "Your gateway to discovering Eugene like you've always belonged here."
    }
  ];

  const whatWeOffer = [
    {
      icon: ChefHat,
      title: "Fully Equipped Kitchen",
      description: "Enjoy the convenience of luxury appliances and a fully stocked kitchen with local Oregon touches."
    },
    {
      icon: Coffee,
      title: "Local Welcome Basket",
      description: "Locally roasted Eugene coffee and curated local treats to start your stay right."
    },
    {
      icon: Bed,
      title: "Pacific Northwest Style",
      description: "Homes styled with warmth, character, and modern comfort reflecting Oregon living."
    },
    {
      icon: MapPin,
      title: "Walkable Eugene Areas",
      description: "Located in Eugene's most charming neighborhoods, walkable to local attractions."
    },
    {
      icon: Wifi,
      title: "Free Wi-Fi",
      description: "Stay connected with up to 500 MBPS of free Wi-Fi for work or sharing your Eugene adventures."
    },
    {
      icon: Car,
      title: "Convenient Parking",
      description: "Easy parking options so you can explore Eugene and the Pacific Northwest with ease."
    },
    {
      icon: Tv,
      title: "Smart Entertainment",
      description: "Unwind after exploring Eugene with smart entertainment systems and popular streaming services."
    },
    {
      icon: Package,
      title: "Curated Local Guides",
      description: "Personalized guidebooks featuring our favorite hidden Eugene spots and local recommendations."
    }
  ];

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
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight">
                  Your Home Base for Living Like a Local in Eugene
                </h1>
                <p className="text-xl sm:text-2xl text-gray-200 mb-12 max-w-3xl mx-auto leading-relaxed">
                  Discover Eugene, Oregon through thoughtfully curated vacation rentals in the heart of 
                  the Pacific Northwest. From Ducks football to wine country tours, your Eugene adventure starts here.
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
                  <h3 className="text-3xl font-bold text-gray-900 mb-3">Find Your Eugene Sanctuary</h3>
                  <p className="text-gray-600 text-lg">Discover your perfect home base in Eugene, Oregon</p>
                </div>
                <hospitable-direct-mps identifier="fd74480f-9b42-4ff4-bd3d-c586d3ae77ab" type="custom" results-url="/search"></hospitable-direct-mps>
              </div>
            </div>
          </div>
        </div>
        
        {/* Why Moxie Section - Floating Card */}
        <div className="py-24 relative">
          <div className="container mx-auto px-4">
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-16 mx-auto border border-white/20">
              <div className="text-center mb-20">
                <h2 className="text-5xl font-bold text-gray-900 mb-6">
                  The Moxie Eugene Experience
                </h2>
                <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto mb-8"></div>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                  More than just a place to stay—your gateway to authentic Eugene living
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
                  BOOK YOUR EUGENE STAY
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
                    Thoughtfully Curated Eugene Amenities
                  </h2>
                  <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-purple-400 mx-auto mb-8"></div>
                  <p className="text-xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
                    Every detail designed to immerse you in the soul of Eugene
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
                        Heart of Eugene
                      </span>
                    </h2>
                    <div className="space-y-6 text-gray-700 text-lg leading-relaxed">
                      <p>
                        Immerse yourself in Eugene's vibrant community spirit—from tree-lined neighborhoods 
                        and artisan coffee shops to the passionate college town energy of Duck football and 
                        the renowned Saturday Market showcasing local artisans and musicians.
                      </p>
                      <p>
                        Experience the best of Pacific Northwest living with morning runs through Hendricks Park, 
                        wine country tours, and nights out at 5th Street Public Market. Our homes put you in 
                        the heart of Eugene's most walkable and charming areas.
                      </p>
                      <p className="font-semibold text-gray-900 text-xl">
                        Whether you're here for the Olympic trials, a family visit, or to soak up Oregon life, 
                        Moxie is your gateway to discovering Eugene like you've always belonged here.
                      </p>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl p-1 shadow-2xl">
                      <div className="bg-white rounded-3xl p-8">
                        <div className="text-center">
                          <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Mountain className="h-12 w-12 text-white" />
                          </div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-4">Pacific Northwest Living</h3>
                          <p className="text-gray-600 leading-relaxed">
                            Located in Eugene's most charming neighborhoods, offering authentic Oregon experiences 
                            from lush trails to vibrant farmers markets and everything in between.
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
                  Direct Booking Benefits in Eugene
                </h2>
                <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto mb-8"></div>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                  Book directly for the best Eugene experience and exclusive local advantages
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
                  Why Choose Moxie in Eugene
                </h2>
                <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-purple-400 mx-auto"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="group bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-10 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:-translate-y-2">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Coffee className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Local Eugene Culture</h3>
                  <p className="text-gray-200 text-lg leading-relaxed">
                    Immerse yourself in Eugene's artisan coffee culture, vibrant markets, and passionate college town spirit.
                  </p>
                </div>
                <div className="group bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-10 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:-translate-y-2">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Star className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Local Expert Hosts</h3>
                  <p className="text-gray-200 text-lg leading-relaxed">
                    Our Eugene-based team provides insider knowledge and curated guides to the city's hidden gems.
                  </p>
                </div>
                <div className="group bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-10 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:-translate-y-2">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Trees className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Pacific Northwest Access</h3>
                  <p className="text-gray-200 text-lg leading-relaxed">
                    Perfect location for exploring Oregon's wine country, natural trails, and the broader Pacific Northwest.
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
