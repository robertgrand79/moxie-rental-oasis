
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import Properties from "./pages/Properties";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import BlogManagement from "./pages/BlogManagement";
import SiteSettings from "./pages/SiteSettings";
import SearchResults from "./pages/SearchResults";
import About from "./pages/About";
import Experiences from "./pages/Experiences";
import NotFound from "./pages/NotFound";
import NavBar from "./components/NavBar";
import ProtectedRoute from "./components/ProtectedRoute";
import Listings from "./pages/Listings";
import PropertyPage from "./components/PropertyPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <NavBar />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/listings" element={<Listings />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/about" element={<About />} />
            <Route path="/experiences" element={<Experiences />} />
            
            {/* Property Pages */}
            <Route path="/property/harris-st" element={<PropertyPage />} />
            <Route path="/property/kincaid-st" element={<PropertyPage />} />
            <Route path="/property/w-10th-house" element={<PropertyPage />} />
            <Route path="/property/w-10th-studio" element={<PropertyPage />} />
            <Route path="/property/woodlawn-ave" element={<PropertyPage />} />
            <Route path="/property/:propertyId" element={<PropertyPage />} />
            
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute>
                  <Admin />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/properties" 
              element={
                <ProtectedRoute>
                  <Properties />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/blog-management" 
              element={
                <ProtectedRoute>
                  <BlogManagement />
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
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
