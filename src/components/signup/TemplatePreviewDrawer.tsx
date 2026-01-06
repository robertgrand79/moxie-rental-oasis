import { Home, Building, CheckCircle2, X, ExternalLink, Sparkles, Package, Star, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from '@/components/ui/sheet';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { OrganizationTemplate } from '@/hooks/useOrganizationTemplates';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { openTemplatePreview } from '@/utils/templatePreview';

interface TemplatePreviewDrawerProps {
  template: OrganizationTemplate | null;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (template: OrganizationTemplate) => void;
}

// Format price from cents to dollars
const formatPrice = (cents: number): string => {
  return `$${(cents / 100).toFixed(0)}`;
};

export const TemplatePreviewDrawer = ({ 
  template, 
  isOpen, 
  onClose, 
  onSelect 
}: TemplatePreviewDrawerProps) => {
  const [isWhatsIncludedOpen, setIsWhatsIncludedOpen] = useState(true);
  
  if (!template) return null;
  
  const Icon = template.template_type === 'single_property' ? Home : Building;
  const pricingTier = template.pricing_tier;
  const featureHighlights = template.feature_highlights || [];
  const hasDemoData = template.include_demo_data && template.source_organization_id;
  
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {template.template_type === 'single_property' ? 'Single Property' : 'Multi Property'}
              </Badge>
              {pricingTier && (
                <Badge className="bg-primary text-primary-foreground">
                  <DollarSign className="h-3 w-3 mr-0.5" />
                  {formatPrice(pricingTier.monthly_price_cents)}/mo
                </Badge>
              )}
            </div>
            <SheetClose asChild>
              <Button variant="ghost" size="icon">
                <X className="h-4 w-4" />
              </Button>
            </SheetClose>
          </div>
          <SheetTitle className="text-2xl">{template.name}</SheetTitle>
          <SheetDescription className="text-base">
            {template.description}
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          {/* Preview Image */}
          <div className="relative rounded-lg overflow-hidden bg-gradient-to-br from-muted to-muted/50 aspect-video flex items-center justify-center">
            {template.preview_image_url ? (
              <img 
                src={template.preview_image_url} 
                alt={`${template.name} preview`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <Icon className="h-16 w-16" />
                <span className="text-sm">Preview coming soon</span>
              </div>
            )}
            
            {/* Live Demo Badge */}
            {template.preview_url && (
              <Button
                size="sm"
                className="absolute bottom-3 right-3 shadow-lg"
                onClick={() => openTemplatePreview(template.preview_url!)}
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                View Live Demo
              </Button>
            )}
          </div>
          
          {/* Pricing Tier Info */}
          {pricingTier && (
            <div className="p-4 rounded-lg border-2 border-primary/20 bg-primary/5">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  {pricingTier.name} Plan
                </h4>
                <span className="text-lg font-bold text-primary">
                  {formatPrice(pricingTier.monthly_price_cents)}/mo
                </span>
              </div>
              {pricingTier.features && pricingTier.features.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  {pricingTier.features.slice(0, 2).join(' • ')}
                  {pricingTier.features.length > 2 && ` • +${pricingTier.features.length - 2} more`}
                </p>
              )}
            </div>
          )}
          
          {/* Demo Data Banner */}
          {hasDemoData && (
            <div className="flex items-start gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="p-2 rounded-lg bg-green-500/20">
                <Package className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-green-700 dark:text-green-400">Demo Data Available</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Start with sample properties, blog posts, testimonials, and more to see how your site will look.
                </p>
              </div>
            </div>
          )}
          
          {/* Feature Highlights */}
          {featureHighlights.length > 0 && (
            <Collapsible open={isWhatsIncludedOpen} onOpenChange={setIsWhatsIncludedOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Star className="h-4 w-4 text-amber-500" />
                    What's Included
                  </h4>
                  <ChevronDown className={cn(
                    "h-4 w-4 transition-transform",
                    isWhatsIncludedOpen && "rotate-180"
                  )} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-3">
                <div className="grid grid-cols-1 gap-2">
                  {featureHighlights.map((feature, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                    >
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
          
          {/* Template Features (fallback) */}
          {featureHighlights.length === 0 && template.features.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Features Included
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {template.features.map((feature, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                  >
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Template Type Info */}
          <div className="p-4 rounded-lg border bg-card">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-medium">
                  {template.template_type === 'single_property' 
                    ? 'Perfect for Single Properties' 
                    : 'Built for Property Portfolios'}
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {template.template_type === 'single_property'
                    ? 'Focused design that puts your property front and center with dedicated pages and streamlined booking.'
                    : 'Scalable system with property search, filtering, and management tools for growing portfolios.'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button 
              className="flex-1"
              onClick={() => {
                onSelect(template);
                onClose();
              }}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Use This Template
            </Button>
            {template.preview_url && (
              <Button 
                variant="outline"
                onClick={() => openTemplatePreview(template.preview_url!)}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
