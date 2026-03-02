import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { useTenant } from '@/contexts/TenantContext';
import { Check, Layout, Minus, ArrowUpRight, Loader2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import SitePreviewPanel from './SitePreviewPanel';

interface TemplateOption {
  slug: string;
  name: string;
  description: string;
  features: string[];
  templateType: 'single_property' | 'multi_property';
  preview?: string;
}

const TEMPLATES: TemplateOption[] = [
  {
    slug: 'multi-classic',
    name: 'Classic',
    description: 'Full-featured site with property search, filtering, testimonials, and comprehensive marketing sections. Automatically adapts for single or multiple properties.',
    features: [
      'Auto-adapts for 1 or many properties',
      'Property search & filtering',
      'Testimonials & social proof',
      'Local information & events',
      'Booking benefits',
    ],
    templateType: 'multi_property',
  },
  {
    slug: 'lux-portfolio',
    name: 'Lux',
    description: 'Ultra-premium editorial layout with cinematic hero, concierge search, and quiet luxury aesthetics. Automatically adapts for single or multiple properties.',
    features: [
      'Auto-adapts for 1 or many properties',
      'Full-screen cycling hero',
      'Frosted-glass concierge search',
      'Editorial grid layout',
      'Quiet luxury design',
    ],
    templateType: 'multi_property',
  },
];

const TemplateSwitcher: React.FC = () => {
  const { organization } = useCurrentOrganization();
  const { isSingleProperty } = useTenant();
  const queryClient = useQueryClient();
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [pendingTemplate, setPendingTemplate] = useState<TemplateOption | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<TemplateOption | null>(null);

  // Fetch current active_template_slug and subscription_tier
  const { data: orgData, isLoading } = useQuery({
    queryKey: ['active-template-slug', organization?.id],
    queryFn: async () => {
      if (!organization?.id) return { slug: 'classic', tier: 'starter' };
      const { data } = await supabase
        .from('organizations')
        .select('active_template_slug, template_type, subscription_tier')
        .eq('id', organization.id)
        .single();
      const slug = data?.active_template_slug
        || (data?.template_type === 'multi_property' ? 'multi-classic' : 'classic');
      return { slug, tier: (data as any)?.subscription_tier || 'starter' };
    },
    enabled: !!organization?.id,
  });

  const currentSlug = orgData?.slug;

  const switchMutation = useMutation({
    mutationFn: async (template: TemplateOption) => {
      if (!organization?.id) throw new Error('No organization');
      
      const updates: Record<string, any> = {
        active_template_slug: template.slug,
      };

      // If switching template type, also update template_type
      if (template.templateType === 'multi_property' && isSingleProperty) {
        updates.template_type = 'multi_property';
      } else if (template.templateType === 'single_property' && !isSingleProperty) {
        updates.template_type = 'single_property';
      }

      const { error } = await supabase
        .from('organizations')
        .update(updates)
        .eq('id', organization.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-template-slug'] });
      queryClient.invalidateQueries({ queryKey: ['tenant'] });
      toast.success('Template updated! Refresh the page to see changes.');
    },
    onError: () => {
      toast.error('Failed to update template');
    },
  });

  const handleSelectTemplate = (template: TemplateOption) => {
    if (template.slug === currentSlug) return;
    switchMutation.mutate(template);
  };

  const handleConfirmUpgrade = () => {
    if (pendingTemplate) {
      switchMutation.mutate(pendingTemplate);
    }
    setUpgradeDialogOpen(false);
    setPendingTemplate(null);
  };

  const allTemplates = TEMPLATES;

  const orgSlug = organization?.slug;

  const buildPreviewUrl = (templateSlug: string) => {
    const params = new URLSearchParams();
    if (orgSlug) params.set('org', orgSlug);
    params.set('template', templateSlug);
    return `/?${params.toString()}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Site Template</h2>
        <p className="text-muted-foreground mt-1">
          Choose how your homepage looks. You can switch templates anytime.
        </p>
      </div>

      {/* Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {TEMPLATES.map((template) => (
          <TemplateCard
            key={template.slug}
            template={template}
            isActive={currentSlug === template.slug}
            onSelect={() => handleSelectTemplate(template)}
            onPreview={() => setPreviewTemplate(template)}
            isLoading={switchMutation.isPending}
          />
        ))}
      </div>

      {/* Upgrade Dialog */}
      <AlertDialog open={upgradeDialogOpen} onOpenChange={setUpgradeDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Plan Upgrade Required</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                Switching to a multi-property template requires upgrading from the <strong>Starter plan ($79/mo)</strong> to at least the <strong>Professional plan ($179/mo)</strong>.
              </p>
              <p>
                The Professional plan supports up to 5 properties with advanced features like property search, filtering, and portfolio management.
              </p>
              <div className="bg-muted rounded-lg p-4 mt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Professional Plan</p>
                    <p className="text-sm text-muted-foreground">Up to 5 properties</p>
                  </div>
                  <p className="text-2xl font-bold">$179<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmUpgrade}>
              <ArrowUpRight className="h-4 w-4 mr-2" />
              Upgrade & Switch Template
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Template Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={(open) => !open && setPreviewTemplate(null)}>
        <DialogContent className="max-w-6xl w-[95vw] h-[85vh] p-0 flex flex-col">
          <DialogHeader className="px-6 pt-6 pb-0">
            <DialogTitle>Preview: {previewTemplate?.name}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden px-2 pb-2">
            {previewTemplate && (
              <SitePreviewPanel
                previewUrl={buildPreviewUrl(previewTemplate.slug)}
                className="border-0 shadow-none h-full"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface TemplateCardProps {
  template: TemplateOption;
  isActive: boolean;
  onSelect: () => void;
  onPreview: () => void;
  isLoading: boolean;
  requiresUpgrade?: boolean;
}

const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  isActive,
  onSelect,
  onPreview,
  isLoading,
  requiresUpgrade,
}) => {
  return (
    <div
      className={`relative rounded-xl border-2 p-6 transition-all cursor-pointer hover:shadow-md ${
        isActive
          ? 'border-primary bg-primary/5 shadow-sm'
          : 'border-border hover:border-primary/50'
      }`}
      onClick={onSelect}
    >
      {/* Active indicator */}
      {isActive && (
        <div className="absolute top-3 right-3 bg-primary text-primary-foreground rounded-full p-1">
          <Check className="h-4 w-4" />
        </div>
      )}

      {/* Template preview placeholder */}
      <div className="bg-muted rounded-lg h-32 mb-4 flex items-center justify-center border border-border/50 relative group">
        <Layout className="h-10 w-10 text-muted-foreground/50" />
        <Button
          variant="secondary"
          size="sm"
          className="absolute inset-0 m-auto w-fit h-fit opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            onPreview();
          }}
        >
          <Eye className="h-4 w-4 mr-1.5" />
          Preview
        </Button>
      </div>

      {/* Info */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <h4 className="text-lg font-semibold text-foreground">{template.name}</h4>
          {isActive && <Badge variant="secondary" className="text-xs">Active</Badge>}
          {requiresUpgrade && !isActive && (
            <Badge variant="outline" className="text-xs">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              Upgrade
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {template.description}
        </p>
        <ul className="space-y-1.5">
          {template.features.map((feature, i) => (
            <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
              <Minus className="h-3 w-3 text-primary flex-shrink-0" />
              {feature}
            </li>
          ))}
        </ul>

        {!isActive && (
          <Button
            variant={requiresUpgrade ? 'outline' : 'default'}
            size="sm"
            className="w-full mt-2"
            disabled={isLoading}
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : requiresUpgrade ? (
              <ArrowUpRight className="h-4 w-4 mr-2" />
            ) : null}
            {requiresUpgrade ? 'Upgrade & Switch' : 'Use This Template'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default TemplateSwitcher;
