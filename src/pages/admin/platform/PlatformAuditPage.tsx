import React, { useState } from 'react';
import PlatformAuditLog from '@/components/admin/superadmin/PlatformAuditLog';
import SecurityAuditLog from '@/components/admin/superadmin/SecurityAuditLog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, ShieldAlert, Users } from 'lucide-react';
import ImpersonationSessionsLog from '@/components/admin/superadmin/ImpersonationSessionsLog';

const PlatformAuditPage = () => {
  const [activeTab, setActiveTab] = useState('platform');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Audit Logs</h1>
        <p className="text-muted-foreground">
          View platform admin actions, security events, and impersonation sessions
        </p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="platform" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Platform Admin
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4" />
            Security Events
          </TabsTrigger>
          <TabsTrigger value="impersonation" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Impersonation Sessions
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="platform" className="mt-4">
          <PlatformAuditLog />
        </TabsContent>
        
        <TabsContent value="security" className="mt-4">
          <SecurityAuditLog />
        </TabsContent>
        
        <TabsContent value="impersonation" className="mt-4">
          <ImpersonationSessionsLog />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PlatformAuditPage;
