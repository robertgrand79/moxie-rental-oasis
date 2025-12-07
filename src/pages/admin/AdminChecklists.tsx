import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClipboardList, PlayCircle, History } from 'lucide-react';
import { useChecklistManagement } from '@/hooks/useChecklistManagement';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { useWorkOrderManagement } from '@/hooks/useWorkOrderManagement';
import { useToast } from '@/hooks/use-toast';
import LoadingState from '@/components/ui/loading-state';
import ChecklistTemplatesTab from '@/components/admin/checklists/ChecklistTemplatesTab';
import ActiveChecklistsTab from '@/components/admin/checklists/ActiveChecklistsTab';
import ChecklistHistoryTab from '@/components/admin/checklists/ChecklistHistoryTab';

const AdminChecklists = () => {
  const [activeTab, setActiveTab] = useState('templates');
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const { 
    templates, runs, loading, startChecklist, toggleItemCompletion, 
    updateItemCompletion, deleteRun, saveTemplateWithItems, deleteTemplate, refreshData 
  } = useChecklistManagement();
  const { createWorkOrder } = useWorkOrderManagement();
  const { organization } = useCurrentOrganization();
  const { toast } = useToast();

  if (loading) {
    return <LoadingState variant="page" message="Loading checklists..." />;
  }

  const activeRuns = runs.filter((r) => r.status !== 'completed');
  const completedRuns = runs.filter((r) => r.status === 'completed');

  const handleChecklistStarted = (runId: string) => {
    setSelectedRunId(runId);
    setActiveTab('active');
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab !== 'active') {
      setSelectedRunId(null);
    }
  };

  const handleSaveTemplate = async (
    data: { name: string; type: string; description: string; categories: { name: string; items: { title: string; description: string }[] }[] },
    templateId?: string
  ) => {
    return await saveTemplateWithItems(data, templateId);
  };

  const handleCreateWorkOrders = async (
    propertyId: string,
    items: { title: string; description: string; notes?: string; photos?: string[] }[]
  ) => {
    for (const item of items) {
      await createWorkOrder({
        property_id: propertyId,
        title: item.title,
        description: item.notes ? `${item.description}\n\nNotes: ${item.notes}` : item.description,
        priority: 'medium',
        status: 'pending',
      });
    }
    toast({ title: 'Success', description: `Created ${items.length} work order(s)` });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Maintenance Checklists</h1>
        <p className="text-muted-foreground">Manage seasonal and periodic maintenance checklists for your properties</p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="active" className="flex items-center gap-2">
            <PlayCircle className="h-4 w-4" />
            Active ({activeRuns.length})
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="mt-6">
          <ChecklistTemplatesTab 
            templates={templates} 
            onStartChecklist={startChecklist}
            onChecklistStarted={handleChecklistStarted}
            onSaveTemplate={handleSaveTemplate}
            onDeleteTemplate={deleteTemplate}
            onRefresh={refreshData}
          />
        </TabsContent>

        <TabsContent value="active" className="mt-6">
          <ActiveChecklistsTab 
            runs={activeRuns} 
            templates={templates}
            onToggleItem={toggleItemCompletion}
            onUpdateCompletion={updateItemCompletion}
            onDeleteRun={deleteRun}
            onCreateWorkOrder={handleCreateWorkOrders}
            initialSelectedRunId={selectedRunId}
            onClearSelection={() => setSelectedRunId(null)}
          />
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <ChecklistHistoryTab runs={completedRuns} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminChecklists;
