
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';
import { PropertyTask } from '@/hooks/property-management/types';

interface PropertyManagementAlertsProps {
  tasks: PropertyTask[];
  overdueTasks: number;
  getPriorityBadgeColor: (priority: string) => string;
}

const PropertyManagementAlerts = ({
  tasks,
  overdueTasks,
  getPriorityBadgeColor,
}: PropertyManagementAlertsProps) => {
  if (overdueTasks === 0) {
    return null;
  }

  const overdueTasks = tasks.filter(task => 
    task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed'
  );

  return (
    <Card className="border-red-200 bg-red-50">
      <CardHeader>
        <CardTitle className="text-red-800 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Overdue Tasks ({overdueTasks.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {overdueTasks.slice(0, 3).map((task) => (
            <div key={task.id} className="flex items-center justify-between p-2 bg-white rounded">
              <div>
                <span className="font-medium">{task.title}</span>
                {task.property && (
                  <span className="text-sm text-gray-600 ml-2">
                    - {task.property.title}
                  </span>
                )}
              </div>
              <Badge className={getPriorityBadgeColor(task.priority)}>
                {task.priority}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyManagementAlerts;
