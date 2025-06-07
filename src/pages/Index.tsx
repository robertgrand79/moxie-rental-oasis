import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to Moxie Vacation Rentals
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Discover amazing vacation rental properties in prime locations. 
            Your perfect getaway is just a click away.
          </p>
          
          <div className="flex gap-4 justify-center">
            <Link to="/blog">
              <Button size="lg">
                Explore Our Blog
              </Button>
            </Link>
            {!user && (
              <Link to="/auth">
                <Button size="lg" variant="outline">
                  Admin Access
                </Button>
              </Link>
            )}
          </div>
          
          {user && (
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto mt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Admin Dashboard</h2>
              <p className="text-gray-600 mb-6">
                Welcome back! You have full access to manage the Moxie Vacation Rentals website.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link to="/properties">
                  <Button variant="outline" className="p-6 h-auto w-full">
                    <div className="text-center">
                      <h3 className="font-semibold">Manage Properties</h3>
                      <p className="text-sm text-gray-500">Add and edit rental properties</p>
                    </div>
                  </Button>
                </Link>
                <Link to="/blog-management">
                  <Button variant="outline" className="p-6 h-auto w-full">
                    <div className="text-center">
                      <h3 className="font-semibold">Blog Management</h3>
                      <p className="text-sm text-gray-500">Create SEO-optimized content</p>
                    </div>
                  </Button>
                </Link>
                <Button variant="outline" className="p-6 h-auto">
                  <div className="text-center">
                    <h3 className="font-semibold">User Management</h3>
                    <p className="text-sm text-gray-500">Manage admin users</p>
                  </div>
                </Button>
                <Link to="/site-settings">
                  <Button variant="outline" className="p-6 h-auto w-full">
                    <div className="text-center">
                      <h3 className="font-semibold">Site Settings</h3>
                      <p className="text-sm text-gray-500">Customize colors, logos, and branding</p>
                    </div>
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Premium Locations</h3>
            <p className="text-gray-600">
              Handpicked properties in the most desirable vacation destinations.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">24/7 Support</h3>
            <p className="text-gray-600">
              Our dedicated team is here to help you every step of the way.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Easy Booking</h3>
            <p className="text-gray-600">
              Simple and secure booking process with instant confirmation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
