
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import PublicLayout from "@/components/layouts/PublicLayout";
import Index from "@/pages/Index";
import Properties from "@/pages/Properties";
import Experiences from "@/pages/Experiences";
import Events from "@/pages/Events";
import Contact from "@/pages/Contact";
import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";
import Auth from "@/pages/Auth";
import AdminLayoutWrapper from "@/components/layouts/AdminLayoutWrapper";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminProperties from "@/pages/admin/AdminProperties";
import AdminWorkOrders from "@/pages/admin/AdminWorkOrders";
import AdminContractors from "@/pages/admin/AdminContractors";
import AdminUserManagement from "@/pages/admin/AdminUserManagement";
import AdminEvents from "@/pages/admin/AdminEvents";
import AdminLifestyle from "@/pages/admin/AdminLifestyle";
import AdminPOI from "@/pages/admin/AdminPOI";
import AdminTestimonials from "@/pages/admin/AdminTestimonials";
import AdminPageManagement from "@/pages/admin/AdminPageManagement";
import AdminNewsletterManagement from "@/pages/admin/AdminNewsletterManagement";
import BlogManagement from "@/pages/BlogManagement";
import AdminSiteSettingsRedesigned from "@/pages/admin/AdminSiteSettingsRedesigned";
import AdminAnalytics from "@/pages/admin/AdminAnalytics";
import AdminSiteMetrics from "@/pages/admin/AdminSiteMetrics";
import AdminRolesPermissions from "@/pages/admin/AdminRolesPermissions";
import ProtectedRoute from "@/components/ProtectedRoute";

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
              <Route path="/" element={<PublicLayout />}>
                <Route index element={<Index />} />
                <Route path="properties" element={<Properties />} />
                <Route path="properties/:id" element={<Properties />} />
                <Route path="eugene-life" element={<Experiences />} />
                <Route path="events" element={<Events />} />
                <Route path="contact" element={<Contact />} />
                <Route path="blog" element={<Blog />} />
                <Route path="blog/:slug" element={<BlogPost />} />
                <Route path="auth" element={<Auth />} />
              </Route>

              {/* Admin routes */}
              <Route path="/admin" element={
                <ProtectedRoute requireAdmin>
                  <AdminLayoutWrapper />
                </ProtectedRoute>
              }>
                <Route index element={<AdminDashboard />} />
                <Route path="properties" element={<AdminProperties />} />
                <Route path="workorders" element={<AdminWorkOrders />} />
                <Route path="contractors" element={<AdminContractors />} />
                <Route path="users" element={<AdminUserManagement />} />
                <Route path="eugene-events" element={<AdminEvents />} />
                <Route path="lifestyle-gallery" element={<AdminLifestyle />} />
                <Route path="points-of-interest" element={<AdminPOI />} />
                <Route path="testimonials" element={<AdminTestimonials />} />
                <Route path="pages" element={<AdminPageManagement />} />
                <Route path="newsletter" element={<AdminNewsletterManagement />} />
                <Route path="blog-posts" element={<BlogManagement />} />
                <Route path="settings" element={<AdminSiteSettingsRedesigned />} />
                <Route path="analytics" element={<AdminAnalytics />} />
                <Route path="site-metrics" element={<AdminSiteMetrics />} />
                <Route path="roles-permissions" element={<AdminRolesPermissions />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
