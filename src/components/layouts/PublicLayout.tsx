import React from 'react';
import { Outlet } from 'react-router-dom';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import ChatWidget from '@/components/chat/ChatWidget';
import PublicSidebar from '@/components/navbar/PublicSidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/sonner';
import { useTenant } from '@/contexts/TenantContext';
import { Loader2 } from 'lucide-react';

const PublicLayout = () => {
  const { loading, error } = useTenant();

  // Show loading state while detecting tenant
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // Show error if no tenant found
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md px-4">
          <h1 className="text-2xl font-bold text-foreground mb-4">Site Unavailable</h1>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SidebarProvider defaultOpen={false}>
        <div className="flex w-full min-h-screen">
          <PublicSidebar />
          <SidebarInset className="flex-1 flex flex-col">
            <NavBar />
            <main className="flex-1">
              <Outlet />
            </main>
            <Footer />
            <ChatWidget />
            <Toaster position="top-center" richColors />
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default PublicLayout;
