import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Building2,
  Globe,
  Activity,
  BookOpen,
  MessageSquare,
  Clock,
  ChevronRight,
  UserCog,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  CreditCard,
  Home,
  Zap,
  Phone,
  Mail,
  Wrench,
  PanelRightClose,
} from 'lucide-react';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { toast } from 'sonner';
import type { TenantIntelligence } from '@/hooks/useTenantIntelligence';
import type { PlatformEmail } from '@/hooks/usePlatformEmails';

interface TenantIntelligenceSidebarProps {
  tenant: TenantIntelligence | null;
  isLoading: boolean;
  email: PlatformEmail;
  onCollapse: () => void;
}

const HealthRing = ({ score }: { score: number }) => {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  
  const color = score >= 70 
    ? 'hsl(var(--chart-2))' 
    : score >= 40 
      ? 'hsl(var(--chart-4))' 
      : 'hsl(var(--destructive))';

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="88" height="88" viewBox="0 0 88 88">
        <circle
          cx="44" cy="44" r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth="6"
        />
        <circle
          cx="44" cy="44" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 44 44)"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold" style={{ color }}>{score}</span>
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Health</span>
      </div>
    </div>
  );
};

const IntegrationBadge = ({ label, configured, icon: Icon }: { label: string; configured: boolean | null; icon: React.ElementType }) => (
  <div className="flex items-center gap-2 py-1.5">
    <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
    <span className="text-xs flex-1">{label}</span>
    {configured ? (
      <CheckCircle2 className="h-3.5 w-3.5 text-chart-2 shrink-0" />
    ) : (
      <XCircle className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
    )}
  </div>
);

const tierColors: Record<string, string> = {
  starter: 'bg-muted text-muted-foreground',
  professional: 'bg-primary/10 text-primary',
  portfolio: 'bg-chart-4/10 text-chart-4',
  enterprise: 'bg-chart-5/10 text-chart-5',
};

const TenantIntelligenceSidebar: React.FC<TenantIntelligenceSidebarProps> = ({
  tenant,
  isLoading,
  email,
  onCollapse,
}) => {
  const navigate = useNavigate();
  const { switchOrganization } = useCurrentOrganization();
  const [isImpersonating, setIsImpersonating] = useState(false);

  const handleImpersonate = async () => {
    if (!tenant) return;
    setIsImpersonating(true);
    try {
      const success = await switchOrganization(tenant.id);
      if (success) {
        toast.success(`Now impersonating ${tenant.name}`);
        navigate('/admin/dashboard');
      } else {
        toast.error('Failed to switch organization');
      }
    } catch (err) {
      toast.error('Impersonation failed');
    } finally {
      setIsImpersonating(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="h-full flex items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </Card>
    );
  }

  if (!tenant) {
    return (
      <Card className="h-full">
        <CardContent className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
          <Building2 className="h-8 w-8 opacity-40" />
          <p className="text-sm text-center">No tenant linked to this email</p>
          <p className="text-xs text-center opacity-60">
            Sender: {email.from_address}
          </p>
        </CardContent>
      </Card>
    );
  }

  const tier = tenant.subscription_tier || 'starter';

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <CardHeader className="p-3 pb-0 flex-row items-center justify-between gap-2 space-y-0">
        <div className="flex items-center gap-2 min-w-0">
          {tenant.logo_url ? (
            <img src={tenant.logo_url} alt="" className="h-6 w-6 rounded object-cover shrink-0" />
          ) : (
            <Building2 className="h-5 w-5 text-muted-foreground shrink-0" />
          )}
          <span className="font-semibold text-sm truncate">{tenant.name}</span>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={onCollapse}>
          <PanelRightClose className="h-4 w-4" />
        </Button>
      </CardHeader>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-4">
          {/* Impersonate Button */}
          <Button
            onClick={handleImpersonate}
            disabled={isImpersonating}
            className="w-full gap-2"
            variant="default"
            size="sm"
          >
            {isImpersonating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <UserCog className="h-3.5 w-3.5" />
            )}
            Impersonate Tenant
          </Button>

          {/* Tenant Overview */}
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Overview</h4>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Badge className={`text-[10px] px-1.5 py-0 ${tierColors[tier] || tierColors.starter}`}>
                  {tier}
                </Badge>
                <Badge variant={tenant.is_active ? 'default' : 'destructive'} className="text-[10px] px-1.5 py-0">
                  {tenant.is_active ? 'Active' : 'Inactive'}
                </Badge>
                {tenant.is_stuck && (
                  <Badge variant="destructive" className="text-[10px] px-1.5 py-0 gap-1">
                    <AlertTriangle className="h-2.5 w-2.5" />
                    Stuck
                  </Badge>
                )}
              </div>
              {tenant.custom_domain && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Globe className="h-3 w-3" />
                  <span className="truncate">{tenant.custom_domain}</span>
                </div>
              )}
              {tenant.slug && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <ChevronRight className="h-3 w-3" />
                  <span className="truncate">{tenant.slug}.staymoxie.com</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Health Metrics */}
          <div className="space-y-3">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Health</h4>
            <div className="flex justify-center">
              <HealthRing score={tenant.health_score ?? 0} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-muted/50 rounded-md p-2 text-center">
                <div className="flex items-center justify-center gap-1 mb-0.5">
                  <BookOpen className="h-3 w-3 text-muted-foreground" />
                </div>
                <p className="text-base font-semibold">{tenant.total_bookings ?? 0}</p>
                <p className="text-[10px] text-muted-foreground">Total Bookings</p>
              </div>
              <div className="bg-muted/50 rounded-md p-2 text-center">
                <div className="flex items-center justify-center gap-1 mb-0.5">
                  <Activity className="h-3 w-3 text-muted-foreground" />
                </div>
                <p className="text-base font-semibold">{tenant.bookings_last_30d ?? 0}</p>
                <p className="text-[10px] text-muted-foreground">Last 30d</p>
              </div>
              <div className="bg-muted/50 rounded-md p-2 text-center">
                <div className="flex items-center justify-center gap-1 mb-0.5">
                  <MessageSquare className="h-3 w-3 text-muted-foreground" />
                </div>
                <p className="text-base font-semibold">{tenant.conversations_last_7d ?? 0}</p>
                <p className="text-[10px] text-muted-foreground">Convos (7d)</p>
              </div>
              <div className="bg-muted/50 rounded-md p-2 text-center">
                <div className="flex items-center justify-center gap-1 mb-0.5">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                </div>
                <p className="text-base font-semibold">{tenant.days_inactive ?? 0}d</p>
                <p className="text-[10px] text-muted-foreground">Inactive</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Integration Status */}
          <div className="space-y-1">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Integrations</h4>
            <IntegrationBadge icon={CreditCard} label="Stripe" configured={tenant.has_stripe_configured} />
            <IntegrationBadge icon={Home} label="PriceLabs" configured={tenant.has_pricelabs_configured} />
            <IntegrationBadge icon={Zap} label="Seam (Smart Home)" configured={tenant.has_seam_configured} />
            <IntegrationBadge icon={Mail} label="Resend" configured={tenant.has_resend_configured} />
            <IntegrationBadge icon={Phone} label="OpenPhone" configured={tenant.has_openphone_configured} />
            <IntegrationBadge icon={Wrench} label="Turno" configured={tenant.has_turno_configured} />
          </div>
        </div>
      </ScrollArea>
    </Card>
  );
};

export default TenantIntelligenceSidebar;
