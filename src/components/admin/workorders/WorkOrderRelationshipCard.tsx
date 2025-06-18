
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  Folder, 
  CheckSquare, 
  ExternalLink, 
  Plus,
  Link
} from 'lucide-react';
import { WorkOrder } from '@/hooks/useWorkOrderManagement';

interface WorkOrderRelationshipCardProps {
  workOrder: WorkOrder;
  onCreateProject: () => void;
  onCreateTask: () => void;
  onLinkToProject: () => void;
  onNavigateToProperty?: () => void;
  onNavigateToProject?: () => void;
  onNavigateToTask?: () => void;
}

const WorkOrderRelationshipCard = ({
  workOrder,
  onCreateProject,
  onCreateTask,
  onLinkToProject,
  onNavigateToProperty,
  onNavigateToProject,
  onNavigateToTask,
}: WorkOrderRelationshipCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link className="h-5 w-5" />
          Relationships
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Property Relationship */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-blue-500" />
            <span className="font-medium">Property:</span>
            {workOrder.property ? (
              <Badge variant="outline" className="gap-1">
                {workOrder.property.title}
                {onNavigateToProperty && (
                  <ExternalLink 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={onNavigateToProperty}
                  />
                )}
              </Badge>
            ) : (
              <span className="text-muted-foreground">None</span>
            )}
          </div>
        </div>

        {/* Project Relationship */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Folder className="h-4 w-4 text-green-500" />
            <span className="font-medium">Project:</span>
            {workOrder.project_id ? (
              <Badge variant="outline" className="gap-1">
                Linked to Project
                {onNavigateToProject && (
                  <ExternalLink 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={onNavigateToProject}
                  />
                )}
              </Badge>
            ) : (
              <span className="text-muted-foreground">None</span>
            )}
          </div>
          <div className="flex gap-1">
            {!workOrder.project_id && (
              <>
                <Button size="sm" variant="outline" onClick={onCreateProject}>
                  <Plus className="h-3 w-3 mr-1" />
                  Create
                </Button>
                <Button size="sm" variant="outline" onClick={onLinkToProject}>
                  <Link className="h-3 w-3 mr-1" />
                  Link
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Task Relationship */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4 text-purple-500" />
            <span className="font-medium">Task:</span>
            {workOrder.task ? (
              <Badge variant="outline" className="gap-1">
                {workOrder.task.title}
                {onNavigateToTask && (
                  <ExternalLink 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={onNavigateToTask}
                  />
                )}
              </Badge>
            ) : (
              <span className="text-muted-foreground">None</span>
            )}
          </div>
          <Button size="sm" variant="outline" onClick={onCreateTask}>
            <Plus className="h-3 w-3 mr-1" />
            Create Follow-up
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="pt-2 border-t">
          <div className="text-sm font-medium mb-2">Quick Actions:</div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={onCreateProject}>
              <Plus className="h-3 w-3 mr-1" />
              New Project
            </Button>
            <Button size="sm" variant="outline" onClick={onCreateTask}>
              <Plus className="h-3 w-3 mr-1" />
              Follow-up Task
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkOrderRelationshipCard;
