
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Building2, BookOpen, Users, Settings, ArrowRight, User, FileText, BarChart3, MessageSquare, Shield } from 'lucide-react';
import BackgroundWrapper from '@/components/home/BackgroundWrapper';
import { EnhancedCard, EnhancedCardContent } from '@/components/ui/enhanced-card';
import { EnhancedButton } from '@/components/ui/enhanced-button';

const Admin = () => {
  const { user } = useAuth();

  const adminFeatures = [
    {
      title: "Property Management",
      description: "Curate and manage luxury properties, add new listings, and update existing accommodations.",
      icon: Building2,
      href: "/properties",
      color: "from-blue-500 to-blue-600",
      available: true
    },
    {
      title: "Page Management",
      description: "Create and manage website pages, update content, and control what visitors see.",
      icon: FileText,
      href: "/page-management",
      color: "from-green-500 to-green-600",
      available: true
    },
    {
      title: "Content Studio",
      description: "Create premium SEO content, manage blog posts, and send newsletters to engage your audience.",
      icon: BookOpen,
      href: "/blog-management",
      color: "from-purple-500 to-purple-600",
      available: true
    },
    {
      title: "AI Analytics",
      description: "Monitor AI performance, content insights, and user engagement analytics.",
      icon: BarChart3,
      href: "/admin/analytics",
      color: "from-orange-500 to-orange-600",
      available: true
    },
    {
      title: "Chat Support",
      description: "Manage guest inquiries with AI-powered assistance and real-time chat support.",
      icon: MessageSquare,
      href: "/admin/chat-support",
      color: "from-teal-500 to-teal-600",
      available: true
    },
    {
      title: "Content Approval",
      description: "Review and approve AI-generated content before publication with workflow management.",
      icon: Shield,
      href: "/admin/content-approval",
      color: "from-indigo-500 to-indigo-600",
      available: true
    },
    {
      title: "User Profile",
      description: "Update your account information, change password, and manage profile settings.",
      icon: User,
      href: "/admin/profile",
      color: "from-pink-500 to-pink-600",
      available: true
    },
    {
      title: "Brand Studio",
      description: "Customize brand identity, site settings, and visual appearance across the platform.",
      icon: Settings,
      href: "/site-settings",
      color: "from-cyan-500 to-cyan-600",
      available: true
    },
    {
      title: "User Administration",
      description: "Manage administrative access, user permissions, and account settings.",
      icon: Users,
      href: "#",
      color: "from-gray-400 to-gray-500",
      available: false
    }
  ];

  return (
    <BackgroundWrapper>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-gradient-from to-gradient-accent-from rounded-full mb-6 shadow-lg">
              <Settings className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6 leading-tight bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-gradient-from to-gradient-accent-from mx-auto mb-8 rounded-full"></div>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              Welcome back! You have complete administrative control over the Moxie Vacation Rentals platform.
            </p>
          </div>

          {/* Admin Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {adminFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              
              if (!feature.available) {
                return (
                  <EnhancedCard 
                    key={feature.title}
                    variant="glass" 
                    hover={false}
                    className="opacity-60 cursor-not-allowed"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <EnhancedCardContent className="p-8 h-full flex flex-col">
                      <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}>
                        <IconComponent className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                      <p className="text-gray-600 mb-6 leading-relaxed flex-grow">
                        {feature.description}
                      </p>
                      <div className="flex items-center text-gray-500 font-medium">
                        Coming Soon
                      </div>
                    </EnhancedCardContent>
                  </EnhancedCard>
                );
              }

              return (
                <Link key={feature.title} to={feature.href} className="group">
                  <EnhancedCard 
                    variant="glass" 
                    className="h-full transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.02] animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <EnhancedCardContent className="p-8 h-full flex flex-col">
                      <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                        <IconComponent className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors duration-300">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 mb-6 leading-relaxed flex-grow">
                        {feature.description}
                      </p>
                      <div className="flex items-center text-blue-600 font-medium group-hover:text-blue-700 transition-colors duration-300">
                        <span>Manage {feature.title.split(' ')[0]}</span>
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                      </div>
                    </EnhancedCardContent>
                  </EnhancedCard>
                </Link>
              );
            })}
          </div>

          {/* Quick Actions Section */}
          <div className="mt-16 text-center animate-fade-in" style={{ animationDelay: '800ms' }}>
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Quick Actions</h2>
            <div className="flex flex-wrap justify-center gap-4">
              <EnhancedButton variant="gradient" size="lg" className="group">
                <Building2 className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform duration-200" />
                Add New Property
              </EnhancedButton>
              <EnhancedButton variant="outline" size="lg" className="group">
                <FileText className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform duration-200" />
                Create Page
              </EnhancedButton>
              <EnhancedButton variant="outline" size="lg" className="group">
                <BookOpen className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform duration-200" />
                Write Blog Post
              </EnhancedButton>
            </div>
          </div>
        </div>
      </div>
    </BackgroundWrapper>
  );
};

export default Admin;
