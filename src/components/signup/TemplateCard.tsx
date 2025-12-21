import { Home, Building, CheckCircle2, Eye, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { OrganizationTemplate } from '@/hooks/useOrganizationTemplates';

interface TemplateCardProps {
  template: OrganizationTemplate;
  isSelected: boolean;
  onSelect: () => void;
  onPreview: () => void;
}

export const TemplateCard = ({ template, isSelected, onSelect, onPreview }: TemplateCardProps) => {
  const Icon = template.template_type === 'single_property' ? Home : Building;
  
  return (
    <div
      className={cn(
        "relative flex flex-col rounded-xl border-2 transition-all duration-200 overflow-hidden bg-card",
        "hover:border-primary/50 hover:shadow-lg",
        isSelected 
          ? "border-primary ring-2 ring-primary/20" 
          : "border-border"
      )}
    >
      {/* Preview Image Area */}
      <div className="relative h-40 bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center overflow-hidden">
        {template.thumbnail_url ? (
          <img 
            src={template.thumbnail_url} 
            alt={template.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Icon className="h-12 w-12" />
            <span className="text-xs uppercase tracking-wider">
              {template.template_type === 'single_property' ? 'Single Property' : 'Multi Property'}
            </span>
          </div>
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
        
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {template.description}
        </p>
        
        {/* Features */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {template.features.slice(0, 4).map((feature, idx) => (
            <Badge key={idx} variant="outline" className="text-xs font-normal">
              <Sparkles className="h-3 w-3 mr-1 text-primary" />
              {feature}
            </Badge>
          ))}
          {template.features.length > 4 && (
            <Badge variant="outline" className="text-xs font-normal">
              +{template.features.length - 4} more
            </Badge>
          )}
        </div>
        
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
