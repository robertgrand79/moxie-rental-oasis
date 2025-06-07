
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Building2, BookOpen, Users, Settings, ArrowRight, User } from 'lucide-react';
import BackgroundWrapper from '@/components/home/BackgroundWrapper';

const Admin = () => {
  const { user } = useAuth();

  return (
    <BackgroundWrapper>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Admin Dashboard
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-gradient-from to-gradient-accent-from mx-auto mb-8"></div>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              Welcome back! You have complete administrative control over the Moxie Vacation Rentals platform.
            </p>
          </div>

          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-12 border border-white/20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Link to="/properties">
                <div className="group bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-white/20 hover:bg-white/100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 h-full">
                  <div className="w-16 h-16 bg-gradient-to-br from-gradient-from to-gradient-accent-from rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Building2 className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Property Management</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    Curate and manage luxury properties, add new listings, and update existing accommodations.
                  </p>
                  <div className="flex items-center text-blue-600 font-medium">
                    Manage Properties
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>
              </Link>

              <Link to="/blog-management">
                <div className="group bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-white/20 hover:bg-white/100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 h-full">
                  <div className="w-16 h-16 bg-gradient-to-br from-gradient-from to-gradient-accent-from rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <BookOpen className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Content Studio</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    Create premium SEO content, manage blog posts, and send newsletters to engage your audience.
                  </p>
                  <div className="flex items-center text-blue-600 font-medium">
                    Manage Content
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>
              </Link>

              <Link to="/admin/profile">
                <div className="group bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-white/20 hover:bg-white/100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 h-full">
                  <div className="w-16 h-16 bg-gradient-to-br from-gradient-from to-gradient-accent-from rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <User className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">User Profile</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    Update your account information, change password, and manage profile settings.
                  </p>
                  <div className="flex items-center text-blue-600 font-medium">
                    Manage Profile
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>
              </Link>

              <div className="group bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-white/20 opacity-75">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-500 rounded-2xl flex items-center justify-center mb-6">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">User Administration</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Manage administrative access, user permissions, and account settings.
                </p>
                <div className="flex items-center text-gray-500 font-medium">
                  Coming Soon
                </div>
              </div>

              <Link to="/site-settings">
                <div className="group bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-white/20 hover:bg-white/100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 h-full">
                  <div className="w-16 h-16 bg-gradient-to-br from-gradient-from to-gradient-accent-from rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Settings className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Brand Studio</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    Customize brand identity, site settings, and visual appearance across the platform.
                  </p>
                  <div className="flex items-center text-blue-600 font-medium">
                    Manage Settings
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </BackgroundWrapper>
  );
};

export default Admin;
