
import React, { useState } from 'react';
import { useTaskManagement, Task } from '@/hooks/useTaskManagement';
import TaskManagementHeader from '@/components/admin/tasks/TaskManagementHeader';
import TaskKanbanBoard from '@/components/admin/tasks/TaskKanbanBoard';
import CreateTaskModal from '@/components/admin/tasks/CreateTaskModal';
import CreateProjectModal from '@/components/admin/tasks/CreateProjectModal';
import LoadingState from '@/components/ui/loading-state';

const AdminTaskManagement = () => {
  const {
    projects,
    tasks,
    loading,
    createProject,
    createTask,
    updateTask,
    deleteTask,
  } = useTaskManagement();

  const [view, setView] = useState<'kanban' | 'table' | 'calendar'>('kanban');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const completedTasks = tasks.filter(task => task.status === 'done').length;

  const handleTaskClick = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleStatusChange = async (taskId: string, status: string) => {
    try {
      await updateTask(taskId, { 
        status, 
        completed_at: status === 'done' ? new Date().toISOString() : null 
      });
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const handleCreateTask = async (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'project'>) => {
    if (editingTask) {
      await updateTask(editingTask.id, taskData);
      setEditingTask(null);
    } else {
      await createTask(taskData);
    }
  };

  const handleCreateProject = async (projectData: any) => {
    try {
      await createProject(projectData);
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      await deleteTask(taskId);
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6">
      <TaskManagementHeader
        totalTasks={tasks.length}
        completedTasks={completedTasks}
        onCreateTask={() => {
          setEditingTask(null);
          setIsTaskModalOpen(true);
        }}
        onCreateProject={() => setIsProjectModalOpen(true)}
        view={view}
        onViewChange={setView}
      />

      {view === 'kanban' && (
        <TaskKanbanBoard
          tasks={tasks}
          onTaskClick={handleTaskClick}
          onStatusChange={handleStatusChange}
          onDeleteTask={handleDeleteTask}
        />
      )}

      {view === 'table' && (
        <div className="bg-white rounded-lg p-6 border">
          <p className="text-gray-500">Table view coming soon...</p>
        </div>
      )}

      {view === 'calendar' && (
        <div className="bg-white rounded-lg p-6 border">
          <p className="text-gray-500">Calendar view coming soon...</p>
        </div>
      )}

      <CreateTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        onCreateTask={handleCreateTask}
        projects={projects}
        editingTask={editingTask}
      />

      <CreateProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onCreateProject={handleCreateProject}
      />
    </div>
  );
};

export default AdminTaskManagement;
