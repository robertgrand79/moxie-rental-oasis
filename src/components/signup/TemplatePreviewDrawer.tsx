import { Home, Building, CheckCircle2, X, ExternalLink, Sparkles } from 'lucide-react';
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
import { OrganizationTemplate } from '@/hooks/useOrganizationTemplates';

interface TemplatePreviewDrawerProps {
  template: OrganizationTemplate | null;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (template: OrganizationTemplate) => void;
}

export const TemplatePreviewDrawer = ({ 
  template, 
  isOpen, 
  onClose, 
  onSelect 
}: TemplatePreviewDrawerProps) => {
  if (!template) return null;
  
  const Icon = template.template_type === 'single_property' ? Home : Building;
  
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge variant="secondary">
              {template.template_type === 'single_property' ? 'Single Property' : 'Multi Property'}
            </Badge>
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
          </div>
          
          {/* Features Section */}
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
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
