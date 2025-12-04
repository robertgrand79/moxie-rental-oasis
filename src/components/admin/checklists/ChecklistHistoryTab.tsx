import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Home, Calendar } from 'lucide-react';
import { ChecklistRun } from '@/hooks/useChecklistManagement';

interface ChecklistHistoryTabProps {
  runs: ChecklistRun[];
}

const ChecklistHistoryTab = ({ runs }: ChecklistHistoryTabProps) => {
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

  if (runs.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No completed checklists yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {runs.map((run) => {
        const completions = run.completions || [];
        const completedCount = completions.filter((c) => c.is_completed).length;

        return (
          <Card key={run.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getTypeIcon(run.template?.type || '')}</span>
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      {run.template?.name}
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Completed
                      </Badge>
                    </CardTitle>
                    <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Home className="h-3.5 w-3.5" />
                        {run.property?.title}
                      </span>
                      <span>•</span>
                      <span>{run.period}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{completedCount} items completed</span>
                {run.completed_at && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    Completed on {new Date(run.completed_at).toLocaleDateString()}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default ChecklistHistoryTab;
