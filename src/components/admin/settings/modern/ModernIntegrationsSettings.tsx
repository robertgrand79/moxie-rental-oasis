import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bot, MessageSquare, Lock, Plug, Map, CheckCircle2, AlertCircle } from 'lucide-react';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import AIAssistantDrawer from './drawers/AIAssistantDrawer';
import CommunicationsDrawer from './drawers/CommunicationsDrawer';
import SmartHomeDrawer from './drawers/SmartHomeDrawer';
import ServicesDrawer from './drawers/ServicesDrawer';

const ModernIntegrationsSettings: React.FC = () => {
  const { organization } = useCurrentOrganization();
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);
  const [commsDrawerOpen, setCommsDrawerOpen] = useState(false);
  const [smartHomeDrawerOpen, setSmartHomeDrawerOpen] = useState(false);
  const [servicesDrawerOpen, setServicesDrawerOpen] = useState(false);

  const org = organization as any;
  const hasAI = true;
  const isPortfolio = org?.subscription_tier === 'portfolio';
  const hasComms = !!(org?.openphone_api_key || (isPortfolio && org?.resend_api_key));
  const hasSmartHome = !!org?.seam_api_key;
  const hasServices = !!(org?.turno_api_token);

  const IntegrationCard = ({ icon: Icon, title, description, configured, onClick }: any) => (
    <Card className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all group" onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted group-hover:bg-primary/10">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">{title}</h3>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </div>
          <Badge variant={configured ? 'default' : 'secondary'} className={configured ? 'bg-green-100 text-green-700' : ''}>
            {configured ? <><CheckCircle2 className="h-3 w-3 mr-1" />Active</> : <><AlertCircle className="h-3 w-3 mr-1" />Setup</>}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl bg-primary/10">
          <Plug className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Integrations</h1>
          <p className="text-muted-foreground">Connect third-party services</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <IntegrationCard icon={Bot} title="AI Assistant" description="Chat & automation" configured={hasAI} onClick={() => setAiDrawerOpen(true)} />
        <IntegrationCard icon={MessageSquare} title="Communications" description="SMS & Email" configured={hasComms} onClick={() => setCommsDrawerOpen(true)} />
        <IntegrationCard icon={Lock} title="Smart Home" description="Locks & thermostats" configured={hasSmartHome} onClick={() => setSmartHomeDrawerOpen(true)} />
        <IntegrationCard icon={Plug} title="Services" description="Turno & APIs" configured={hasServices} onClick={() => setServicesDrawerOpen(true)} />
      </div>

      <AIAssistantDrawer open={aiDrawerOpen} onOpenChange={setAiDrawerOpen} />
      <CommunicationsDrawer open={commsDrawerOpen} onOpenChange={setCommsDrawerOpen} />
      <SmartHomeDrawer open={smartHomeDrawerOpen} onOpenChange={setSmartHomeDrawerOpen} />
      <ServicesDrawer open={servicesDrawerOpen} onOpenChange={setServicesDrawerOpen} />
    </div>
  );
};

export default ModernIntegrationsSettings;
