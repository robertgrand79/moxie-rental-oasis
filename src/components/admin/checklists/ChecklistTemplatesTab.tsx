import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ChecklistTemplate } from '@/hooks/useChecklistManagement';
import ChecklistTemplateCard from './ChecklistTemplateCard';
import StartChecklistModal from './StartChecklistModal';
import CreateTemplateModal from './CreateTemplateModal';

interface ChecklistTemplatesTabProps {
  templates: ChecklistTemplate[];
  onStartChecklist: (templateId: string, propertyId: string, period: string, dueDate?: string) => Promise<any>;
  onChecklistStarted: (runId: string) => void;
  onCreateTemplate: (name: string, type: string, description: string) => Promise<any>;
  onRefresh: () => Promise<any>;
}

const ChecklistTemplatesTab = ({ 
  templates, 
  onStartChecklist, 
  onChecklistStarted,
  onCreateTemplate,
  onRefresh
}: ChecklistTemplatesTabProps) => {
  const [selectedTemplate, setSelectedTemplate] = useState<ChecklistTemplate | null>(null);
  const [isStartModalOpen, setIsStartModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleStartChecklist = (template: ChecklistTemplate) => {
    setSelectedTemplate(template);
    setIsStartModalOpen(true);
  };

  const handleConfirmStart = async (propertyId: string, period: string, dueDate?: string) => {
    if (selectedTemplate) {
      const run = await onStartChecklist(selectedTemplate.id, propertyId, period, dueDate);
      setIsStartModalOpen(false);
      setSelectedTemplate(null);
      if (run?.id) {
        onChecklistStarted(run.id);
      }
    }
  };

  const handleCreateTemplate = async (name: string, type: string, description: string) => {
    await onCreateTemplate(name, type, description);
    await onRefresh();
    setIsCreateModalOpen(false);
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      fall: '🍂 Fall',
      spring: '🌷 Spring',
      monthly: '📅 Monthly',
      quarterly: '📊 Quarterly',
      custom: '✏️ Custom',
    };
    return labels[type] || type;
  };

  const groupedTemplates = templates.reduce((acc, template) => {
    const type = template.type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(template);
    return acc;
  }, {} as Record<string, ChecklistTemplate[]>);

  const typeOrder = ['fall', 'spring', 'monthly', 'quarterly', 'custom'];

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Custom Checklist
        </Button>
      </div>

      {typeOrder.map((type) => {
        const typeTemplates = groupedTemplates[type];
        if (!typeTemplates || typeTemplates.length === 0) return null;

        return (
          <div key={type}>
            <h2 className="text-lg font-semibold text-foreground mb-4">{getTypeLabel(type)} Checklists</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {typeTemplates.map((template) => (
                <ChecklistTemplateCard
                  key={template.id}
                  template={template}
                  onStart={() => handleStartChecklist(template)}
                />
              ))}
            </div>
          </div>
        );
      })}

      {templates.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No checklist templates yet. Create your first custom checklist!
        </div>
      )}

      <StartChecklistModal
        open={isStartModalOpen}
        onOpenChange={setIsStartModalOpen}
        template={selectedTemplate}
        onConfirm={handleConfirmStart}
      />

      <CreateTemplateModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onConfirm={handleCreateTemplate}
      />
    </div>
  );
};

export default ChecklistTemplatesTab;
