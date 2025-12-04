import { useState } from 'react';
import { ChecklistTemplate } from '@/hooks/useChecklistManagement';
import ChecklistTemplateCard from './ChecklistTemplateCard';
import StartChecklistModal from './StartChecklistModal';

interface ChecklistTemplatesTabProps {
  templates: ChecklistTemplate[];
  onStartChecklist: (templateId: string, propertyId: string, period: string, dueDate?: string) => Promise<any>;
}

const ChecklistTemplatesTab = ({ templates, onStartChecklist }: ChecklistTemplatesTabProps) => {
  const [selectedTemplate, setSelectedTemplate] = useState<ChecklistTemplate | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleStartChecklist = (template: ChecklistTemplate) => {
    setSelectedTemplate(template);
    setIsModalOpen(true);
  };

  const handleConfirmStart = async (propertyId: string, period: string, dueDate?: string) => {
    if (selectedTemplate) {
      await onStartChecklist(selectedTemplate.id, propertyId, period, dueDate);
      setIsModalOpen(false);
      setSelectedTemplate(null);
    }
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

      <StartChecklistModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        template={selectedTemplate}
        onConfirm={handleConfirmStart}
      />
    </div>
  );
};

export default ChecklistTemplatesTab;
