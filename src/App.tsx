
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/Index";
import About from "./pages/About";
import Properties from "./pages/Properties";
import Listings from "./pages/Listings";
import Experiences from "./pages/Experiences";
import Events from "./pages/Events";
import Auth from "./pages/Auth";
import FAQ from "./pages/FAQ";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import SearchResults from "./pages/SearchResults";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import AdminProfile from "./pages/AdminProfile";
import SiteSettings from "./pages/SiteSettings";
import PageManagement from "./pages/PageManagement";
import BlogManagement from "./pages/BlogManagement";
import SampleDataManagement from "./pages/SampleDataManagement";
import AdminLayout from "./components/admin/AdminLayout";
import AdminEvents from "./pages/admin/AdminEvents";
import AdminLifestyle from "./pages/admin/AdminLifestyle";
import AdminTestimonials from "./pages/admin/AdminTestimonials";
import AdminPOI from "./pages/admin/AdminPOI";
import AdminNewsletter from "./pages/admin/AdminNewsletter";
import AdminAITools from "./pages/admin/AdminAITools";
import AdminSiteSettings from "./pages/admin/AdminSiteSettings";
import AdminSiteMetrics from "./pages/admin/AdminSiteMetrics";
import AdminTaskManagement from "./pages/admin/AdminTaskManagement";
import AdminWorkOrders from "./pages/admin/AdminWorkOrders";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/properties" element={<Properties />} />
            <Route path="/listings" element={<Listings />} />
            <Route path="/experiences" element={<Experiences />} />
            <Route path="/events" element={<Events />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/search" element={<SearchResults />} />
            
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Admin />} />
              <Route path="profile" element={<AdminProfile />} />
              <Route path="settings" element={<SiteSettings />} />
              <Route path="pages" element={<PageManagement />} />
              <Route path="blog-management" element={<BlogManagement />} />
              <Route path="sample-data" element={<SampleDataManagement />} />
              <Route path="events" element={<AdminEvents />} />
              <Route path="lifestyle" element={<AdminLifestyle />} />
              <Route path="testimonials" element={<AdminTestimonials />} />
              <Route path="poi" element={<AdminPOI />} />
              <Route path="newsletter" element={<AdminNewsletter />} />
              <Route path="ai-tools" element={<AdminAITools />} />
              <Route path="site-settings" element={<AdminSiteSettings />} />
              <Route path="site-metrics" element={<AdminSiteMetrics />} />
              <Route path="tasks" element={<AdminTaskManagement />} />
              <Route path="work-orders" element={<AdminWorkOrders />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
