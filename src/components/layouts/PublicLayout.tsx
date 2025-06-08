
import React from 'react';
import { Outlet } from 'react-router-dom';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import ChatWidget from '@/components/chat/ChatWidget';
import PublicSidebar from '@/components/navbar/PublicSidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';

const PublicLayout = () => {
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
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default PublicLayout;
