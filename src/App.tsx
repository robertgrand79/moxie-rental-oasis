
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import ChatWidget from "./components/chat/ChatWidget";
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
            <div className="min-h-screen flex flex-col">
              <NavBar />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/listings" element={<Listings />} />
                  <Route path="/properties" element={<Properties />} />
                  <Route path="/experiences" element={<Experiences />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/terms" element={<TermsOfService />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/blog/:slug" element={<BlogPost />} />
                  <Route path="/events" element={<Events />} />
                  <Route path="/search" element={<SearchResults />} />
                  
                  {/* Admin Routes */}
                  <Route 
                    path="/admin" 
                    element={
                      <ProtectedRoute>
                        <Admin />
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
                    path="/admin/properties" 
                    element={
                      <ProtectedRoute>
                        <AdminProperties />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin/settings" 
                    element={
                      <ProtectedRoute>
                        <AdminSiteSettings />
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
                    path="/admin/pages" 
                    element={
                      <ProtectedRoute>
                        <AdminPageManagement />
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
                    path="/admin/analytics" 
                    element={
                      <ProtectedRoute>
                        <AdminAnalytics />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin/metrics" 
                    element={
                      <ProtectedRoute>
                        <AdminSiteMetrics />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin/tasks" 
                    element={
                      <ProtectedRoute>
                        <AdminTaskManagement />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin/workorders" 
                    element={
                      <ProtectedRoute>
                        <AdminWorkOrders />
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
                  
                  {/* Legacy Admin Routes */}
                  <Route 
                    path="/blog-management" 
                    element={
                      <ProtectedRoute>
                        <BlogManagement />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/page-management" 
                    element={
                      <ProtectedRoute>
                        <PageManagement />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/site-settings" 
                    element={
                      <ProtectedRoute>
                        <SiteSettings />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/sample-data" 
                    element={
                      <ProtectedRoute>
                        <SampleDataManagement />
                      </ProtectedRoute>
                    } 
                  />
                  
                  {/* Catch all route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
              <ChatWidget />
            </div>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
