import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import EugeneEventsManager from '@/components/admin/EugeneEventsManager';
import PointsOfInterestManager from '@/components/admin/PointsOfInterestManager';
import LifestyleGalleryManager from '@/components/admin/LifestyleGalleryManager';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import NavBar from '@/components/NavBar';
import ContentStatsDashboard from '@/components/admin/ContentStatsDashboard';

const Admin = () => {
  const { user, logout } = useAuth();
  const router = useRouter();

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gradient-from to-gradient-to">
      <NavBar />
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Manage your vacation rental website content and settings
            </p>
          </div>

          {/* Add Content Stats Dashboard */}
          <ContentStatsDashboard />

          <Tabs defaultValue="events" className="w-full">
            <TabsList>
              <TabsTrigger value="events">Events</TabsTrigger>
              <TabsTrigger value="poi">Points of Interest</TabsTrigger>
              <TabsTrigger value="lifestyle">Lifestyle Gallery</TabsTrigger>
            </TabsList>
            <TabsContent value="events">
              <EugeneEventsManager />
            </TabsContent>
            <TabsContent value="poi">
              <PointsOfInterestManager />
            </TabsContent>
            <TabsContent value="lifestyle">
              <LifestyleGalleryManager />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Admin;
