
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import SiteHead from "@/components/SiteHead";
import Index from "./pages/Index";
import About from "./pages/About";
import Listings from "./pages/Listings";
import PropertyPage from "./components/PropertyPage";
import Experiences from "./pages/Experiences";
import Events from "./pages/Events";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import FAQ from "./pages/FAQ";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import SearchResults from "./pages/SearchResults";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
// Admin pages
import Admin from "./pages/Admin";
import Properties from "./pages/Properties";
import PageManagement from "./pages/PageManagement";
import BlogManagement from "./pages/BlogManagement";
import AdminProfile from "./pages/AdminProfile";
import SiteSettings from "./pages/SiteSettings";
import SampleDataManagement from "./pages/SampleDataManagement";
import AdminAITools from "./pages/admin/AdminAITools";
import AdminEvents from "./pages/admin/AdminEvents";
import AdminLifestyle from "./pages/admin/AdminLifestyle";
import AdminPOI from "./pages/admin/AdminPOI";
import AdminTestimonials from "./pages/admin/AdminTestimonials";
import AdminNewsletter from "./pages/admin/AdminNewsletter";
import AdminSiteSettings from "./pages/admin/AdminSiteSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <TooltipProvider>
          <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            <SiteHead />
            <NavBar />
            <main className="min-h-screen">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/about" element={<About />} />
                <Route path="/listings" element={<Listings />} />
                <Route path="/property/:propertyId" element={<PropertyPage />} />
                <Route path="/property/slug/:slug" element={<PropertyPage />} />
                <Route path="/experiences" element={<Experiences />} />
                <Route path="/events" element={<Events />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/search" element={<SearchResults />} />
                <Route path="/auth" element={<Auth />} />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <Admin />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/properties"
                  element={
                    <ProtectedRoute>
                      <Properties />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/page-management"
                  element={
                    <ProtectedRoute>
                      <PageManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/blog-management"
                  element={
                    <ProtectedRoute>
                      <BlogManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/profile"
                  element={
                    <ProtectedRoute>
                      <AdminProfile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/settings"
                  element={
                    <ProtectedRoute>
                      <SiteSettings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/sample-data"
                  element={
                    <ProtectedRoute>
                      <SampleDataManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/ai-tools"
                  element={
                    <ProtectedRoute>
                      <AdminAITools />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/events"
                  element={
                    <ProtectedRoute>
                      <AdminEvents />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/lifestyle"
                  element={
                    <ProtectedRoute>
                      <AdminLifestyle />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/poi"
                  element={
                    <ProtectedRoute>
                      <AdminPOI />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/testimonials"
                  element={
                    <ProtectedRoute>
                      <AdminTestimonials />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/newsletter"
                  element={
                    <ProtectedRoute>
                      <AdminNewsletter />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/site-settings"
                  element={
                    <ProtectedRoute>
                      <AdminSiteSettings />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
          <Toaster />
          <Sonner />
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
