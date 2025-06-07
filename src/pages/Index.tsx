
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import PropertyShowcase from '@/components/PropertyShowcase';
import { useEffect } from 'react';
import { Home, MapPin, Ruler, Eye, Building, Sparkles, User, Star, Wifi, Car, Tv, Shirt, ChefHat, Package, Bed, Calendar, Users, MessageCircle, CreditCard } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative py-12 sm:py-16 lg:py-24 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
            Welcome to Moxie Vacation Rentals
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8 max-w-3xl mx-auto px-4">
            Discover amazing vacation rental properties in prime locations. 
            Your perfect getaway is just a click away.
          </p>
          
          {!user && (
            <div className="flex justify-center mb-6 sm:mb-8 px-4">
              <Link to="/auth">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Admin Access
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Hospitable Search Widget */}
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 max-w-4xl mx-auto -mt-4 sm:-mt-8 relative z-10">
          <div className="text-center mb-4 sm:mb-6">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Find Your Perfect Stay</h3>
            <p className="text-gray-600 text-sm sm:text-base">Search and book your ideal vacation rental</p>
          </div>
          <hospitable-direct-mps identifier="fd74480f-9b42-4ff4-bd3d-c586d3ae77ab" type="custom" results-url="/search"></hospitable-direct-mps>
        </div>

        {user && (
          <div className="container mx-auto px-4 mt-8 sm:mt-16">
            <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 max-w-2xl mx-auto">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Admin Dashboard</h2>
              <p className="text-gray-600 mb-6">
                Welcome back! You have full access to manage the Moxie Vacation Rentals website.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link to="/properties">
                  <Button variant="outline" className="p-4 sm:p-6 h-auto w-full">
                    <div className="text-center">
                      <h3 className="font-semibold text-sm sm:text-base">Manage Properties</h3>
                      <p className="text-xs sm:text-sm text-gray-500">Add and edit rental properties</p>
                    </div>
                  </Button>
                </Link>
                <Link to="/blog-management">
                  <Button variant="outline" className="p-4 sm:p-6 h-auto w-full">
                    <div className="text-center">
                      <h3 className="font-semibold text-sm sm:text-base">Blog Management</h3>
                      <p className="text-xs sm:text-sm text-gray-500">Create SEO-optimized content</p>
                    </div>
                  </Button>
                </Link>
                <Button variant="outline" className="p-4 sm:p-6 h-auto">
                  <div className="text-center">
                    <h3 className="font-semibold text-sm sm:text-base">User Management</h3>
                    <p className="text-xs sm:text-sm text-gray-500">Manage admin users</p>
                  </div>
                </Button>
                <Link to="/site-settings">
                  <Button variant="outline" className="p-4 sm:p-6 h-auto w-full">
                    <div className="text-center">
                      <h3 className="font-semibold text-sm sm:text-base">Site Settings</h3>
                      <p className="text-xs sm:text-sm text-gray-500">Customize colors, logos, and branding</p>
                    </div>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Why Moxie Vacation Rentals Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
            Why Moxie Vacation Rentals?
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {whyMoxieFeatures.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div key={index} className="bg-white rounded-lg shadow-lg p-6 text-center border">
                <IconComponent className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
        <div className="text-center">
          <Button size="lg" className="px-8">
            BOOK YOUR STAY
          </Button>
        </div>
      </div>

      {/* What We Offer Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              What We Offer
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {whatWeOffer.map((offer, index) => {
              const IconComponent = offer.icon;
              return (
                <div key={index} className="bg-gray-50 rounded-lg shadow-sm p-6 text-center border">
                  <IconComponent className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    {offer.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {offer.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Eugene Information Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="bg-white rounded-lg shadow-lg p-8 lg:p-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8">
            Unveiling The Charm Of Eugene.
          </h2>
          <div className="space-y-6 text-gray-600 leading-relaxed">
            <p className="text-lg">
              Prepare to immerse yourself in the captivating city of Eugene, Oregon. 
              Located in the heart of the beautiful Pacific Northwest, Eugene offers a 
              unique blend of natural beauty, vibrant culture, and outdoor adventures. 
              Explore the stunning landscapes that surround the city, from the lush 
              forests and cascading waterfalls to the breathtaking views of the nearby 
              mountains. Discover the Eugene Saturday Market, a vibrant hub of local 
              artisans, musicians, and food vendors, showcasing the region's creative spirit.
            </p>
            <p className="text-lg">
              Delve into the city's rich arts scene with visits to art galleries, theaters, and 
              live music venues that bring the streets of Eugene alive with energy and 
              talent. For sports enthusiasts, catch an exhilarating University of Oregon 
              Ducks game or partake in outdoor activities such as hiking, biking, and 
              kayaking along the picturesque Willamette River. Stay with Moxie Vacation 
              Rentals and experience Eugene's friendly community, thriving culinary 
              scene, and a deep appreciation for nature.
            </p>
            <p className="text-lg font-semibold text-gray-900">
              Moxie Vacation Rentals invites you to uncover Eugene's many wonders 
              and create lasting memories.
            </p>
          </div>
        </div>
      </div>

      {/* Booking Benefits Section */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {bookingBenefits.map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <div key={index} className="bg-white rounded-lg shadow-sm p-6 text-center border">
                  <IconComponent className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Property Showcase */}
      <PropertyShowcase />
        
      {/* Features Section */}
      <div className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">Premium Locations</h3>
            <p className="text-gray-600 text-sm sm:text-base">
              Handpicked properties in the most desirable vacation destinations.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">24/7 Support</h3>
            <p className="text-gray-600 text-sm sm:text-base">
              Our dedicated team is here to help you every step of the way.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">Easy Booking</h3>
            <p className="text-gray-600 text-sm sm:text-base">
              Simple and secure booking process with instant confirmation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
