
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
import AdminLayout from "@/components/admin/AdminLayout";
import ChatWidget from "@/components/chat/ChatWidget";
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
import AdminSiteMetrics from "./pages/admin/AdminSiteMetrics";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <TooltipProvider>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
              <SiteHead />
              
              <Routes>
                {/* Public routes with NavBar */}
                <Route path="/" element={
                  <>
                    <NavBar />
                    <main className="min-h-screen">
                      <Index />
                    </main>
                    <Footer />
                  </>
                } />
                <Route path="/about" element={
                  <>
                    <NavBar />
                    <main className="min-h-screen">
                      <About />
                    </main>
                    <Footer />
                  </>
                } />
                <Route path="/listings" element={
                  <>
                    <NavBar />
                    <main className="min-h-screen">
                      <Listings />
                    </main>
                    <Footer />
                  </>
                } />
                <Route path="/property/:propertyId" element={
                  <>
                    <NavBar />
                    <main className="min-h-screen">
                      <PropertyPage />
                    </main>
                    <Footer />
                  </>
                } />
                <Route path="/property/slug/:slug" element={
                  <>
                    <NavBar />
                    <main className="min-h-screen">
                      <PropertyPage />
                    </main>
                    <Footer />
                  </>
                } />
                <Route path="/experiences" element={
                  <>
                    <NavBar />
                    <main className="min-h-screen">
                      <Experiences />
                    </main>
                    <Footer />
                  </>
                } />
                <Route path="/events" element={
                  <>
                    <NavBar />
                    <main className="min-h-screen">
                      <Events />
                    </main>
                    <Footer />
                  </>
                } />
                <Route path="/blog" element={
                  <>
                    <NavBar />
                    <main className="min-h-screen">
                      <Blog />
                    </main>
                    <Footer />
                  </>
                } />
                <Route path="/blog/:slug" element={
                  <>
                    <NavBar />
                    <main className="min-h-screen">
                      <BlogPost />
                    </main>
                    <Footer />
                  </>
                } />
                <Route path="/faq" element={
                  <>
                    <NavBar />
                    <main className="min-h-screen">
                      <FAQ />
                    </main>
                    <Footer />
                  </>
                } />
                <Route path="/privacy" element={
                  <>
                    <NavBar />
                    <main className="min-h-screen">
                      <PrivacyPolicy />
                    </main>
                    <Footer />
                  </>
                } />
                <Route path="/terms" element={
                  <>
                    <NavBar />
                    <main className="min-h-screen">
                      <TermsOfService />
                    </main>
                    <Footer />
                  </>
                } />
                <Route path="/search" element={
                  <>
                    <NavBar />
                    <main className="min-h-screen">
                      <SearchResults />
                    </main>
                    <Footer />
                  </>
                } />
                <Route path="/auth" element={
                  <>
                    <NavBar />
                    <main className="min-h-screen">
                      <Auth />
                    </main>
                    <Footer />
                  </>
                } />

                {/* Admin routes with AdminLayout (no NavBar) */}
                <Route
                  path="/admin/*"
                  element={
                    <ProtectedRoute>
                      <AdminLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Admin />} />
                  <Route path="site-metrics" element={<AdminSiteMetrics />} />
                  <Route path="properties" element={<Properties />} />
                  <Route path="page-management" element={<PageManagement />} />
                  <Route path="blog-management" element={<BlogManagement />} />
                  <Route path="profile" element={<AdminProfile />} />
                  <Route path="settings" element={<SiteSettings />} />
                  <Route path="sample-data" element={<SampleDataManagement />} />
                  <Route path="ai-tools" element={<AdminAITools />} />
                  <Route path="events" element={<AdminEvents />} />
                  <Route path="lifestyle" element={<AdminLifestyle />} />
                  <Route path="poi" element={<AdminPOI />} />
                  <Route path="testimonials" element={<AdminTestimonials />} />
                  <Route path="newsletter" element={<AdminNewsletter />} />
                  <Route path="site-settings" element={<AdminSiteSettings />} />
                </Route>

                <Route path="*" element={
                  <>
                    <NavBar />
                    <main className="min-h-screen">
                      <NotFound />
                    </main>
                    <Footer />
                  </>
                } />
              </Routes>

              {/* Chat Widget - appears on all pages */}
              <ChatWidget />
            </div>
            <Toaster />
            <Sonner />
          </TooltipProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
