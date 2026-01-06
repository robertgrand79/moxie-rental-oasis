import { Home, Building, CheckCircle2, Eye, Sparkles, Package, ExternalLink, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { OrganizationTemplate } from '@/hooks/useOrganizationTemplates';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface TemplateCardProps {
  template: OrganizationTemplate;
  isSelected: boolean;
  onSelect: () => void;
  onPreview: () => void;
}

// Format price from cents to dollars
const formatPrice = (cents: number): string => {
  return `$${(cents / 100).toFixed(0)}`;
};

export const TemplateCard = ({ template, isSelected, onSelect, onPreview }: TemplateCardProps) => {
  const Icon = template.template_type === 'single_property' ? Home : Building;
  const pricingTier = template.pricing_tier;
  const featureHighlights = template.feature_highlights || [];
  
  return (
    <div
      className={cn(
        "relative flex flex-col rounded-xl border-2 transition-all duration-200 overflow-hidden bg-card group",
        "hover:border-primary/50 hover:shadow-lg",
        isSelected 
          ? "border-primary ring-2 ring-primary/20" 
          : "border-border"
      )}
    >
      {/* Preview Image Area */}
      <div className="relative h-44 bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center overflow-hidden">
        {template.thumbnail_url ? (
          <img 
            src={template.thumbnail_url} 
            alt={template.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Icon className="h-12 w-12" />
            <span className="text-xs uppercase tracking-wider">
              {template.template_type === 'single_property' ? 'Single Property' : 'Multi Property'}
            </span>
          </div>
        )}
        
        {/* Pricing Tier Badge */}
        {pricingTier && (
          <div className="absolute top-3 left-3">
            <Badge className="bg-primary text-primary-foreground shadow-md font-semibold">
              {pricingTier.name} - {formatPrice(pricingTier.monthly_price_cents)}/mo
            </Badge>
          </div>
        )}
        
        {/* Demo Data Badge */}
        {template.include_demo_data && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="absolute top-3 right-12">
                  <Badge variant="secondary" className="bg-green-500/90 text-white shadow-md">
                    <Package className="h-3 w-3 mr-1" />
                    Demo Data
                  </Badge>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Includes sample properties, blog posts, testimonials & more</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        
        {/* Preview Button Overlay */}
        <Button
          variant="secondary"
          size="sm"
          className="absolute bottom-3 right-3 shadow-md"
          onClick={(e) => {
            e.stopPropagation();
            onPreview();
          }}
        >
          <Eye className="h-4 w-4 mr-1" />
          Preview
        </Button>
        
        {/* Live Preview Button */}
        {template.preview_url && (
          <Button
            variant="secondary"
            size="sm"
            className="absolute bottom-3 left-3 shadow-md"
            onClick={(e) => {
              e.stopPropagation();
              window.open(template.preview_url!, '_blank');
            }}
          >
            <ExternalLink className="h-4 w-4 mr-1" />
            Live Demo
          </Button>
        )}
        
        {isSelected && (
          <div className="absolute top-3 right-3 bg-primary text-primary-foreground rounded-full p-1">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="flex flex-col flex-1 p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-lg">{template.name}</h3>
          <Badge variant="secondary" className="text-xs shrink-0">
            {template.template_type === 'single_property' ? 'Single' : 'Multi'}
          </Badge>
        </div>
        
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {template.description}
        </p>
        
        {/* Feature Highlights */}
        {featureHighlights.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {featureHighlights.slice(0, 4).map((feature, idx) => (
              <Badge key={idx} variant="outline" className="text-xs font-normal">
                <Star className="h-3 w-3 mr-1 text-amber-500 fill-amber-500" />
                {feature}
              </Badge>
            ))}
            {featureHighlights.length > 4 && (
              <Badge variant="outline" className="text-xs font-normal text-muted-foreground">
                +{featureHighlights.length - 4} more
              </Badge>
            )}
          </div>
        )}
        
        {/* Fallback to features if no highlights */}
        {featureHighlights.length === 0 && template.features.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {template.features.slice(0, 4).map((feature, idx) => (
              <Badge key={idx} variant="outline" className="text-xs font-normal">
                <Sparkles className="h-3 w-3 mr-1 text-primary" />
                {feature}
              </Badge>
            ))}
            {template.features.length > 4 && (
              <Badge variant="outline" className="text-xs font-normal text-muted-foreground">
                +{template.features.length - 4} more
              </Badge>
            )}
          </div>
        )}
        
        {/* Pricing Plan Info */}
        {pricingTier && (
          <p className="text-xs text-muted-foreground mb-3">
            Includes the <span className="font-medium text-foreground">{pricingTier.name}</span> plan features
          </p>
        )}
        
        {/* Select Button */}
        <Button
          variant={isSelected ? "default" : "outline"}
          className="w-full mt-auto"
          onClick={onSelect}
        >
          {isSelected ? (
            <>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Selected
            </>
          ) : (
            'Use This Template'
          )}
        </Button>
      </div>
    </div>
  );
};
