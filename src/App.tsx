import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { AuthProvider } from './contexts/AuthContext';
import { PropertiesProvider } from './contexts/PropertiesContext';
import { BookingsProvider } from './contexts/BookingsContext';
import { ClientsProvider } from './contexts/ClientsContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { AnalyticsProvider } from './contexts/AnalyticsContext';
import { NotificationsProvider } from './contexts/NotificationsContext';
import { ThemeProvider } from "@/components/theme-provider"
import Home from './pages/Home';
import Pricing from './pages/Pricing';
import Blog from './pages/Blog';
import BlogPostPage from './pages/BlogPostPage';
import Contact from './pages/Contact';
import Legal from './pages/Legal';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import NotFound from './pages/NotFound';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProperties from './pages/admin/AdminProperties';
import AdminBookings from './pages/admin/AdminBookings';
import AdminClients from './pages/admin/AdminClients';
import AdminSettings from './pages/admin/AdminSettings';
import AdminAppearance from './pages/admin/AdminAppearance';
import AdminUsers from './pages/admin/AdminUsers';
import AdminRoles from './pages/admin/AdminRoles';
import AdminPermissions from './pages/admin/AdminPermissions';
import AdminInvoices from './pages/admin/AdminInvoices';
import AdminNewsletterManagement from './pages/admin/AdminNewsletterManagement';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminNotifications from './pages/admin/AdminNotifications';
import AdminIntegrations from './pages/admin/AdminIntegrations';
import AdminSupport from './pages/admin/AdminSupport';
import AuthLogin from './pages/auth/AuthLogin';
import AuthRegister from './pages/auth/AuthRegister';
import AuthForgotPassword from './pages/auth/AuthForgotPassword';
import AuthResetPassword from './pages/auth/AuthResetPassword';
import AuthVerifyEmail from './pages/auth/AuthVerifyEmail';
import AuthLogout from './pages/auth/AuthLogout';
import SMSSignup from '@/pages/SMSSignup';

function App() {
  return (
    <AuthProvider>
      <PropertiesProvider>
        <BookingsProvider>
          <ClientsProvider>
            <SettingsProvider>
              <AnalyticsProvider>
                <NotificationsProvider>
                  <ThemeProvider
                    defaultTheme="system"
                    storageKey="moxie-theme"
                  >
                    <Router>
                      <div className="min-h-screen bg-background">
                        <SiteHeader />
                        <Routes>
                          <Route path="/" element={<Home />} />
                          <Route path="/pricing" element={<Pricing />} />
                          <Route path="/blog" element={<Blog />} />
                          <Route path="/blog/:slug" element={<BlogPostPage />} />
                          <Route path="/contact" element={<Contact />} />
                          <Route path="/legal" element={<Legal />} />
                          <Route path="/privacy" element={<Privacy />} />
                          <Route path="/terms" element={<Terms />} />

                          <Route path="/admin" element={<AdminDashboard />} />
                          <Route path="/admin/properties" element={<AdminProperties />} />
                          <Route path="/admin/bookings" element={<AdminBookings />} />
                          <Route path="/admin/clients" element={<AdminClients />} />
                          <Route path="/admin/settings" element={<AdminSettings />} />
                          <Route path="/admin/appearance" element={<AdminAppearance />} />
                          <Route path="/admin/users" element={<AdminUsers />} />
                          <Route path="/admin/roles" element={<AdminRoles />} />
                          <Route path="/admin/permissions" element={<AdminPermissions />} />
                          <Route path="/admin/invoices" element={<AdminInvoices />} />
                          <Route path="/admin/newsletter" element={<AdminNewsletterManagement />} />
                          <Route path="/admin/analytics" element={<AdminAnalytics />} />
                          <Route path="/admin/notifications" element={<AdminNotifications />} />
                          <Route path="/admin/integrations" element={<AdminIntegrations />} />
                          <Route path="/admin/support" element={<AdminSupport />} />

                          <Route path="/auth/login" element={<AuthLogin />} />
                          <Route path="/auth/register" element={<AuthRegister />} />
                          <Route path="/auth/forgot-password" element={<AuthForgotPassword />} />
                          <Route path="/auth/reset-password" element={<AuthResetPassword />} />
                          <Route path="/auth/verify-email" element={<AuthVerifyEmail />} />
                          <Route path="/auth/logout" element={<AuthLogout />} />

                          <Route path="/sms-signup" element={<SMSSignup />} />

                          <Route path="*" element={<NotFound />} />
                        </Routes>
                        <SiteFooter />
                        <Toaster />
                      </div>
                    </Router>
                  </ThemeProvider>
                </NotificationsProvider>
              </AnalyticsProvider>
            </SettingsProvider>
          </ClientsProvider>
        </BookingsProvider>
      </PropertiesProvider>
    </AuthProvider>
  );
}

export default App;
