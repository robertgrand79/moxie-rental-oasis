import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ChecklistTemplate } from '@/hooks/useChecklistManagement';
import ChecklistTemplateCard from './ChecklistTemplateCard';
import StartChecklistModal from './StartChecklistModal';
import TemplateEditorModal from './TemplateEditorModal';

interface CategoryWithItems {
  name: string;
  items: { title: string; description: string }[];
}

interface ChecklistTemplatesTabProps {
  templates: ChecklistTemplate[];
  onStartChecklist: (templateId: string, propertyId: string, period: string, dueDate?: string) => Promise<any>;
  onChecklistStarted: (runId: string) => void;
  onSaveTemplate: (data: { name: string; type: string; description: string; categories: CategoryWithItems[] }, templateId?: string) => Promise<any>;
  onDeleteTemplate: (templateId: string) => Promise<boolean>;
  onRefresh: () => Promise<any>;
}

const ChecklistTemplatesTab = ({ 
  templates, 
  onStartChecklist, 
  onChecklistStarted,
  onSaveTemplate,
  onDeleteTemplate,
  onRefresh
}: ChecklistTemplatesTabProps) => {
  const [selectedTemplate, setSelectedTemplate] = useState<ChecklistTemplate | null>(null);
  const [isStartModalOpen, setIsStartModalOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ChecklistTemplate | null>(null);

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

  const handleCreateNew = () => {
    setEditingTemplate(null);
    setIsEditorOpen(true);
  };

  const handleEditTemplate = (template: ChecklistTemplate) => {
    setEditingTemplate(template);
    setIsEditorOpen(true);
  };

  const handleSaveTemplate = async (data: { name: string; type: string; description: string; categories: CategoryWithItems[] }) => {
    await onSaveTemplate(data, editingTemplate?.id);
    setIsEditorOpen(false);
    setEditingTemplate(null);
  };

  const handleDeleteTemplate = async (templateId: string) => {
    await onDeleteTemplate(templateId);
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

  const typeOrder = ['monthly', 'quarterly', 'fall', 'spring', 'custom'];

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <Button onClick={handleCreateNew} className="gap-2">
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
                  onEdit={() => handleEditTemplate(template)}
                  onDelete={() => handleDeleteTemplate(template.id)}
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

      <TemplateEditorModal
        open={isEditorOpen}
        onOpenChange={setIsEditorOpen}
        template={editingTemplate}
        onSave={handleSaveTemplate}
      />
    </div>
  );
};

export default ChecklistTemplatesTab;
