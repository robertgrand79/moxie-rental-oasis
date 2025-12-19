import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  ClipboardList, 
  PlayCircle, 
  History, 
  Plus,
  Search,
  LayoutGrid,
  List,
  RefreshCw,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { useChecklistManagement } from '@/hooks/useChecklistManagement';
import { useWorkOrderManagement } from '@/hooks/useWorkOrderManagement';
import { useToast } from '@/hooks/use-toast';
import LoadingState from '@/components/ui/loading-state';
import ChecklistTemplateCard from './ChecklistTemplateCard';
import StartChecklistModal from './StartChecklistModal';
import TemplateEditorModal from './TemplateEditorModal';
import ActiveChecklistsDrawer from './dialogs/ActiveChecklistsDrawer';
import ChecklistHistoryDrawer from './dialogs/ChecklistHistoryDrawer';
import { ChecklistTemplate } from '@/hooks/useChecklistManagement';

interface CategoryWithItems {
  name: string;
  items: { title: string; description: string }[];
}

const ModernChecklistsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Modal/Drawer states
  const [selectedTemplate, setSelectedTemplate] = useState<ChecklistTemplate | null>(null);
  const [isStartModalOpen, setIsStartModalOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ChecklistTemplate | null>(null);
  const [activeDrawerOpen, setActiveDrawerOpen] = useState(false);
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);

  const { 
    templates, runs, loading, startChecklist, toggleItemCompletion, 
    updateItemCompletion, deleteRun, saveTemplateWithItems, deleteTemplate, refreshData 
  } = useChecklistManagement();
  const { createWorkOrder } = useWorkOrderManagement();
  const { toast } = useToast();

  const activeRuns = runs.filter((r) => r.status !== 'completed');
  const completedRuns = runs.filter((r) => r.status === 'completed');

  // Calculate stats
  const stats = useMemo(() => {
    const totalTemplates = templates.length;
    const activeCount = activeRuns.length;
    const completedCount = completedRuns.length;
    const inProgressCount = activeRuns.filter(r => r.status === 'in_progress').length;
    
    return { totalTemplates, activeCount, completedCount, inProgressCount };
  }, [templates, activeRuns, completedRuns]);

  // Filter templates
  const filteredTemplates = useMemo(() => {
    let result = templates;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(t => 
        t.name.toLowerCase().includes(query) ||
        t.description?.toLowerCase().includes(query)
      );
    }

    if (typeFilter !== 'all') {
      result = result.filter(t => t.type === typeFilter);
    }

    return result;
  }, [templates, searchQuery, typeFilter]);

  // Group templates by type
  const groupedTemplates = useMemo(() => {
    return filteredTemplates.reduce((acc, template) => {
      const type = template.type;
      if (!acc[type]) acc[type] = [];
      acc[type].push(template);
      return acc;
    }, {} as Record<string, ChecklistTemplate[]>);
  }, [filteredTemplates]);

  const typeOrder = ['monthly', 'quarterly', 'fall', 'spring', 'custom'];

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

  if (loading) {
    return <LoadingState variant="page" message="Loading checklists..." />;
  }

  const handleStartChecklist = (template: ChecklistTemplate) => {
    setSelectedTemplate(template);
    setIsStartModalOpen(true);
  };

  const handleConfirmStart = async (propertyId: string, period: string, dueDate?: string) => {
    if (selectedTemplate) {
      const run = await startChecklist(selectedTemplate.id, propertyId, period, dueDate);
      setIsStartModalOpen(false);
      setSelectedTemplate(null);
      if (run?.id) {
        setSelectedRunId(run.id);
        setActiveDrawerOpen(true);
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
    await saveTemplateWithItems(data, editingTemplate?.id);
    setIsEditorOpen(false);
    setEditingTemplate(null);
  };

  const handleDeleteTemplate = async (templateId: string) => {
    await deleteTemplate(templateId);
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
      {/* Modern Header */}
      <div className="space-y-4">
        {/* Title, Stats, and Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Maintenance Checklists</h1>
            {/* Inline Stats */}
            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1.5">
                <ClipboardList className="h-4 w-4" />
                <span className="font-medium text-foreground">{stats.totalTemplates}</span> Templates
              </span>
              <span className="flex items-center gap-1.5">
                <PlayCircle className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-600">{stats.activeCount}</span> Active
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-yellow-600" />
                <span className="font-medium text-yellow-600">{stats.inProgressCount}</span> In Progress
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-600">{stats.completedCount}</span> Completed
              </span>
            </div>
          </div>
          
          {/* Right side: Secondary actions + Create */}
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => setActiveDrawerOpen(true)}
                    className="relative"
                  >
                    <PlayCircle className="h-4 w-4" />
                    {stats.activeCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-blue-600 text-[10px] text-white flex items-center justify-center">
                        {stats.activeCount}
                      </span>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Active Checklists</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => setHistoryDrawerOpen(true)}
                  >
                    <History className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>History</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Button onClick={handleCreateNew}>
              <Plus className="h-4 w-4 mr-2" />
              Create Checklist
            </Button>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-card rounded-xl p-4 border shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Left side: Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="fall">Fall</SelectItem>
                  <SelectItem value="spring">Spring</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Right side: View Controls */}
            <div className="flex items-center gap-2">
              <div className="flex items-center border rounded-lg p-1 bg-background">
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="h-8 w-8 p-0"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="h-8 w-8 p-0"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
              
              <Button variant="outline" size="sm" onClick={refreshData} className="h-8 w-8 p-0">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Templates Content */}
      {filteredTemplates.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">No checklist templates found</p>
              <p className="text-sm mt-1">
                {searchQuery || typeFilter !== 'all' 
                  ? 'Try adjusting your search or filters' 
                  : 'Create your first custom checklist to get started'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
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
                      onEdit={() => handleEditTemplate(template)}
                      onDelete={() => handleDeleteTemplate(template.id)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {template.type === 'fall' ? '🍂' : 
                       template.type === 'spring' ? '🌷' : 
                       template.type === 'monthly' ? '📅' : 
                       template.type === 'quarterly' ? '📊' : '✏️'}
                    </span>
                    <div>
                      <h3 className="font-medium">{template.name}</h3>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEditTemplate(template)}>
                      Edit
                    </Button>
                    <Button size="sm" onClick={() => handleStartChecklist(template)}>
                      Start
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modals */}
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

      {/* Drawers */}
      <ActiveChecklistsDrawer 
        open={activeDrawerOpen} 
        onOpenChange={setActiveDrawerOpen}
        runs={activeRuns}
        templates={templates}
        onToggleItem={toggleItemCompletion}
        onUpdateCompletion={updateItemCompletion}
        onDeleteRun={deleteRun}
        onCreateWorkOrder={handleCreateWorkOrders}
        initialSelectedRunId={selectedRunId}
        onClearSelection={() => setSelectedRunId(null)}
      />
      
      <ChecklistHistoryDrawer 
        open={historyDrawerOpen} 
        onOpenChange={setHistoryDrawerOpen}
        runs={completedRuns}
      />
    </div>
  );
};

export default ModernChecklistsPage;
