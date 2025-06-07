
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import PropertyShowcase from '@/components/PropertyShowcase';
import HospitableSearchBar from '@/components/HospitableSearchBar';

const Index = () => {
  const { user } = useAuth();

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
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-6 sm:mb-8 px-4">
            <Link to="/blog">
              <Button size="lg" className="w-full sm:w-auto">
                Explore Our Blog
              </Button>
            </Link>
            <Link to="/experiences">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                View Experiences
              </Button>
            </Link>
            <Link to="/foodie">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Culinary Adventures
              </Button>
            </Link>
            {!user && (
              <Link to="/auth">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Admin Access
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <HospitableSearchBar />

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
