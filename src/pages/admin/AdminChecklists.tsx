import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClipboardList, PlayCircle, History } from 'lucide-react';
import { useChecklistManagement } from '@/hooks/useChecklistManagement';
import { useOrganization } from '@/hooks/useOrganization';
import { useToast } from '@/hooks/use-toast';
import LoadingState from '@/components/ui/loading-state';
import ChecklistTemplatesTab from '@/components/admin/checklists/ChecklistTemplatesTab';
import ActiveChecklistsTab from '@/components/admin/checklists/ActiveChecklistsTab';
import ChecklistHistoryTab from '@/components/admin/checklists/ChecklistHistoryTab';

const AdminChecklists = () => {
  const [activeTab, setActiveTab] = useState('templates');
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const { templates, runs, loading, startChecklist, toggleItemCompletion, deleteRun, createTemplate, refreshData } = useChecklistManagement();
  const { organization } = useOrganization();
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
    // Clear selection when manually changing tabs
    if (tab !== 'active') {
      setSelectedRunId(null);
    }
  };

  const handleCreateTemplate = async (name: string, type: string, description: string) => {
    if (!organization?.id) {
      toast({ title: 'Error', description: 'No organization found', variant: 'destructive' });
      return null;
    }
    const newTemplate = await createTemplate(name, type, description, organization.id);
    if (newTemplate) {
      await refreshData();
    }
    return newTemplate;
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
            onCreateTemplate={handleCreateTemplate}
            onRefresh={refreshData}
          />
        </TabsContent>

        <TabsContent value="active" className="mt-6">
          <ActiveChecklistsTab 
            runs={activeRuns} 
            templates={templates}
            onToggleItem={toggleItemCompletion} 
            onDeleteRun={deleteRun}
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
