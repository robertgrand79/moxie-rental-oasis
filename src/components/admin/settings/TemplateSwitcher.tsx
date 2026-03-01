import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { useTenant } from '@/contexts/TenantContext';
import { Check, Layout, Minus, ArrowUpRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
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

interface TemplateOption {
  slug: string;
  name: string;
  description: string;
  features: string[];
  templateType: 'single_property' | 'multi_property';
  preview?: string;
}

const SINGLE_TEMPLATES: TemplateOption[] = [
  {
    slug: 'classic',
    name: 'Classic',
    description: 'Full-featured homepage with social proof, booking benefits, reviews, and marketing sections. Great for maximizing conversions.',
    features: [
      'Social proof strip',
      'Booking benefits section',
      'Why Choose Us section',
      'Final features section',
      'Rich marketing layout',
    ],
    templateType: 'single_property',
  },
  {
    slug: 'minimal',
    name: 'Minimal',
    description: 'Clean, editorial layout that puts your property front and center. Large hero image, focused content, and elegant typography.',
    features: [
      'Full-bleed hero image',
      'Editorial description layout',
      'Clean photo gallery',
      'Minimal distraction design',
      'Content-first approach',
    ],
    templateType: 'single_property',
  },
];

const MULTI_TEMPLATES: TemplateOption[] = [
  {
    slug: 'multi-classic',
    name: 'Multi-Property Classic',
    description: 'Full-featured multi-property site with property search, filtering, testimonials, and comprehensive marketing sections.',
    features: [
      'Property search & filtering',
      'Testimonials section',
      'Local information',
      'Booking benefits',
      'Scalable for portfolios',
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

  // Fetch current active_template_slug
  const { data: currentSlug, isLoading } = useQuery({
    queryKey: ['active-template-slug', organization?.id],
    queryFn: async () => {
      if (!organization?.id) return 'classic';
      const { data } = await supabase
        .from('organizations')
        .select('active_template_slug, template_type')
        .eq('id', organization.id)
        .single();
      return data?.active_template_slug || 'classic';
    },
    enabled: !!organization?.id,
  });

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

    // If switching from single to multi, show upgrade prompt
    if (isSingleProperty && template.templateType === 'multi_property') {
      setPendingTemplate(template);
      setUpgradeDialogOpen(true);
      return;
    }

    switchMutation.mutate(template);
  };

  const handleConfirmUpgrade = () => {
    if (pendingTemplate) {
      switchMutation.mutate(pendingTemplate);
    }
    setUpgradeDialogOpen(false);
    setPendingTemplate(null);
  };

  const allTemplates = [...SINGLE_TEMPLATES, ...MULTI_TEMPLATES];

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

      {/* Single Property Templates */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Single Property Templates</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {SINGLE_TEMPLATES.map((template) => (
            <TemplateCard
              key={template.slug}
              template={template}
              isActive={currentSlug === template.slug}
              onSelect={() => handleSelectTemplate(template)}
              isLoading={switchMutation.isPending}
            />
          ))}
        </div>
      </div>

      {/* Multi Property Templates */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Multi-Property Templates
          {isSingleProperty && (
            <Badge variant="outline" className="ml-2 text-xs">
              Requires plan upgrade
            </Badge>
          )}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {MULTI_TEMPLATES.map((template) => (
            <TemplateCard
              key={template.slug}
              template={template}
              isActive={currentSlug === template.slug}
              onSelect={() => handleSelectTemplate(template)}
              isLoading={switchMutation.isPending}
              requiresUpgrade={isSingleProperty}
            />
          ))}
        </div>
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
    </div>
  );
};

interface TemplateCardProps {
  template: TemplateOption;
  isActive: boolean;
  onSelect: () => void;
  isLoading: boolean;
  requiresUpgrade?: boolean;
}

const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  isActive,
  onSelect,
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
      <div className="bg-muted rounded-lg h-32 mb-4 flex items-center justify-center border border-border/50">
        <Layout className="h-10 w-10 text-muted-foreground/50" />
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
