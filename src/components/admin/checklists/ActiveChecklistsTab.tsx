import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Trash2, ChevronRight, Home } from 'lucide-react';
import { ChecklistRun, ChecklistTemplate } from '@/hooks/useChecklistManagement';
import ChecklistRunView from './ChecklistRunView';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ActiveChecklistsTabProps {
  runs: ChecklistRun[];
  templates: ChecklistTemplate[];
  onToggleItem: (completionId: string, isCompleted: boolean, runId: string) => Promise<void>;
  onDeleteRun: (runId: string) => Promise<void>;
}

const ActiveChecklistsTab = ({ runs, templates, onToggleItem, onDeleteRun }: ActiveChecklistsTabProps) => {
  const [selectedRun, setSelectedRun] = useState<ChecklistRun | null>(null);
  const [deleteConfirmRun, setDeleteConfirmRun] = useState<ChecklistRun | null>(null);

  const getProgress = (run: ChecklistRun) => {
    const completions = run.completions || [];
    if (completions.length === 0) return 0;
    const completed = completions.filter((c) => c.is_completed).length;
    return Math.round((completed / completions.length) * 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'not_started':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
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

  if (selectedRun) {
    const template = templates.find((t) => t.id === selectedRun.template_id);
    return (
      <ChecklistRunView
        run={selectedRun}
        template={template || null}
        onToggleItem={onToggleItem}
        onBack={() => setSelectedRun(null)}
      />
    );
  }

  if (runs.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No active checklists. Start one from the Templates tab.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid gap-4">
        {runs.map((run) => {
          const progress = getProgress(run);
          const completions = run.completions || [];
          const completedCount = completions.filter((c) => c.is_completed).length;

          return (
            <Card key={run.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getTypeIcon(run.template?.type || '')}</span>
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        {run.template?.name}
                        <Badge variant="outline" className={getStatusColor(run.status)}>
                          {run.status.replace('_', ' ')}
                        </Badge>
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                        <Home className="h-3.5 w-3.5" />
                        {run.property?.title}
                        <span>•</span>
                        <span>{run.period}</span>
                        {run.due_date && (
                          <>
                            <span>•</span>
                            <span>Due: {new Date(run.due_date).toLocaleDateString()}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteConfirmRun(run)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {completedCount} of {completions.length} items completed
                    </span>
                    <span className="font-medium">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setSelectedRun(run)}
                  >
                    {run.status === 'not_started' ? 'Start Working' : 'Continue'}
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <AlertDialog open={!!deleteConfirmRun} onOpenChange={() => setDeleteConfirmRun(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Checklist?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this checklist run and all completion records. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteConfirmRun) {
                  onDeleteRun(deleteConfirmRun.id);
                  setDeleteConfirmRun(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ActiveChecklistsTab;
