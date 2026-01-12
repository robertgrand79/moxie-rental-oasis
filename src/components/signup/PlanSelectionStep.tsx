import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowRight } from 'lucide-react';
import { TemplateCard } from './TemplateCard';
import { TemplatePreviewDrawer } from './TemplatePreviewDrawer';
import { OrganizationTemplate } from '@/hooks/useOrganizationTemplates';

interface PlanSelectionStepProps {
  templates: OrganizationTemplate[] | undefined;
  loadingTemplates: boolean;
  selectedTemplate: OrganizationTemplate | null;
  onSelectTemplate: (template: OrganizationTemplate) => void;
  onContinue: () => void;
}

export const PlanSelectionStep: React.FC<PlanSelectionStepProps> = ({
  templates,
  loadingTemplates,
  selectedTemplate,
  onSelectTemplate,
  onContinue,
}) => {
  const [previewTemplate, setPreviewTemplate] = React.useState<OrganizationTemplate | null>(null);

  return (
    <div className="space-y-8">
      {/* Step Indicator */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
            1
          </span>
          <span>Step 1 of 2</span>
        </div>
        <h1 className="text-2xl font-bold">Choose Your Plan</h1>
        <p className="text-muted-foreground mt-2">
          Select the template that best fits your needs
        </p>
      </div>

      {/* Template Cards */}
      {loadingTemplates ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {templates?.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              isSelected={selectedTemplate?.id === template.id}
              onSelect={() => onSelectTemplate(template)}
              onPreview={() => setPreviewTemplate(template)}
            />
          ))}
        </div>
      )}

      {/* Continue Button */}
      <div className="flex flex-col items-center gap-4 pt-4">
        <Button
          size="lg"
          className="w-full max-w-sm bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white h-12"
          disabled={!selectedTemplate}
          onClick={onContinue}
        >
          Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
        
        {!selectedTemplate && (
          <p className="text-sm text-muted-foreground">
            Select a plan to continue
          </p>
        )}
      </div>

      {/* Preview Drawer */}
      <TemplatePreviewDrawer
        template={previewTemplate}
        isOpen={!!previewTemplate}
        onClose={() => setPreviewTemplate(null)}
        onSelect={(template) => {
          onSelectTemplate(template);
          setPreviewTemplate(null);
        }}
      />
    </div>
  );
};
