import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Home, CheckCircle2, Circle, AlertTriangle, Wrench } from 'lucide-react';
import { ChecklistRun, ChecklistTemplate, ItemCompletion } from '@/hooks/useChecklistManagement';
import ChecklistItemRow from './ChecklistItemRow';
import ChecklistSummaryModal from './ChecklistSummaryModal';

interface ExtendedCompletion extends ItemCompletion {
  photos?: string[];
  needs_work?: boolean;
}

interface ChecklistRunViewProps {
  run: ChecklistRun;
  template: ChecklistTemplate | null;
  onToggleItem: (completionId: string, isCompleted: boolean, runId: string) => Promise<void>;
  onUpdateCompletion?: (completionId: string, updates: { notes?: string; photos?: string[]; needs_work?: boolean }) => Promise<boolean>;
  onCreateWorkOrder?: (propertyId: string, items: { title: string; description: string; notes?: string; photos?: string[] }[]) => Promise<void>;
  onBack: () => void;
}

const ChecklistRunView = ({ run, template, onToggleItem, onUpdateCompletion, onCreateWorkOrder, onBack }: ChecklistRunViewProps) => {
  const [updating, setUpdating] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState(false);

  const items = template?.items || [];
  const completions = (run.completions || []) as ExtendedCompletion[];
  
  const completionMap = new Map<string, ExtendedCompletion>();
  completions.forEach((c) => completionMap.set(c.item_id, c));

  const categories = [...new Set(items.map((item) => item.category))];

  const completedCount = completions.filter((c) => c.is_completed).length;
  const progress = completions.length > 0
    ? Math.round((completedCount / completions.length) * 100)
    : 0;

  const needsWorkItems = items.filter((item) => {
    const completion = completionMap.get(item.id);
    return completion?.needs_work;
  });

  const flaggedItems = needsWorkItems.map((item) => ({
    item,
    completion: completionMap.get(item.id)!,
  }));

  const handleToggle = async (completion: ExtendedCompletion) => {
    setUpdating(completion.id);
    await onToggleItem(completion.id, !completion.is_completed, run.id);
    setUpdating(null);
  };

  const handleUpdateCompletion = async (completionId: string, updates: { notes?: string; photos?: string[]; needs_work?: boolean }) => {
    if (onUpdateCompletion) {
      await onUpdateCompletion(completionId, updates);
    }
  };

  const handleCreateWorkOrders = async (selectedItems: typeof flaggedItems, combined: boolean) => {
    if (!onCreateWorkOrder) return;

    if (combined) {
      // Create single combined work order
      const description = selectedItems
        .map((f) => `• ${f.item.title}${f.completion.notes ? `: ${f.completion.notes}` : ''}`)
        .join('\n');
      const allPhotos = selectedItems.flatMap((f) => f.completion.photos || []);

      await onCreateWorkOrder(run.property_id, [{
        title: `Checklist Issues - ${template?.name || 'Maintenance'}`,
        description,
        photos: allPhotos,
      }]);
    } else {
      // Create individual work orders
      const workOrders = selectedItems.map((f) => ({
        title: `${f.item.category}: ${f.item.title}`,
        description: f.item.description || '',
        notes: f.completion.notes || undefined,
        photos: f.completion.photos || [],
      }));

      await onCreateWorkOrder(run.property_id, workOrders);
    }
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      fall: '🍂',
      spring: '🌷',
      monthly: '📅',
      quarterly: '📊',
      custom: '✏️',
    };
    return icons[type] || '📋';
  };

  const getCategoryProgress = (category: string) => {
    const categoryItems = items.filter((i) => i.category === category);
    const completedCount = categoryItems.filter((item) => {
      const completion = completionMap.get(item.id);
      return completion?.is_completed;
    }).length;
    return { completed: completedCount, total: categoryItems.length };
  };

  const getCategoryNeedsWork = (category: string) => {
    const categoryItems = items.filter((i) => i.category === category);
    return categoryItems.some((item) => {
      const completion = completionMap.get(item.id);
      return completion?.needs_work;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{getTypeIcon(template?.type || '')}</span>
            <h2 className="text-xl font-bold">{template?.name}</h2>
          </div>
          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
            <Home className="h-3.5 w-3.5" />
            {run.property?.title}
            <span>•</span>
            <span>{run.period}</span>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Overall Progress</CardTitle>
            <div className="flex items-center gap-2">
              {needsWorkItems.length > 0 && (
                <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {needsWorkItems.length} needs work
                </Badge>
              )}
              <Badge variant={progress === 100 ? 'default' : 'secondary'}>
                {progress}% Complete
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={progress} className="h-3" />
          <div className="flex items-center justify-between mt-2">
            <p className="text-sm text-muted-foreground">
              {completedCount} of {completions.length} items completed
            </p>
            {needsWorkItems.length > 0 && (
              <Button variant="outline" size="sm" onClick={() => setShowSummary(true)}>
                <Wrench className="h-4 w-4 mr-2" />
                Review Issues
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {categories.map((category) => {
          const categoryProgress = getCategoryProgress(category);
          const isComplete = categoryProgress.completed === categoryProgress.total;
          const hasNeedsWork = getCategoryNeedsWork(category);

          return (
            <Card key={category}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    {isComplete ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : hasNeedsWork ? (
                      <AlertTriangle className="h-5 w-5 text-amber-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                    {category}
                  </CardTitle>
                  <span className="text-sm text-muted-foreground">
                    {categoryProgress.completed}/{categoryProgress.total}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {items
                    .filter((item) => item.category === category)
                    .map((item) => {
                      const completion = completionMap.get(item.id);
                      if (!completion) return null;

                      return (
                        <ChecklistItemRow
                          key={item.id}
                          item={item}
                          completion={completion}
                          isUpdating={updating === completion.id}
                          onToggleComplete={() => handleToggle(completion)}
                          onUpdateCompletion={(updates) => handleUpdateCompletion(completion.id, updates)}
                        />
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <ChecklistSummaryModal
        open={showSummary}
        onOpenChange={setShowSummary}
        flaggedItems={flaggedItems}
        propertyId={run.property_id}
        propertyTitle={run.property?.title || 'Property'}
        checklistName={template?.name || 'Checklist'}
        onCreateWorkOrders={handleCreateWorkOrders}
      />
    </div>
  );
};

export default ChecklistRunView;
