
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import PublicLayout from "./components/layouts/PublicLayout";
import AdminLayoutWrapper from "./components/layouts/AdminLayoutWrapper";
import Index from "./pages/Index";
import About from "./pages/About";
import Listings from "./pages/Listings";
import Properties from "./pages/Properties";
import Experiences from "./pages/Experiences";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import AdminProfile from "./pages/AdminProfile";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import FAQ from "./pages/FAQ";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import BlogManagement from "./pages/BlogManagement";
import PageManagement from "./pages/PageManagement";
import SiteSettings from "./pages/SiteSettings";
import SampleDataManagement from "./pages/SampleDataManagement";
import Events from "./pages/Events";
import SearchResults from "./pages/SearchResults";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import SiteHead from "./components/SiteHead";

// Admin Pages
import AdminProperties from "./pages/admin/AdminProperties";
import AdminSiteSettings from "./pages/admin/AdminSiteSettings";
import AdminEvents from "./pages/admin/AdminEvents";
import AdminLifestyle from "./pages/admin/AdminLifestyle";
import AdminPOI from "./pages/admin/AdminPOI";
import AdminTestimonials from "./pages/admin/AdminTestimonials";
import AdminPageManagement from "./pages/admin/AdminPageManagement";
import AdminNewsletter from "./pages/admin/AdminNewsletter";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminSiteMetrics from "./pages/admin/AdminSiteMetrics";
import AdminTaskManagement from "./pages/admin/AdminTaskManagement";
import AdminWorkOrders from "./pages/admin/AdminWorkOrders";
import AdminAITools from "./pages/admin/AdminAITools";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <SiteHead />
            <Routes>
              {/* Admin Routes - using AdminLayoutWrapper */}
              <Route path="/admin" element={
                <ProtectedRoute>
                  <AdminLayoutWrapper />
                </ProtectedRoute>
              }>
                <Route index element={<Admin />} />
                <Route path="profile" element={<AdminProfile />} />
                <Route path="properties" element={<AdminProperties />} />
                <Route path="settings" element={<AdminSiteSettings />} />
                <Route path="events" element={<AdminEvents />} />
                <Route path="lifestyle" element={<AdminLifestyle />} />
                <Route path="poi" element={<AdminPOI />} />
                <Route path="testimonials" element={<AdminTestimonials />} />
                <Route path="pages" element={<AdminPageManagement />} />
                <Route path="page-management" element={<PageManagement />} />
                <Route path="blog-management" element={<BlogManagement />} />
                <Route path="newsletter" element={<AdminNewsletter />} />
                <Route path="analytics" element={<AdminAnalytics />} />
                <Route path="site-metrics" element={<AdminSiteMetrics />} />
                <Route path="tasks" element={<AdminTaskManagement />} />
                <Route path="work-orders" element={<AdminWorkOrders />} />
                <Route path="ai-tools" element={<AdminAITools />} />
              </Route>

              {/* Legacy Admin Routes - using AdminLayoutWrapper */}
              <Route path="/blog-management" element={
                <ProtectedRoute>
                  <AdminLayoutWrapper />
                </ProtectedRoute>
              }>
                <Route index element={<BlogManagement />} />
              </Route>
              <Route path="/page-management" element={
                <ProtectedRoute>
                  <AdminLayoutWrapper />
                </ProtectedRoute>
              }>
                <Route index element={<PageManagement />} />
              </Route>
              <Route path="/site-settings" element={
                <ProtectedRoute>
                  <AdminLayoutWrapper />
                </ProtectedRoute>
              }>
                <Route index element={<SiteSettings />} />
              </Route>
              <Route path="/sample-data" element={
                <ProtectedRoute>
                  <AdminLayoutWrapper />
                </ProtectedRoute>
              }>
                <Route index element={<SampleDataManagement />} />
              </Route>

              {/* Public Routes - using PublicLayout */}
              <Route path="/" element={<PublicLayout />}>
                <Route index element={<Index />} />
                <Route path="about" element={<About />} />
                <Route path="listings" element={<Listings />} />
                <Route path="properties" element={<Properties />} />
                <Route path="experiences" element={<Experiences />} />
                <Route path="auth" element={<Auth />} />
                <Route path="privacy" element={<PrivacyPolicy />} />
                <Route path="terms" element={<TermsOfService />} />
                <Route path="faq" element={<FAQ />} />
                <Route path="blog" element={<Blog />} />
                <Route path="blog/:slug" element={<BlogPost />} />
                <Route path="events" element={<Events />} />
                <Route path="search" element={<SearchResults />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
