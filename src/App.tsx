import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { StaticSettingsProvider } from "@/contexts/StaticSettingsContext";
import PublicLayout from "@/components/layouts/PublicLayout";
import AdminLayoutWrapper from "@/components/layouts/AdminLayoutWrapper";

// Import pages
import Index from "./pages/Index";
import About from "./pages/About";
import Properties from "./pages/Properties";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import AdminProfile from "./pages/AdminProfile";
import SiteSettings from "./pages/SiteSettings";
import SearchResults from "./pages/SearchResults";
import PropertyPage from "./components/PropertyPage";
import BlogPost from "./pages/BlogPost";
import Blog from "./pages/Blog";
import Experiences from "./pages/Experiences";
import Events from "./pages/Events";
import FAQ from "./pages/FAQ";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";

// Admin pages
import AdminProperties from "./pages/admin/AdminProperties";
import AdminSiteSettingsRedesigned from "./pages/admin/AdminSiteSettingsRedesigned";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminUserManagement from "./pages/admin/AdminUserManagement";
import AdminRolesPermissions from "./pages/admin/AdminRolesPermissions";
import AdminWorkOrders from "./pages/admin/AdminWorkOrders";
import AdminPropertyManagement from "./pages/admin/AdminPropertyManagement";
import AdminTaskManagement from "./pages/admin/AdminTaskManagement";
import AdminNewsletterManagement from "./pages/admin/AdminNewsletterManagement";
import AdminPageManagement from "./pages/admin/AdminPageManagement";
import AdminAIChat from "./pages/admin/AdminAIChat";
import AdminAIContentReview from "./pages/admin/AdminAIContentReview";
import AdminSiteMetrics from "./pages/admin/AdminSiteMetrics";
import AdminTestimonials from "./pages/admin/AdminTestimonials";
import AdminLifestyle from "./pages/admin/AdminLifestyle";
import AdminPOI from "./pages/admin/AdminPOI";
import AdminEvents from "./pages/admin/AdminEvents";

import PageManagement from "./pages/PageManagement";
import BlogManagement from "./pages/BlogManagement";
import Listings from "./pages/Listings";
import SampleDataManagement from "./pages/SampleDataManagement";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <StaticSettingsProvider>
              <Routes>
                {/* Public routes with PublicLayout */}
                <Route path="/" element={<PublicLayout />}>
                  <Route index element={<Index />} />
                  <Route path="about" element={<About />} />
                  <Route path="properties" element={<Properties />} />
                  <Route path="property/:id" element={<PropertyPage />} />
                  <Route path="contact" element={<Contact />} />
                  <Route path="experiences" element={<Experiences />} />
                  <Route path="events" element={<Events />} />
                  <Route path="blog" element={<Blog />} />
                  <Route path="blog/:slug" element={<BlogPost />} />
                  <Route path="search" element={<SearchResults />} />
                  <Route path="faq" element={<FAQ />} />
                  <Route path="privacy" element={<PrivacyPolicy />} />
                  <Route path="terms" element={<TermsOfService />} />
                </Route>

                {/* Auth route without layout */}
                <Route path="/auth" element={<Auth />} />

                {/* Admin routes with AdminLayoutWrapper */}
                <Route path="/admin" element={<AdminLayoutWrapper />}>
                  <Route index element={<Admin />} />
                  <Route path="profile" element={<AdminProfile />} />
                  <Route path="properties" element={<AdminProperties />} />
                  <Route path="property-management" element={<AdminPropertyManagement />} />
                  <Route path="task-management" element={<AdminTaskManagement />} />
                  <Route path="work-orders" element={<AdminWorkOrders />} />
                  <Route path="settings" element={<AdminSiteSettingsRedesigned />} />
                  <Route path="analytics" element={<AdminAnalytics />} />
                  <Route path="site-metrics" element={<AdminSiteMetrics />} />
                  <Route path="users" element={<AdminUserManagement />} />
                  <Route path="roles" element={<AdminRolesPermissions />} />
                  <Route path="newsletters" element={<AdminNewsletterManagement />} />
                  <Route path="pages" element={<AdminPageManagement />} />
                  <Route path="ai-chat" element={<AdminAIChat />} />
                  <Route path="ai-content" element={<AdminAIContentReview />} />
                  <Route path="testimonials" element={<AdminTestimonials />} />
                  <Route path="lifestyle" element={<AdminLifestyle />} />
                  <Route path="poi" element={<AdminPOI />} />
                  <Route path="events" element={<AdminEvents />} />
                </Route>

                {/* Legacy routes - keeping for backwards compatibility */}
                <Route path="/site-settings" element={<SiteSettings />} />
                <Route path="/page-management" element={<PageManagement />} />
                <Route path="/blog-management" element={<BlogManagement />} />
                <Route path="/listings" element={<Listings />} />
                <Route path="/sample-data" element={<SampleDataManagement />} />

                {/* Catch all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </StaticSettingsProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
