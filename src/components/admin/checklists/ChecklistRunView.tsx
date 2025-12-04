import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Home, CheckCircle2, Circle } from 'lucide-react';
import { ChecklistRun, ChecklistTemplate, ItemCompletion } from '@/hooks/useChecklistManagement';

interface ChecklistRunViewProps {
  run: ChecklistRun;
  template: ChecklistTemplate | null;
  onToggleItem: (completionId: string, isCompleted: boolean, runId: string) => Promise<void>;
  onBack: () => void;
}

const ChecklistRunView = ({ run, template, onToggleItem, onBack }: ChecklistRunViewProps) => {
  const [updating, setUpdating] = useState<string | null>(null);

  const items = template?.items || [];
  const completions = run.completions || [];
  
  const completionMap = new Map<string, ItemCompletion>();
  completions.forEach((c) => completionMap.set(c.item_id, c));

  const categories = [...new Set(items.map((item) => item.category))];

  const progress = completions.length > 0
    ? Math.round((completions.filter((c) => c.is_completed).length / completions.length) * 100)
    : 0;

  const handleToggle = async (completion: ItemCompletion) => {
    setUpdating(completion.id);
    await onToggleItem(completion.id, !completion.is_completed, run.id);
    setUpdating(null);
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
            <Badge variant={progress === 100 ? 'default' : 'secondary'}>
              {progress}% Complete
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={progress} className="h-3" />
          <p className="text-sm text-muted-foreground mt-2">
            {completions.filter((c) => c.is_completed).length} of {completions.length} items completed
          </p>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {categories.map((category) => {
          const categoryProgress = getCategoryProgress(category);
          const isComplete = categoryProgress.completed === categoryProgress.total;

          return (
            <Card key={category}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    {isComplete ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
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
                        <div
                          key={item.id}
                          className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                            completion.is_completed
                              ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                              : 'bg-card border-border hover:bg-accent/50'
                          }`}
                        >
                          <Checkbox
                            checked={completion.is_completed}
                            disabled={updating === completion.id}
                            onCheckedChange={() => handleToggle(completion)}
                            className="mt-0.5"
                          />
                          <div className="flex-1 min-w-0">
                            <p
                              className={`font-medium ${
                                completion.is_completed ? 'line-through text-muted-foreground' : 'text-foreground'
                              }`}
                            >
                              {item.title}
                            </p>
                            {item.description && (
                              <p className="text-sm text-muted-foreground mt-0.5">{item.description}</p>
                            )}
                            {completion.completed_at && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Completed {new Date(completion.completed_at).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ChecklistRunView;
