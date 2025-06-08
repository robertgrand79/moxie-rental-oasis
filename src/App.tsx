
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

// Public Pages
import Index from "./pages/Index";
import Properties from "./pages/Properties";
import About from "./pages/About";
import Events from "./pages/Events";
import Experiences from "./pages/Experiences";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Auth from "./pages/Auth";
import FAQ from "./pages/FAQ";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import SearchResults from "./pages/SearchResults";
import NotFound from "./pages/NotFound";
import PropertyPage from "./components/PropertyPage";

// Admin Pages
import AdminLayout from "./components/admin/AdminLayout";
import Admin from "./pages/Admin";
import AdminProperties from "./pages/admin/AdminProperties";
import BlogManagement from "./pages/BlogManagement";
import PageManagement from "./pages/PageManagement";
import AdminPageManagement from "./pages/admin/AdminPageManagement";
import AdminEvents from "./pages/admin/AdminEvents";
import AdminNewsletter from "./pages/admin/AdminNewsletter";
import AdminPOI from "./pages/admin/AdminPOI";
import AdminLifestyle from "./pages/admin/AdminLifestyle";
import AdminTestimonials from "./pages/admin/AdminTestimonials";
import AdminSiteSettings from "./pages/admin/AdminSiteSettings";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminAITools from "./pages/admin/AdminAITools";
import AdminSiteMetrics from "./pages/admin/AdminSiteMetrics";
import AdminTaskManagement from "./pages/admin/AdminTaskManagement";
import AdminWorkOrders from "./pages/admin/AdminWorkOrders";
import AdminProfile from "./pages/AdminProfile";
import SampleDataManagement from "./pages/SampleDataManagement";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/properties" element={<Properties />} />
            <Route path="/property/:slug" element={<PropertyPage />} />
            <Route path="/about" element={<About />} />
            <Route path="/events" element={<Events />} />
            <Route path="/experiences" element={<Experiences />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/search" element={<SearchResults />} />

            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Admin />} />
              <Route path="properties" element={<AdminProperties />} />
              <Route path="blog-management" element={<BlogManagement />} />
              <Route path="page-management" element={<AdminPageManagement />} />
              <Route path="events" element={<AdminEvents />} />
              <Route path="newsletter" element={<AdminNewsletter />} />
              <Route path="poi" element={<AdminPOI />} />
              <Route path="lifestyle" element={<AdminLifestyle />} />
              <Route path="testimonials" element={<AdminTestimonials />} />
              <Route path="settings" element={<AdminSiteSettings />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="ai-tools" element={<AdminAITools />} />
              <Route path="site-metrics" element={<AdminSiteMetrics />} />
              <Route path="tasks" element={<AdminTaskManagement />} />
              <Route path="work-orders" element={<AdminWorkOrders />} />
              <Route path="profile" element={<AdminProfile />} />
              <Route path="sample-data" element={<SampleDataManagement />} />
            </Route>

            {/* Legacy route for backward compatibility */}
            <Route path="/page-management" element={
              <ProtectedRoute>
                <PageManagement />
              </ProtectedRoute>
            } />

            {/* Catch all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
