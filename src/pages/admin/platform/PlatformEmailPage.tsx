import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, Settings, FileText } from 'lucide-react';
import PlatformEmailInbox from '@/components/admin/platform/email/PlatformEmailInbox';
import EmailAddressManager from '@/components/admin/platform/email/EmailAddressManager';
import EmailTemplateManager from '@/components/admin/platform/email/EmailTemplateManager';

const PlatformEmailPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Email Inbox</h1>
        <p className="text-muted-foreground mt-1">
          Manage platform communications and email settings
        </p>
      </div>

      <Tabs defaultValue="inbox" className="space-y-4">
        <TabsList>
          <TabsTrigger value="inbox" className="gap-2">
            <Mail className="h-4 w-4" />
            Inbox
          </TabsTrigger>
          <TabsTrigger value="templates" className="gap-2">
            <FileText className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="h-4 w-4" />
            Email Addresses
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inbox">
          <PlatformEmailInbox />
        </TabsContent>

        <TabsContent value="templates">
          <EmailTemplateManager />
        </TabsContent>

        <TabsContent value="settings">
          <EmailAddressManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PlatformEmailPage;
