
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import Index from "@/pages/Index";
import Properties from "@/pages/Properties";
import PropertyDetails from "@/pages/PropertyDetails";
import EugeneLife from "@/pages/EugeneLife";
import Events from "@/pages/Events";
import Contact from "@/pages/Contact";
import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";
import Auth from "@/pages/Auth";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminProperties from "@/pages/admin/AdminProperties";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminWorkOrders from "@/pages/admin/AdminWorkOrders";
import AdminOfficeSpaces from "@/pages/admin/AdminOfficeSpaces";
import AdminEugeneEvents from "@/pages/admin/AdminEugeneEvents";
import AdminLifestyleGallery from "@/pages/admin/AdminLifestyleGallery";
import AdminPointsOfInterest from "@/pages/admin/AdminPointsOfInterest";
import AdminTestimonials from "@/pages/admin/AdminTestimonials";
import AdminPages from "@/pages/admin/AdminPages";
import AdminNewsletter from "@/pages/admin/AdminNewsletter";
import AdminBlogPosts from "@/pages/admin/AdminBlogPosts";
import AdminSettings from "@/pages/admin/AdminSettings";
import ProtectedRoute from "@/components/ProtectedRoute";
import DynamicPage from "@/pages/DynamicPage";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Layout />}>
                <Route index element={<Index />} />
                <Route path="properties" element={<Properties />} />
                <Route path="properties/:id" element={<PropertyDetails />} />
                <Route path="eugene-life" element={<EugeneLife />} />
                <Route path="events" element={<Events />} />
                <Route path="contact" element={<Contact />} />
                <Route path="blog" element={<Blog />} />
                <Route path="blog/:slug" element={<BlogPost />} />
                <Route path="auth" element={<Auth />} />
                <Route path="pages/:slug" element={<DynamicPage />} />
              </Route>

              {/* Admin routes */}
              <Route path="/admin" element={
                <ProtectedRoute requireAdmin>
                  <AdminLayout />
                </ProtectedRoute>
              }>
                <Route index element={<AdminDashboard />} />
                <Route path="properties" element={<AdminProperties />} />
                <Route path="workorders" element={<AdminWorkOrders />} />
                <Route path="office-spaces" element={<AdminOfficeSpaces />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="eugene-events" element={<AdminEugeneEvents />} />
                <Route path="lifestyle-gallery" element={<AdminLifestyleGallery />} />
                <Route path="points-of-interest" element={<AdminPointsOfInterest />} />
                <Route path="testimonials" element={<AdminTestimonials />} />
                <Route path="pages" element={<AdminPages />} />
                <Route path="newsletter" element={<AdminNewsletter />} />
                <Route path="blog-posts" element={<AdminBlogPosts />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
